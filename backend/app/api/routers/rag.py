from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Dict, Any

from app.services.ingestion import process_and_store_document

router = APIRouter(tags=["rag"])

@router.post("/upload-document")
async def upload_document(
    file: UploadFile = File(...),
    user_id: str = Form(...)
) -> Dict[str, Any]:
    """
    Uploads a PDF document, extracts text, generates embeddings locally,
    and stores them in Supabase pgvector.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    try:
        # Read file bytes into memory
        file_bytes = await file.read()
        
        # Process and store chunks
        chunks_stored = process_and_store_document(
            file_bytes=file_bytes,
            filename=file.filename,
            user_id=user_id
        )
        
        return {
            "status": "success",
            "message": f"Successfully processed '{file.filename}'",
            "chunks_stored": chunks_stored
        }
    
    except ValueError as ve:
        # Expected errors like unreadable PDFs
        raise HTTPException(status_code=400, detail=str(ve))
    
    except Exception as e:
        # Unexpected server errors
        print(f"Error processing document: {e}")
        raise HTTPException(
            status_code=500, 
            detail="An internal server error occurred during document processing. Check server logs."
        )
