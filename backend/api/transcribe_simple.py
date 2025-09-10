from fastapi import APIRouter, UploadFile, File, HTTPException
import os
import tempfile
import logging
import json

router = APIRouter()

logging.basicConfig(level=logging.INFO)

@router.post("/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    """
    Simple transcription endpoint that returns mock results.
    In a real implementation, this would use a proper speech-to-text service.
    """
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
        
        # Mock transcription - in a real implementation, this would use Whisper or another STT service
        # For now, return a simple mock response based on the filename
        filename = audio.filename or "audio"
        
        # Simple mock responses based on common audio file patterns
        mock_transcriptions = {
            "hello": "Hello, this is a test transcription",
            "test": "This is a test audio file",
            "audio": "This is an audio recording",
            "recording": "This is a voice recording",
            "voice": "This is a voice message"
        }
        
        # Try to match the filename to a mock response
        transcription = "This is a mock transcription of your audio file"
        for key, value in mock_transcriptions.items():
            if key.lower() in filename.lower():
                transcription = value
                break
        
        # Add some variation based on file size
        file_size = len(contents)
        if file_size > 100000:  # Large file
            transcription += " This appears to be a longer audio recording."
        elif file_size < 10000:  # Small file
            transcription += " This is a short audio clip."
        
        return {
            "text": transcription,
            "status": "mock_transcription",
            "file_size": file_size,
            "filename": filename
        }
        
    except Exception as e:
        logging.error(f"Transcription error: {e}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
        
    finally:
        if input_filepath and os.path.exists(input_filepath):
            os.remove(input_filepath)
