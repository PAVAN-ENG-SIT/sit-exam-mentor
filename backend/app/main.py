"""
FastAPI Backend  —  backend/app/main.py
Multi-model chat via OpenRouter + health endpoint.
"""

from dotenv import load_dotenv
load_dotenv()                     # ← loads backend/.env BEFORE any import reads env vars

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routers.chat import router as chat_router
from app.api.routers.rag import router as rag_router

# ── App instance ─────────────────────────────────────────────
app = FastAPI(
    title="SIT Exam Mentor API",
    version="0.2.0",
)

# ── CORS ─────────────────────────────────────────────────────
# Allow requests from the Vite dev server
origins = [
    "http://localhost:5173",   # Vite default
    "http://127.0.0.1:5173",
    "http://localhost:3000",   # fallback CRA / alt port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────
app.include_router(chat_router)
app.include_router(rag_router, prefix="/api")


# ── Health endpoint ──────────────────────────────────────────
@app.get("/api/health")
async def health_check():
    """Simple health probe – proves the frontend can talk to the backend."""
    return {
        "status": "ok",
        "message": "Backend is talking to Frontend 🚀",
    }
