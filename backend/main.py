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

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import tempfile
import logging
import asyncio

from api.signwriting_translation_pytorch import router as signwriting_translation_pytorch_router
from api.simplify_text import router as simplify_text_router
from api.pose_generation import router as pose_generation_router
from api.transcribe import router as transcribe_router
from config import config

app = FastAPI()

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

app.include_router(transcribe_router)

app.include_router(signwriting_translation_pytorch_router)
app.include_router(simplify_text_router)
app.include_router(pose_generation_router)

if __name__ == "__main__":
    uvicorn.run(app, host=config.HOST, port=config.PORT, reload=config.DEBUG)
