# SignBridge Frontend (React + TypeScript + Vite + Tauri)

This project is a cross-platform Edge app built with React, TypeScript, Vite, and Tauri. It can run as a modern web app in the browser or as a native desktop app (Windows, macOS, Linux) using Tauri.

---

## 🚀 Getting Started

### 1. **Backend Requirement**
- **You must have the backend server running** for the app to function (both in browser and Tauri desktop modes).
- See the backend's `README.md` for setup and run instructions.
- _Tip: In the future, the backend and frontend will be bundled together for a seamless experience. For now, you must run the backend manually._

### 2. **Environment Configuration**

The frontend uses environment variables for configuration. Copy `env.example` to `.env` and configure the following:

#### Required Environment Variables

```bash
# Backend API Configuration
VITE_BACKEND_URL=http://127.0.0.1:8000

# Feature Flags
VITE_ENABLE_TEXT_SIMPLIFICATION=true
VITE_ENABLE_POSE_GENERATION=true
VITE_ENABLE_SYSTEM_AUDIO=true

# UI Configuration
VITE_DEFAULT_SIGN_SIZE=24
VITE_MAX_RECORDING_TIME=300
VITE_ANIMATION_FPS=30

# Development Configuration
VITE_DEBUG=true
VITE_LOG_LEVEL=info
```

#### Setup Environment

1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` and configure:
   - `VITE_BACKEND_URL`: URL of your backend server
   - Feature flags to enable/disable functionality
   - UI settings for sign size, recording limits, etc.

---

## 🌐 Running in the Browser (Web Only)

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Start the backend:**
   - See backend/README.md for details.
3. **Run the frontend in dev mode:**
   ```sh
   npm run dev
   ```
   - Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🖥️ Running as a Tauri Desktop App (Cross-Platform)

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Rust & Cargo](https://www.rust-lang.org/tools/install)
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites/):
  ```sh
  npm install -g @tauri-apps/cli
  ```
- Backend running at the configured URL

### Steps
1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Start the backend:**
   - See backend/README.md for details.
   - Example:
     ```sh
     cd ../backend
     source py311_venv/bin/activate
     python run_backend.py
     ```
3. **Run the Tauri app:**
   ```sh
   npm run tauri:dev
   ```
   - This will launch the desktop app. The frontend will be served by Vite at `http://localhost:5173` and Tauri will wrap it as a native app.

4. **Build for production (native desktop app):**
   ```sh
   npm run build
   ```
   - The built app will be in `src-tauri/target/release/bundle/` for your platform.

---

## ⚙️ Configuration

The frontend uses a centralized configuration system in `src/config.ts` that loads all settings from environment variables. This makes it easy to:

- Configure backend API endpoints
- Enable/disable features via feature flags
- Adjust UI settings like sign sizes and recording limits
- Control development settings and logging

### API Endpoints

The configuration automatically generates API endpoints based on the backend URL:

- `TRANSCRIBE`: `${BACKEND_URL}/transcribe`
- `SIMPLIFY_TEXT`: `${BACKEND_URL}/simplify_text`
- `TRANSLATE_SIGNWRITING`: `${BACKEND_URL}/translate_signwriting`
- `GENERATE_POSE`: `${BACKEND_URL}/generate_pose`

---

## ⚠️ Notes
- The backend **must** be running at the configured URL for the app to function.
- In the future, the backend and frontend will be bundled together for a seamless experience. For now, run the backend manually (see backend/README.md).
- For cross-platform builds, see the Tauri documentation and backend/README.md for backend packaging.

---

## 🛠️ Development
- Lint: `npm run lint`
- Build frontend only: `npm run build:frontend`
- Preview production build: `npm run preview`

## 🌐 Production Testing

### Serve Production Build in Browser
Test the production build locally before deploying:

```bash
# Build and serve production version
npm run build:and:serve

# Or do it step by step:
npm run build:frontend
npm run serve:production

# Kill the server if needed
npm run serve:production:kill

# Restart the server
npm run serve:production:restart
```

**Available Scripts:**
- `npm run serve:production` - Serve the production build at http://localhost:3000
- `npm run serve:production:kill` - Kill any running server on port 3000
- `npm run serve:production:restart` - Kill and restart the server
- `npm run build:and:serve` - Build frontend and serve production version

**Note:** Make sure the backend is running at the configured URL for full functionality.

---

## 📦 Project Structure
- `src/` - React app source code
- `src/config.ts` - Configuration and environment variables
- `src-tauri/` - Tauri config and Rust source for desktop app
- `dist/` - Production build output (from Vite)

---

## 📚 References
- [Tauri Documentation](https://tauri.app/)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
