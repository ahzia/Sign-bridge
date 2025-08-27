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

model = None
model_initialized = False

def get_model():
    """Initialize and return the Whisper model using NPU acceleration."""
    global model, model_initialized
    if model is not None and model_initialized:
        logging.info("Using existing Whisper model instance.")
        return model
    else:
        logging.info("Loading Whisper model on NPU...")
        
        # Check if onnxruntime-qnn is available
        import onnxruntime
        available_providers = onnxruntime.get_available_providers()
        qnn_available = 'QNNExecutionProvider' in available_providers
        logging.info(f"🔍 Available providers: {available_providers}")
        logging.info(f"🔍 QNN available: {qnn_available}")
        
        if not qnn_available:
            raise ImportError("QNNExecutionProvider not available. NPU acceleration required.")
        
        logging.info("🔄 Loading Whisper model on NPU...")
        logging.info(f"🔍 Encoder path: {config.WHISPER_ENCODER_PATH}")
        logging.info(f"🔍 Decoder path: {config.WHISPER_DECODER_PATH}")
        
        # Check if model files exist
        import os
        if not os.path.exists(config.WHISPER_ENCODER_PATH):
            raise FileNotFoundError(f"Encoder model not found: {config.WHISPER_ENCODER_PATH}")
        if not os.path.exists(config.WHISPER_DECODER_PATH):
            raise FileNotFoundError(f"Decoder model not found: {config.WHISPER_DECODER_PATH}")
        
        # Create custom NPU wrapper that bypasses the onnxruntime-qnn check
        class CustomNPUWrapper:
            def __init__(self, model_path):
                self.model_path = model_path
                self.providers = ['QNNExecutionProvider']
                logging.info(f"🔧 CustomNPUWrapper initialized with path: {model_path}")
            
            def __call__(self):
                import onnxruntime as ort
                logging.info(f"🔧 Creating ONNX session for: {self.model_path}")
                session_options = ort.SessionOptions()
                try:
                    session = ort.InferenceSession(
                        self.model_path, 
                        session_options, 
                        providers=self.providers
                    )
                    logging.info(f"✅ ONNX session created successfully")
                    return session
                except Exception as e:
                    logging.error(f"❌ Failed to create ONNX session: {e}")
                    raise
        
        logging.info("🔧 Creating WhisperApp with custom NPU wrappers...")
        try:
            model = WhisperApp(
                CustomNPUWrapper(config.WHISPER_ENCODER_PATH),
                CustomNPUWrapper(config.WHISPER_DECODER_PATH),
                num_decoder_blocks=6,
                num_decoder_heads=8,
                attention_dim=512,
                mean_decode_len=224,
            )
            logging.info("✅ WhisperApp created successfully")
        except Exception as e:
            logging.error(f"❌ Failed to create WhisperApp: {e}")
            raise
        logging.info("✅ Whisper model loaded successfully on NPU")
        
        model_initialized = True
        return model

def get_model_status():
    """Get the current status of the Whisper model."""
    return {
        "model_loaded": model is not None
    }

@router.get("/model-status")
async def model_status():
    """Get the current status of the Whisper model."""
    return get_model_status()

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

        # Load Whisper model directly (no initialization check needed)
        try:
            model = get_model()
            result = model.transcribe(input_filepath)
            transcription = result
        except Exception as e:
            raise HTTPException(
                status_code=503, 
                detail=f"AI model failed to load: {str(e)}"
            )

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
