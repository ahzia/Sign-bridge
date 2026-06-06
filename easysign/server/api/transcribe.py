import logging
import os
import re
import tempfile

import whisper
from fastapi import APIRouter, File, HTTPException, UploadFile

router = APIRouter()
logger = logging.getLogger("easysign-server")

_whisper_model = None


def get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        logger.info("Loading Whisper model")
        _whisper_model = whisper.load_model("base")
    return _whisper_model


def load_whisper_at_startup():
    get_whisper_model()


@router.post("/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    input_filepath = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(audio.filename or "")[-1]) as input_file:
            contents = await audio.read()
            if not contents:
                raise HTTPException(status_code=400, detail="Empty audio file uploaded.")
            input_file.write(contents)
            input_filepath = input_file.name

        model = get_whisper_model()
        result = model.transcribe(input_filepath)
        transcription = result["text"].strip()

        cleaned_lines = []
        for line in transcription.splitlines():
            cleaned_line = re.sub(r"\[\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3}\]", "", line).strip()
            if cleaned_line:
                cleaned_lines.append(cleaned_line)

        return {"text": " ".join(cleaned_lines)}
    finally:
        if input_filepath and os.path.exists(input_filepath):
            os.remove(input_filepath)
