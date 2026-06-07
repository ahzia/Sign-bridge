# HONESTY.md — EuroTech Hong Kong Hackathon (HealthTech)

This document states what is **real**, **partial**, or **mocked** in the **EasySign** submission.  
Judges: if anything here is unclear, ask us in the pitch.

**Submission root:** this `easysign/` directory — **EasySign** + **EasySign Care**

---

## What is real and working

| Component | Status | Notes |
|-----------|--------|-------|
| **EasySign Care — live visit** | Real | Staff console (`/care/staff`) and patient kiosk (`/care/patient`) sync in real time via browser `BroadcastChannel` and a shared room code. Tested on one machine with two windows (split screen or second monitor). |
| **Staff phrase board** | Real | 21 preset clinical phrases (staff → patient). Selecting a phrase runs the sign pipeline and updates the patient screen. |
| **Staff custom voice / text** | Real | Staff can record speech (English STT) or type a message; output is sent to the patient kiosk as text + sign animation. |
| **Patient gesture → staff alert** | Real | Patient camera uses on-device hand-gesture recognition; mapped to a hospital gesture pack with triage priority. Staff sees a persistent alert overlay (up to 3 minutes or until acknowledged). |
| **Visit log** | Real | Timestamped staff messages and patient gestures on the staff console. |
| **English speech-to-text** | Real | Local Whisper model on the backend. |
| **Cantonese speech-to-text** | Real | Requires `ELEVENLABS_API_KEY` (cloud API). |
| **Cantonese → English** | Real | Requires `OPENAI_API_KEY` (cloud API). Used as a localization layer before the sign pipeline. |
| **Text → SignWriting** | Real | Runs **locally** on the backend using a **university research model** (see Research background below). |
| **Text → sign animation** | Real (demo config) | Generated through our **backend animation endpoint** and displayed in the web UI. Requires network for animation generation in the current demo build. |
| **Main EasySign translate UI** | Real | English and Cantonese input modes; SignWriting + animation output. Unchanged by EasySign Care. |

---

## What is partial, simplified, or not built

| Item | Status | Notes |
|------|--------|-------|
| **Hong Kong Sign Language (HKSL) native pipeline** | Partial | Cantonese/English text is converted to signs via an **English-mediated research pipeline** today. We do **not** claim direct Cantonese → HKSL. HK localization is at speech + subtitle layers. |
| **Two separate laptops over Wi‑Fi** | Not built | Live sync uses `BroadcastChannel` (same browser origin). Suitable for split screen, two windows, or second monitor on one machine. |
| **EHR / FHIR / Hospital Authority integration** | Mocked / not built | No live connection to eHealth, HL7, or patient records. Visit log is in-browser only (no export to PDF yet). |
| **Custom hospital-trained gesture model** | Simplified | Clinical meanings are mapped onto built-in camera gesture labels for demo purposes, not a hospital-trained custom model. |
| **Replacing certified interpreters** | Not claimed | EasySign Care is positioned as a **bridge until a sign language interpreter arrives**, not a replacement for certified professionals. |
| **Patient-side text-to-speech** | Intentionally off | Patient kiosk shows **visual signs and text only** (deaf/HoH users). No audio playback on the patient screen. |

---

## Research background (sign pipeline)

The **text → SignWriting** step is based on **university research** by a team member on translating spoken language into sign notation. For this hackathon we:

- Integrated that research model into the EasySign backend
- Extended the product with **Cantonese input** (speech → translation → sign pipeline)
- Wrapped it in **EasySign Care** for hospital staff ↔ deaf patient communication

Sign **animation** is produced through our integrated backend and web rendering pipeline. We do not document third-party animation or notation libraries in this submission; the focus is the clinical workflow and the research-derived translation core.

---

## API keys and secrets

| Secret | Required for | Committed to repo? |
|--------|----------------|-------------------|
| `OPENAI_API_KEY` | Cantonese → English | **No** — use `.env.example` |
| `ELEVENLABS_API_KEY` | Cantonese STT | **No** |
| `DEEPGRAM_API_KEY` | Optional fallback | **No** |

**Never commit `.env`.** Copy `.env.example` to `.env` in this directory locally.

---

## Hackathon deliverables

| Deliverable | Location |
|-------------|----------|
| Source code | `easysign/` in the GitHub repository |
| `HONESTY.md` | `easysign/HONESTY.md` (this file) |
| Setup & run instructions | [`README.md`](./README.md) |
| Pitch plan | [`PITCH_AND_NEXT_STEPS.md`](./PITCH_AND_NEXT_STEPS.md) |
| 2-minute business video | Submitted separately (not in repo) |
| 2-minute technical video | Submitted separately (not in repo) |
| Live pitch | In-person (2 minutes) |

---

## How to verify the demo

1. Start backend and frontend (see [`README.md`](./README.md)).
2. Open **EasySign Care** → **Open staff console** + **Open patient screen** (same room code).
3. Staff: tap a preset phrase or record custom speech → patient sees text + animation (silent).
4. Patient: hold a closed fist → staff sees critical alert until acknowledged.

---

## Contact / team

See repository contributors and hackathon submission form for team names.

*Last updated: June 2026 — EuroTech Hong Kong Hackathon, HealthTech track*
