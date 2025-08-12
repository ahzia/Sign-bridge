# Build Process Documentation

## Overview

This document explains the build process for SignBridge and why certain files are excluded from version control.

## 🚫 **Files Not Committed to Git**

### **Why These Files Are Ignored:**

1. **Large Binary Files**: Backend executable is 139MB
2. **Platform-Specific**: Different executables for different platforms
3. **Build Artifacts**: Generated during build process
4. **Reproducible Builds**: Should be built fresh each time

### **Ignored Directories:**
```
# Tauri build artifacts
frontend/src-tauri/resources/     # Backend executable (139MB)
frontend/src-tauri/target/        # Rust build output
frontend/src-tauri/bundle/        # Final app bundles

# Backend build artifacts  
backend/dist/                     # PyInstaller output
backend/build/                    # PyInstaller build cache
backend/*.spec                    # PyInstaller spec files
```

## 🔧 **Build Process**

### **Development:**
```bash
# Uses script approach for convenience
./scripts/start_app.sh
```

### **Production:**
```bash
cd frontend
npm run build:production
```

### **What Production Build Does:**
1. **Compiles Backend**: Creates standalone executable
2. **Copies to Resources**: Places in `frontend/src-tauri/resources/`
3. **Builds Tauri App**: Creates final installer
4. **Generates Artifacts**: DMG, EXE, AppImage files

## 📦 **Generated Files**

### **After Production Build:**
```
frontend/src-tauri/resources/
└── backend                    # 139MB executable (macOS)
    # or backend.exe          # 139MB executable (Windows)

frontend/src-tauri/target/release/bundle/
├── macos/
│   └── SignBridge.app/       # macOS app bundle
└── dmg/
    └── SignBridge_0.1.0_aarch64.dmg  # macOS installer
```

## 🏗️ **CI/CD Integration**

### **GitHub Actions Example:**
```yaml
name: Build and Release

on:
  push:
    tags: ['v*']

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [macos-latest, windows-latest, ubuntu-latest]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: |
        cd backend
        python -m venv py311_venv
        source py311_venv/bin/activate
        pip install -r requirements.txt
        
        cd ../frontend
        npm install
    
    - name: Build production app
      run: |
        cd frontend
        npm run build:production
    
    - name: Upload artifacts
      uses: actions/upload-artifact@v3
      with:
        name: SignBridge-${{ matrix.os }}
        path: frontend/src-tauri/target/release/bundle/
```

## 🎯 **Benefits of This Approach**

### **For Version Control:**
- ✅ **Small Repository**: No large binary files
- ✅ **Fast Cloning**: Quick repository downloads
- ✅ **Clean History**: No build artifacts in commits
- ✅ **Cross-Platform**: Different builds for different platforms

### **For Development:**
- ✅ **Reproducible**: Fresh builds every time
- ✅ **Consistent**: Same build process everywhere
- ✅ **Automated**: CI/CD handles builds
- ✅ **Flexible**: Easy to update dependencies

### **For Distribution:**
- ✅ **Professional**: Standard build process
- ✅ **Reliable**: Consistent output
- ✅ **Automated**: No manual build steps
- ✅ **Scalable**: Easy to add platforms

## 📋 **Best Practices**

### **For Developers:**
1. **Never commit** `resources/` directory
2. **Always build** from source in CI/CD
3. **Test builds** locally before pushing
4. **Update dependencies** in requirements.txt

### **For CI/CD:**
1. **Build fresh** every time
2. **Cache dependencies** (not build artifacts)
3. **Test artifacts** before release
4. **Sign executables** for distribution

## 🔍 **Troubleshooting**

### **Common Issues:**
- **Missing backend**: Run `npm run build:production`
- **Large commits**: Check `.gitignore` is working
- **Build failures**: Verify dependencies are installed
- **Platform issues**: Ensure correct target platform

### **Verification Commands:**
```bash
# Check if resources are ignored
git status --ignored

# Verify build process
cd frontend && npm run build:production

# Check generated files
ls -la src-tauri/resources/
ls -la src-tauri/target/release/bundle/
```

## 📝 **Conclusion**

The build process is designed to be:
- **Reproducible**: Same output every time
- **Automated**: No manual intervention needed
- **Clean**: No build artifacts in version control
- **Professional**: Standard industry practices

**Key Takeaway**: Build artifacts are generated, not stored. This keeps the repository clean and ensures consistent, reproducible builds across all environments. 