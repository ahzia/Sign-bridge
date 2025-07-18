# Detailed Tauri Integration Plan for SignBridge

## 1. Install Tauri CLI and Dependencies
- Install Tauri CLI as a dev dependency:
  ```
  npm install --save-dev @tauri-apps/cli
  ```
- Install Rust and Tauri CLI globally (if not already installed):
  ```
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
  cargo install tauri-cli
  ```

## 2. Initialize Tauri in Frontend Directory
- From the `frontend` directory, run:
  ```
  npx tauri init
  ```
- This scaffolds the Tauri project inside the frontend folder.
- Configure `tauri.conf.json` as needed (e.g., app name, window size).

## 3. Update package.json Scripts
- Replace Vite dev/build scripts with Tauri equivalents:
  ```json
  "scripts": {
    "dev": "tauri dev",
    "build": "tauri build",
    "lint": "eslint .",
    "preview": "vite preview"
  }
  ```

## 4. Configure Python Backend as Tauri Sidecar
- Move or ensure the Python backend is in the `backend/` directory.
- In `tauri.conf.json`, add sidecar configuration:
  ```json
  "sidecar": {
    "backend": {
      "path": "../backend/py311_venv/bin/python",
      "args": ["-m", "uvicorn", "backend.main:app", "--host", "127.0.0.1", "--port", "8000"]
    }
  }
  ```
- Adjust paths and commands as per your environment.
- Ensure backend starts/stops with the Tauri app.

## 5. Adapt Frontend API Calls
- Update API base URLs in frontend code to use `http://127.0.0.1:8000` or the port used by the sidecar.
- This ensures frontend communicates with the backend sidecar.

## 6. Cross-Platform Packaging Setup
- Configure Tauri for Windows, macOS, Linux, and Snapdragon targets.
- Add platform-specific icons and metadata in `tauri.conf.json`.
- Prepare build scripts for each platform (e.g., `build-win.sh`, `build-mac.sh`).

## 7. Testing and QA
- Run `npm run dev` or `tauri dev` to test in development mode.
- Build installers with `npm run build` or `tauri build`.
- Test app startup, backend sidecar launch, API communication, and UI functionality on all target platforms.

## 8. Documentation Updates
- Update README with Tauri setup, build, and run instructions.
- Document backend sidecar configuration and troubleshooting tips.

---

This plan follows the existing phase8_tauri_integration.md and tailors it for your current project structure.

Please let me know if you want me to proceed with implementing these steps or assist with any specific part.
