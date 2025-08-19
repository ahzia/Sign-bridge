# Visual Studio Build Tools Setup Guide

## Current Status
✅ Visual Studio Build Tools 2022 installed  
⚠️ C++ components need to be added manually

## Manual Setup Required

### Step 1: Open Visual Studio Installer
1. Press `Windows + R` and type: `"C:\Program Files (x86)\Microsoft Visual Studio\Installer\vs_installer.exe"`
2. Click OK to open the Visual Studio Installer

### Step 2: Modify Build Tools
1. In the installer, find "Build Tools 2022" 
2. Click the "Modify" button (gear icon)
3. In the Workloads tab, check:
   - **MSVC v143 - VS 2022 C++ x64/x86 build tools**
   - **Windows 10/11 SDK**
   - **CMake tools for Visual Studio**
4. Click "Modify" to install the components

### Step 3: Wait for Installation
- Installation may take 10-30 minutes
- Do not close the installer during this process

### Step 4: Verify Installation
After installation completes, open a **new** PowerShell window and run:
```powershell
where cl
# Should show: C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Tools\MSVC\[version]\bin\Hostx64\x64\cl.exe
```

## Alternative: Command Line Installation

If the GUI installer doesn't work, try this command:
```powershell
& "C:\Program Files (x86)\Microsoft Visual Studio\Installer\vs_installer.exe" modify --installPath "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools" --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended --passive --wait
```

## After C++ Components are Installed

Once the C++ compiler is available, run these commands:

```powershell
# Navigate to backend directory
cd C:\Users\ahzia\kick-start\Sign-bridge\backend

# Activate virtual environment
.\py311_venv\Scripts\Activate.ps1

# Install ML dependencies
pip install httptools
pip install git+https://github.com/openai/whisper.git
pip install git+https://github.com/sign-language-processing/signwriting-translation.git

# Test backend
python run_backend.py
```

## Troubleshooting

### If `cl` command is still not found:
1. Restart your computer
2. Open a new PowerShell window
3. Try the verification command again

### If installation fails:
1. Try running PowerShell as Administrator
2. Check Windows Update for any pending updates
3. Ensure you have sufficient disk space (at least 5GB free)

## Expected Results

After successful installation:
- ✅ `where cl` shows the compiler path
- ✅ `pip install httptools` succeeds
- ✅ `pip install git+https://github.com/openai/whisper.git` succeeds
- ✅ Backend starts without import errors

## Next Steps

Once the build tools are properly configured:
1. Complete the ML dependencies installation
2. Test the full backend functionality
3. Build the production version
4. Test the complete application

