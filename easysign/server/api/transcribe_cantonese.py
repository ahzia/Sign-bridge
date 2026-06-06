import logging
import os
import tempfile

import requests
from fastapi import APIRouter, File, HTTPException, UploadFile
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()
logger = logging.getLogger("easysign-server")

ELEVENLABS_STT_URL = "https://api.elevenlabs.io/v1/speech-to-text"


@router.post("/transcribe-cantonese")
async def transcribe_cantonese(audio: UploadFile = File(...)):
    api_key = os.getenv("ELEVENLABS_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="ElevenLabs API key not configured.")

    input_filepath = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(audio.filename or "")[-1]) as input_file:
            contents = await audio.read()
            if not contents:
                raise HTTPException(status_code=400, detail="Empty audio file uploaded.")
            input_file.write(contents)
            input_filepath = input_file.name

        with open(input_filepath, "rb") as f:
            response = requests.post(
                ELEVENLABS_STT_URL,
                headers={"xi-api-key": api_key},
                files={"file": (audio.filename or "recording.webm", f, audio.content_type or "audio/webm")},
                data={"model_id": "scribe_v1", "language_code": "yue"},
                timeout=120,
            )

        if not response.ok:
            raise HTTPException(status_code=503, detail=f"Cantonese transcription failed: {response.text}")

        result = response.json()
        text = result.get("text", "").strip()
        return {"text": text}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cantonese transcription error: {str(e)}")
    finally:
        if input_filepath and os.path.exists(input_filepath):
            os.remove(input_filepath)
