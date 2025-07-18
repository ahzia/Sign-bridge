# SignBridge Backend

## Overview

This backend provides the core API services for the SignBridge application, including:

- Offline speech-to-text transcription using the Python Whisper library
- Optional online text simplification via Groq API
- Text-to-SignWriting translation using the signwriting-translation package with PyTorch

## Features / Endpoints

### POST /transcribe

- Accepts: WAV audio file (multipart/form-data)
- Returns: JSON with transcribed text
- Uses: Python Whisper library for offline transcription

### POST /simplify_text

- Accepts: JSON with text string
- Returns: JSON with simplified text string
- Uses: Groq API for optional online text simplification

### POST /translate_signwriting

- Accepts: JSON with text string
- Returns: JSON with SignWriting notation string
- Uses: signwriting-translation PyTorch model for text-to-sign translation

## Setup

### System Dependencies

- **ffmpeg**: Required for audio file conversion in the /transcribe endpoint. Install it using your system package manager:
  - macOS: `brew install ffmpeg`
  - Ubuntu/Debian: `sudo apt-get install ffmpeg`
  - Windows: [Download from ffmpeg.org](https://ffmpeg.org/download.html) and add to PATH.

- **Python Whisper Library**: Used for speech-to-text transcription. The backend will automatically download the required model files on first use.

### Python 3.11 Environment

- Make sure you are in the backend folder

```bash
# Install Python 3.11 if not installed
brew install python@3.11

# Run setup script to create and activate Python 3.11 virtual environment and install dependencies
bash ./setup_py311_env.sh

# Activate the Python 3.11 environment
source py311_venv/bin/activate
```

## Running the Backend

When the desired environment is activated, run:

```bash
uvicorn main:app --reload
```

The backend will be available at `http://127.0.0.1:8000`.

## Notes

- The Python Whisper library will download model files as needed on first use.
- The Groq API key and URL should be configured in a `.env` file in the project root see `.env.example`.
- The text-to-SignWriting translation requires the Python 3.11 environment due to PyTorch compatibility.

## Testing

Test scripts are located in the `tests/` directory:

- `test_transcribe.py`
- `test_simplify_text.py`
- `test_translate_signwriting.py`

Run tests using the appropriate Python environment.

## License

This project is licensed under the MIT License.
