# EasySign

**Speech and text to sign language — made easy.**

**Hackathon submission:** EuroTech Hong Kong Hackathon — Munich 2026 · **HealthTech track**

EasySign converts spoken or typed language into visual sign notation and sign animation. **EasySign Care** adds a real-time **staff ↔ deaf patient** communication mode for clinical visits.

> **Honesty & scope:** See [`HONESTY.md`](./HONESTY.md) (**required for judging**).  
> **Pitch materials:** See [`PITCH_AND_NEXT_STEPS.md`](./PITCH_AND_NEXT_STEPS.md).

---

## Problem we solve

Deaf and hard-of-hearing patients in hospitals often cannot follow spoken instructions when no sign language interpreter is in the room. EasySign Care gives staff a **visual bridge** — preset clinical phrases, custom voice, and patient gestures — until an interpreter arrives.

**One-line pitch:** *EasySign Care is a real-time visual communication bridge between hospital staff and deaf patients.*

---

## Features

### EasySign (main app — `/`)

- English speech-to-text (local Whisper)
- **Cantonese mode:** Cantonese speech-to-text + translation to English (Hong Kong localization layer)
- Text → SignWriting (research-based local model — see Research below)
- Sign skeleton animation (backend pipeline)
- Light / dark theme

### EasySign Care (`/care`)

- **Live dual-screen visit:** staff console + patient kiosk, synced by room code
- **Staff:** preset clinical phrase board, custom voice recording, custom text, visit log
- **Patient:** large sign animation (no audio), gesture alerts to staff with triage priority
- **Hospital gesture pack:** e.g. closed fist → emergency alert on staff screen

---

## Research background

The **text → SignWriting** pipeline builds on **university research** by a team member on spoken-language-to-sign notation translation. For this project we:

1. Integrated and deployed that research model in the EasySign backend  
2. **Extended it with Cantonese input** (Cantonese speech → English meaning → sign pipeline)  
3. Built **EasySign Care** around it for hospital staff ↔ patient workflows  

Sign animation is rendered through our integrated backend and web UI pipeline. This submission focuses on the **clinical product** and **research-derived translation core**, not third-party library documentation.

---

## Project structure

```text
easysign/
├── web/      # React frontend (Vite) — EasySign + EasySign Care
├── server/   # FastAPI backend — STT, translation, sign pipeline
├── .env.example
└── README.md
```

---

## Setup

### Prerequisites

- **Python 3.11** (required for PyTorch on the backend)
- **Node.js 18+**
- API keys (see below) — **never commit `.env`**

### 1. Environment variables

```bash
cd easysign
cp .env.example .env
```

Fill in `easysign/.env`:

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | Cantonese → English translation |
| `ELEVENLABS_API_KEY` | Cantonese speech-to-text |
| `VITE_API_URL` | Frontend → backend URL (default `http://127.0.0.1:8000`) |

Optional: `DEEPGRAM_API_KEY` for STT fallback.

### 2. Backend

```bash
cd server
./setup_env.sh
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend

```bash
cd web
npm install
npm run dev
```

Open http://localhost:5173

---

## EasySign Care — live demo

| URL | Role |
|-----|------|
| `/care` | Start a live visit (launcher) |
| `/care/staff?room=XXXX` | Staff console |
| `/care/patient?room=XXXX` | Patient kiosk |

**Recommended demo setup:** two browser windows side by side (or patient window on a second monitor), same room code.

1. Main app → **EasySign Care** → **Open staff console**
2. **Open patient screen** (new window)
3. Staff: tap a phrase or record custom speech
4. Patient: show gestures (closed fist = emergency)

---

## Demo phrases (Cantonese / Hong Kong mode)

| Cantonese | English |
|-----------|---------|
| 請在這裡等候 | Please wait here. |
| 請向左走 | Please go left. |
| 你需要幫助嗎 | Do you need help? |
| 請出示身份證 | Please show your ID. |
| 醫生很快會來 | The doctor will come soon. |

---

## API endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Health check |
| `POST /transcribe` | English speech-to-text (local) |
| `POST /transcribe-cantonese` | Cantonese speech-to-text |
| `POST /translate-to-english` | Cantonese → English |
| `POST /translate_signwriting` | Text → SignWriting (research model) |
| `POST /generate_pose` | Text → sign animation |

---

## Hong Kong relevance

- **Cantonese input** for staff and main app (bilingual hospital context)
- **English + Cantonese subtitles** on patient-facing screens
- Bridge for **deaf/HoH patients** in HA and community care settings when interpreters are delayed
- Expandable to NGOs, care homes, and GBA cross-border care (see pitch doc)

We do **not** claim to replace certified sign language interpreters.

---

## Hackathon submission checklist

- [x] GitHub repository with source code
- [x] [`HONESTY.md`](./HONESTY.md) in this directory
- [x] Setup instructions (this file)
- [ ] 2-minute business video (submit separately)
- [ ] 2-minute technical demo video (submit separately)
- [ ] Live pitch (2 minutes)

---

## License

MIT License
