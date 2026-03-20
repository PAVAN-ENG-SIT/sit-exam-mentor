"""
FastAPI Backend  —  backend/app/main.py
Minimal setup w/ CORS for Checkpoint 3: Hello World connection.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ── App instance ─────────────────────────────────────────────
app = FastAPI(
    title="SIT Exam Mentor API",
    version="0.1.0",
)

# ── CORS ─────────────────────────────────────────────────────
# Allow requests from the Vite dev server
origins = [
    "http://localhost:5173",   # Vite default
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health endpoint ──────────────────────────────────────────
@app.get("/api/health")
async def health_check():
    """Simple health probe – proves the frontend can talk to the backend."""
    return {
        "status": "ok",
        "message": "Backend is talking to Frontend 🚀",
    }
