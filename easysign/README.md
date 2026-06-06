# EasySign

Speech and text to sign language — made easy.

**Repository:** [github.com/ahzia/EasySign](https://github.com/ahzia/EasySign)

EasySign converts spoken or typed language into SignWriting notation and sign language animation. It supports **English** and **Cantonese** input modes.

## Features

- English speech-to-text via Whisper
- Cantonese speech-to-text via ElevenLabs
- Cantonese to English translation via OpenAI
- Text to SignWriting notation
- Sign language skeleton animation
- Light / dark theme
- **Camera demo** (experimental): handshape → English for isolated signs

## Project structure

```text
easysign/
├── web/      # React frontend (Vite)
└── server/   # FastAPI backend
```

## Setup

### 1. Environment variables

Copy `.env.example` to `.env` in the `easysign/` folder:

```bash
cp .env.example .env
```

Fill in:

- `OPENAI_API_KEY` — Cantonese to English translation
- `ELEVENLABS_API_KEY` — Cantonese speech-to-text

### 2. Backend

```bash
cd server
./setup_env.sh          # uses Python 3.11 (required for PyTorch)
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

> **Note:** Use Python 3.11. The default `python3` on macOS may be 3.14, which is not compatible with `torch==2.0.1`.

### 3. Frontend

```bash
cd web
npm install
npm run dev
```

Open http://localhost:5173

## Demo phrases (Hong Kong mode)

| Cantonese | English |
|-----------|---------|
| 請在這裡等候 | Please wait here. |
| 請向左走 | Please go left. |
| 你需要幫助嗎 | Do you need help? |
| 請出示身份證 | Please show your ID. |
| 醫生很快會來 | The doctor will come soon. |

## API endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Health check |
| `POST /transcribe` | English speech-to-text |
| `POST /transcribe-cantonese` | Cantonese speech-to-text |
| `POST /translate-to-english` | Cantonese to English |
| `POST /translate_signwriting` | Text to SignWriting |
| `POST /generate_pose` | Text to sign animation |
