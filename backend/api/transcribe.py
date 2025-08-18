from fastapi import APIRouter, UploadFile, File, HTTPException
import os
import tempfile
import logging
import whisper  # Use OpenAI Whisper
from config import config

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, "..", "..")) 

logging.basicConfig(level=getattr(logging, config.LOG_LEVEL))

from qai_hub_models.models._shared.whisper.app import WhisperApp
from qai_hub_models.utils.onnx_torch_wrapper import OnnxModelTorchWrapper
import yaml 

def get_model():
    """Initialize and return the Whisper model."""

    model = WhisperApp(
        OnnxModelTorchWrapper.OnNPU(config.WHISPER_ENCODER_PATH),
        OnnxModelTorchWrapper.OnNPU(config.WHISPER_DECODER_PATH),
        num_decoder_blocks=6,
        num_decoder_heads=8,
        attention_dim=512,
        mean_decode_len=224,
    )

    return model


@router.post("/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    input_filepath = None
    try:
        # Save the uploaded file to a temporary location
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(audio.filename)[-1]) as input_file:
            contents = await audio.read()
            if not contents:
                raise HTTPException(status_code=400, detail="Empty audio file uploaded.")
            input_file.write(contents)
            input_filepath = input_file.name
        logging.info(f"Uploaded audio saved to temporary file: {input_filepath}")

        # Load Whisper model using configuration
        model = get_model()
        result = model.transcribe(input_filepath)
        transcription = result

        # Clean transcription to remove timestamps like [00:00:00.000 --> 00:00:04.240]
        import re
        cleaned_lines = []
        for line in transcription.splitlines():
            cleaned_line = re.sub(r"\[\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3}\]", "", line).strip()
            if cleaned_line:
                cleaned_lines.append(cleaned_line)
        cleaned_transcription = " ".join(cleaned_lines)
        logging.info(f"Transcription is: {cleaned_transcription}")
        return {"text": cleaned_transcription}

    finally:
        if input_filepath and os.path.exists(input_filepath):
            os.remove(input_filepath)
