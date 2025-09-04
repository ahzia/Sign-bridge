import glob
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
from qai_hub_models.utils.onnx_torch_wrapper import OnnxModelTorchWrapper, OnnxSessionOptions, QNNExecutionProviderOptions
import yaml 

model = None

import sys
import os
from pathlib import Path
if getattr(sys, 'frozen', False):
    print("Running in a bundled environment")
    path = Path(os.path.dirname(sys.executable)) / "_internal"
elif __file__:
    print("Running in a normal Python environment")
    path = Path(os.path.dirname(__file__)).parent
print("Determined path:", path)

def get_model():
    """Initialize and return the Whisper model."""
    global model
    if model is not None:
        logging.info("Using existing Whisper model instance.")
        return model
    else:
        logging.info("Loading Whisper model...")
        try:
            # session_options = OnnxSessionOptions(
            #     enable_cpu_mem_arena=True,
            #     enable_cpu_mem_pattern=True,
            #     disable_cpu_ep_fallback=True,
            #     context_enable=True,
            #     context_include_onnxfile_hash=True,
            #     context_embed_mode=False,
            #     context_file_path=None,
            #     context_node_name_prefix="ctx",
            #     share_ep_contexts=False,
            #     stop_share_ep_contexts=False,
            #     context_model_external_initializers_file_name=None,
            #     )
            # qNNExecutionProviderOptions = QNNExecutionProviderOptions(
            #     device_type="NPU",
            #     execution_mode="SUSTAINED_HIGH_PERFORMANCE",
            #     power_mode="HIGH_PERFORMANCE",
            #     cache_path=str(path / Path(config.WHISPER_ENCODER_PATH).parent),
            #     )
            session_options = OnnxSessionOptions()
            session_options.context_enable = False
            model = WhisperApp(
                OnnxModelTorchWrapper.OnCPU(path / Path(config.WHISPER_ENCODER_PATH), session_options=session_options),
                OnnxModelTorchWrapper.OnCPU(path / Path(config.WHISPER_DECODER_PATH), session_options=session_options),
                num_decoder_blocks=6,
                num_decoder_heads=8,
                attention_dim=512,
                mean_decode_len=224,
            )
        except Exception as e:
            logging.info(f"Failed to load Whisper model from cache: {e}")
            ctx_files = glob(str(Path(config.WHISPER_ENCODER_PATH).parent) + "/" + "*ctx*")
            for ctx_file in ctx_files:
                os.remove(ctx_file)
            model = WhisperApp(
                OnnxModelTorchWrapper.OnNPU(path / Path(config.WHISPER_ENCODER_PATH)),
                OnnxModelTorchWrapper.OnNPU(path / Path(config.WHISPER_DECODER_PATH)),
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
        return {"text": cleaned_transcription}

    finally:
        if input_filepath and os.path.exists(input_filepath):
            os.remove(input_filepath)
