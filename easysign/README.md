# EasySign

Speech and text to sign language — made easy.

EasySign is a web application that converts spoken or typed language into SignWriting notation and sign language animation.

## Project structure

```text
easysign/
├── web/      # React frontend (Vite)
└── server/   # FastAPI backend
```

## Quick start

### Backend

```bash
cd server
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd web
npm install
npm run dev
```

Open http://localhost:5173

## Environment variables

Copy `.env.example` to `.env` in the project root and fill in your API keys.
