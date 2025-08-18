from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import subprocess
import uuid
import os
import shutil
import uvicorn
import tempfile
import logging
import asyncio

# Conditionally import modules that may not be available
try:
    from api.signwriting_translation_pytorch import router as signwriting_translation_pytorch_router
    SIGNWRITING_AVAILABLE = True
except ImportError:
    print("⚠️  SignWriting translation not available (torch not installed)")
    SIGNWRITING_AVAILABLE = False

try:
    from api.simplify_text import router as simplify_text_router
    SIMPLIFY_AVAILABLE = True
except ImportError:
    print("⚠️  Text simplification not available")
    SIMPLIFY_AVAILABLE = False

try:
    from api.pose_generation import router as pose_generation_router
    POSE_AVAILABLE = True
except ImportError:
    print("⚠️  Pose generation not available")
    POSE_AVAILABLE = False

from api.ocr_transcription import router as ocr_router
from config import config

app = FastAPI(title="SignBridge Backend", description="Voice-to-Sign Translation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.get_cors_origins(),
    allow_credentials=config.CORS_ALLOW_CREDENTIALS,
    allow_methods=config.CORS_ALLOW_METHODS,
    allow_headers=config.CORS_ALLOW_HEADERS,
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, "..")) 

logging.basicConfig(level=getattr(logging, config.LOG_LEVEL))

@app.get("/")
async def root():
    """Root endpoint to test if the server is running"""
    return {
        "message": "SignBridge Backend is running!",
        "status": "operational",
        "version": "1.0.0",
        "features": {
            "transcribe": "Not available (Windows - use Mac version for voice-to-text)",
            "translate_signwriting": "Available ✅",
            "simplify_text": "Available (requires groq api key)",
            "pose_generation": "Available (requires pose api)",
            "ocr_transcription": "Available ✅ (NPU accelerated)"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "Backend is running"}

# Conditionally include routers
if SIGNWRITING_AVAILABLE:
    app.include_router(signwriting_translation_pytorch_router)
if SIMPLIFY_AVAILABLE:
    app.include_router(simplify_text_router)
if POSE_AVAILABLE:
    app.include_router(pose_generation_router)
app.include_router(ocr_router)

if __name__ == "__main__":
    print("🚀 Starting SignBridge Backend (With SignWriting & OCR)")
    print(f"📍 Server will be available at: http://{config.HOST}:{config.PORT}")
    print("✅ SignWriting translation is available")
    print("✅ OCR transcription is available (NPU accelerated)")
    print("⚠️  Voice-to-text not available on Windows (use Mac version)")
    print("⚠️  Text simplification requires GROQ_API_KEY")
    print("⚠️  Pose generation requires POSE_API_URL")
    print("-" * 60)
    
    uvicorn.run("main:app", host=config.HOST, port=config.PORT, reload=config.DEBUG)
