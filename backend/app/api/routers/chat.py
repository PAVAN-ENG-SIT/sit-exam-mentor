# backend/app/api/routers/chat.py
import os
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from sentence_transformers import SentenceTransformer
from supabase import create_client, Client

from app.services.openrouter import call_openrouter
from app.services.gemini import generate_gemini_response

router = APIRouter(tags=["chat"])

# Initialize Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client | None = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Initialize Embedding Model locally (same model used for ingestion)
model_name = "all-MiniLM-L6-v2"
embedding_model = SentenceTransformer(model_name)

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    model: str = "meta-llama/llama-3.1-8b-instruct"
    chat_id: str | None = None
    user_id: str | None = None

@router.post("/chat")
async def chat(request: ChatRequest):
    # 1. Extract the latest user query for RAG Context Retrieval
    user_query = ""
    for m in reversed(request.messages):
        if m.role == "user":
            user_query = m.content
            break

    citations = []
    retrieved_context = ""

    # 2. Perform Vector Search against Supabase pgvector
    if supabase and user_query:
        try:
            query_embedding = embedding_model.encode([user_query])[0].tolist()
            
            # Call RPC function created in Supabase SQL editor
            resp = supabase.rpc(
                "match_document_sections", 
                {
                    "query_embedding": query_embedding, 
                    "match_threshold": 0.75, 
                    "match_count": 5
                }
            ).execute()
            
            print("================= RAG DEBUG ===================")
            print(f"Retrieved chunks from RPC: {resp.data}")
            print("===============================================")
            
            if resp.data:
                contexts = []
                # Keep unique file references for citations
                seen_citations = set()
                
                for idx, chunk in enumerate(resp.data):
                    contexts.append(chunk["content"])
                    meta = chunk.get("metadata", {})
                    
                    cite_key = f"{meta.get('filename')}-{meta.get('page')}"
                    if cite_key not in seen_citations:
                        citations.append(meta)
                        seen_citations.add(cite_key)
                        
                retrieved_context = "\n\n".join(contexts)
        except Exception as e:
            print(f"RAG Retrieval Error: {e}")

    # 3. Augment Prompt with retrieved context
    openrouter_messages = []
    
    if retrieved_context:
        # Inject context into a system prompt
        openrouter_messages.append({
            "role": "system",
            "content": (
                "You are an expert exam mentor. Answer the user's question using strictly ONLY the provided Context Chunks from the database.\n"
                "If the specific answer is not written inside the Context Chunks, reply exactly with: 'I do not have enough context to answer that.'\n\n"
                f"### START OF CONTEXT CHUNKS ###\n{retrieved_context}\n### END OF CONTEXT CHUNKS ###"
            )
        })
        
    for m in request.messages:
        openrouter_messages.append({"role": m.role, "content": m.content})

    print("================== PROMPT LOG ==================")
    print(openrouter_messages)
    print("================================================")

    # 4. Call Local native API or fallback to OpenRouter
    try:
        if request.model.startswith("gemini"):
            reply = generate_gemini_response(openrouter_messages, request.model)
        else:
            reply = call_openrouter(
                messages=openrouter_messages,
                model=request.model,
            )
            
        return {
            "reply": reply,
            "citations": citations
        }
    except Exception as e:
        return {"error": str(e)}