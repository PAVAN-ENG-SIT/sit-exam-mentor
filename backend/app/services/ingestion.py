import os
import io
import pdfplumber
from typing import List, Dict, Any
from sentence_transformers import SentenceTransformer
from supabase import create_client, Client

# Initialize environment variables
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")  # Use your service_role key for backend operations

# Initialize Supabase client
supabase: Client | None = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Initialize SentenceTransformer (Downloads model on first run, ~80MB)
# 384 dimensions - perfect for free local embedding
model_name = "all-MiniLM-L6-v2"
embedding_model = SentenceTransformer(model_name)


def extract_text_from_pdf(file_bytes: bytes) -> List[Dict[str, Any]]:
    """Extracts text from a PDF strictly using pdfplumber."""
    try:
        pdf_file = io.BytesIO(file_bytes)
    except Exception as e:
        raise ValueError(f"Failed to read file bytes: {str(e)}")

    extracted_pages = []
    
    with pdfplumber.open(pdf_file) as pdf:
        for page_num, page in enumerate(pdf.pages):
            # extract_text can return None if the page is empty/scanned
            text = page.extract_text()
            if text:
                extracted_pages.append({
                    "page": page_num + 1,
                    "text": text.strip()
                })
            
    return extracted_pages


def chunk_text(text: str, chunk_size: int = 600, overlap: int = 100) -> List[str]:
    """Splits text into overlapping chunks optimized for production RAG context."""
    if not text:
        return []
        
    chunks = []
    start = 0
    text_length = len(text)
    
    while start < text_length:
        end = start + chunk_size
        chunks.append(text[start:end])
        # Move forward by the chunk size minus the overlap
        start += chunk_size - overlap
        
    return chunks


def get_embeddings(texts: List[str]) -> List[List[float]]:
    """Generates 384-dimensional embeddings locally for a list of text chunks."""
    if not texts:
        return []
        
    # Generate embeddings locally as a numpy array, then convert to python lists
    embeddings = embedding_model.encode(texts)
    return embeddings.tolist()


def process_and_store_document(file_bytes: bytes, filename: str, user_id: str) -> int:
    """End-to-end pipeline: Extract -> Chunk -> Embed -> Store."""
    if not supabase:
         raise ValueError("Supabase client not initialized. Check SUPABASE_URL and SUPABASE_KEY in .env")

    # 1. Extract text
    pages = extract_text_from_pdf(file_bytes)
    if not pages:
        raise ValueError("Could not extract any text from the PDF. It might be scanned, encrypted, or empty.")
    
    all_chunks_data = []
    
    # 2. Chunk text
    for page_data in pages:
        page_chunks = chunk_text(page_data["text"])
        for chunk in page_chunks:
            all_chunks_data.append({
                "content": chunk,
                "metadata": {
                    "filename": filename,
                    "page": page_data["page"]
                }
            })
            
    if not all_chunks_data:
        raise ValueError("Document yielded no text chunks after processing.")
        
    texts_to_embed = [chunk["content"] for chunk in all_chunks_data]
    
    print(f"Chunks generated: {len(texts_to_embed)}")
    
    embeddings = get_embeddings(texts_to_embed)
    
    if embeddings:
        print(f"Embedding length: {len(embeddings[0])}")
    
    # 4. Store in Supabase
    records_to_insert = []
    for i, chunk_data in enumerate(all_chunks_data):
        records_to_insert.append({
            "user_id": user_id,
            "content": chunk_data["content"],
            "metadata": chunk_data["metadata"],
            "embedding": embeddings[i]
        })
        
    # Batch insert to avoid payload limits
    batch_size = 100
    total_stored = 0
    
    for i in range(0, len(records_to_insert), batch_size):
        batch = records_to_insert[i:i + batch_size]
        result = supabase.table("document_sections").insert(batch).execute()
        total_stored += len(result.data)
        
    return total_stored
