# SignBridge: Real-Time Voice-to-Sign Translator

## Project Overview

**SignBridge** is a cross-platform Edge AI application that translates spoken English into animated SignWriting in real time. Designed for accessibility and inclusivity, SignBridge empowers Deaf and hard-of-hearing users to access spoken content—live or recorded—on any device, fully offline or with optional online enhancements.

- **Track:** Edge AI Consumer Utility Application (Snapdragon® X Elite)
- **Core Value:** Everyday utility for a broad audience, enabling real-time voice-to-sign translation on-device.
- **Edge AI:** All core AI runs locally (Whisper, PyTorch SignWriting Model, etc.), with optional cloud-based text simplification (Groq + LLaMA).
- **Cross-Platform:** Runs on Windows, macOS, Linux, and Snapdragon X Elite devices as a web or native desktop app (Tauri).

---

## Key Features

- **Speech-to-Text (Offline):**
  - Uses Whisper for fast, accurate, on-device transcription.
- **Optional Text Simplification (Online):**
  - Toggle to simplify complex sentences using Groq API + LLaMA models (for easier sign translation).
- **Text-to-SignWriting Translation(Offline):**
  - Converts English text to SignWriting notation using a Sign Writing model (runs locally).
- **SignWriting Rendering & Animation(Hybrid):**
  - Displays animated SignWriting using open web standards and custom components.
- **System & Mic Audio Input(Offline + Enhanced Foe Each Device):**
  - Capture from microphone and system audio for real-time translation of meetings, videos, etc.
- **Save & Export:**
  - Download SignWriting as SVG image.
- **Modern UI:**
  - Responsive, accessible, and themeable (light/dark mode).

---

## Quick Start Guide

### 1. **Clone the Repository**
```sh
git clone https://github.com/your-org/SignBridge.git
cd SignBridge
```

### 2. **Backend Setup**
- See [backend/README.md](./backend/README.md) for full details.
- Quick start:
  ```sh
  cd backend
  bash ./setup_py311_env.sh
  source py311_venv/bin/activate
  uvicorn main:app --host 127.0.0.1 --port 8000
  ```

### 3. **Frontend Setup**
- See [frontend/README.md](./frontend/README.md) for full details.
- Quick start:
  ```sh
  cd frontend
  npm install
  npm run dev
  # or for desktop app:
  npm run tauri:dev
  ```

- The app will be available at [http://localhost:5173](http://localhost:5173) (web) or as a native window (Tauri).

---

## Documentation
- [Frontend README](./frontend/README.md): UI, Tauri, and web app details
- [Backend README](./backend/README.md): API endpoints, Python setup, and model info

---

## Hackathon & Category Fit
- **Consumer-Oriented:** Designed for real-world accessibility and communication needs.
- **Utility-Focused:** Bridges the gap between spoken language and sign language in any setting.
- **Edge AI:** All core translation and rendering runs locally; no cloud required for main pipeline.
- **Fully On-Device:** Works offline; optional online features (text simplification) enhance experience.
- **Cross-Platform:** Runs on Snapdragon X Elite, Windows, macOS, and Linux.
- **LLaMA & Groq Integration:** Uses Groq API to accelerate LLaMA-based text simplification.

---

## Development Phases & Roadmap

See the [plan/](./plan/) directory for detailed phase documents.

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Speech-to-Text (Whisper) | ✅ Done |
| 2 | Text Simplification (Groq + LLaMA) | ✅ Done |
| 3 | Text-to-SignWriting Translation | ✅ Done |
| 4 | SignWriting Rendering | ✅ Done |
| 5 | 2D Skeleton Animation | ✅ Done |
| 6 | UI Packaging & Polish | ✅ Done |
| 7 | UI Enhancements | ✅ Done |
| 8 | Tauri Integration | ✅ Done |
| 9 | Cross-Platform Build Scripts | ✅ Done |
| 10 | Snapdragon Optimization | ⏳ In Progress |
| 11 | System Audio & Realtime | ⏳ In Progress |
| 12 | Settings & Metrics | ⏳ In Progress |
| 13 | Offline Pose Generation | ⏳ In Progress |

- **See [plan/](./plan/) for all phase docs and details.**
- **Completed phases:** 1–9
- **Current/Next:** 10–13 (Snapdragon, system audio, settings, offline pose)

---

## License
MIT License 