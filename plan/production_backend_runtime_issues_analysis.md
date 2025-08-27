# Production Backend Runtime Issues Analysis

## 🚨 **Critical Issues Identified**

### **Issue 1: Missing YAML Files in PyInstaller Bundle**
**Error**: `[Errno 2] No such file or directory: 'C:\\Users\\ahzia\\AppData\\Local\\Temp\\_MEI189522\\qai_hub_models\\asset_bases.yaml'`

**Root Cause**: 
- The `qai_hub_models` package requires `asset_bases.yaml` and `devices_and_chipsets.yaml` files to function
- These files are not being properly included in the PyInstaller bundle
- The current build script copies these files to the backend directory but doesn't ensure they're accessible in the bundled environment

**Impact**: 
- Speech-to-Text functionality fails to load
- NPU acceleration cannot be initialized
- Critical backend feature unavailable

### **Issue 2: TorchScript Source Access Problem**
**Error**: `Can't get source for <function interleaved_matmul_encdec_qk>. TorchScript requires source access in order to carry out compilation, make sure original .py files are available.`

**Root Cause**:
- The `signwriting_translation` package uses TorchScript compilation
- TorchScript requires access to the original Python source files for compilation
- In the PyInstaller bundle, the source files are not accessible in the expected locations
- The current build script copies source files to `temp_src/` but doesn't ensure proper module path resolution

**Impact**:
- Text-to-SignWriting functionality fails to load
- Translation features unavailable
- Core application functionality broken

### **Issue 3: Deprecated FastAPI Event Handler**
**Warning**: `on_event is deprecated, use lifespan event handlers instead`

**Root Cause**:
- Using deprecated `@app.on_event("startup")` instead of modern lifespan handlers
- This is a deprecation warning that should be addressed for future compatibility

**Impact**:
- Warning messages in logs
- Potential compatibility issues with future FastAPI versions

## 🔍 **Technical Analysis**

### **PyInstaller Bundle Structure**
The current bundle structure in `_MEI189522` (PyInstaller temp directory):
```
_MEI189522/
├── main.py
├── platform_detector.py
├── api/
├── config.py
├── models/
├── qai_hub_models/
│   ├── __init__.py
│   ├── models/
│   └── utils/
├── signwriting_translation/
├── sockeye/
└── temp_src/
    ├── signwriting_translation/
    ├── sockeye/
    └── qai_hub_models/
```

### **File Access Issues**
1. **YAML Files**: Located in `temp_src/qai_hub_models/` but `qai_hub_models` package expects them in its root directory
2. **Source Files**: TorchScript can't find original source files for compilation
3. **Module Paths**: Python modules can't resolve paths correctly in bundled environment

## 🛠️ **Proposed Solutions**

### **Solution 1: Fix YAML File Access**
**Approach**: Ensure YAML files are accessible in the correct location within the bundle

**Implementation**:
1. Modify `qai_hub_patch.py` to handle bundled environment properly
2. Update build script to place YAML files in correct locations
3. Add runtime path resolution for bundled files

### **Solution 2: Fix TorchScript Source Access**
**Approach**: Ensure TorchScript can access source files during compilation

**Implementation**:
1. Pre-compile TorchScript models during build process
2. Include compiled models instead of requiring runtime compilation
3. Alternative: Ensure source files are accessible in expected locations

### **Solution 3: Update FastAPI Event Handlers**
**Approach**: Replace deprecated event handlers with modern lifespan handlers

**Implementation**:
1. Replace `@app.on_event("startup")` with `@app.lifespan("startup")`
2. Update event handling to use modern FastAPI patterns

## 📋 **Implementation Plan**

### **Phase 1: Fix YAML File Access**
1. **Update `qai_hub_patch.py`**:
   - Add proper bundle detection
   - Implement file copying from bundle locations
   - Add fallback mechanisms for missing files

2. **Update `build_backend.py`**:
   - Ensure YAML files are placed in correct bundle locations
   - Add verification that files are accessible

3. **Test**: Verify YAML files are accessible in bundled environment

### **Phase 2: Fix TorchScript Compilation**
1. **Option A - Pre-compilation**:
   - Pre-compile TorchScript models during build
   - Include compiled models in bundle
   - Skip runtime compilation

2. **Option B - Source File Access**:
   - Ensure source files are in expected locations
   - Update module paths for bundled environment
   - Add runtime path resolution

3. **Test**: Verify TorchScript compilation works in bundled environment

### **Phase 3: Update FastAPI Handlers**
1. **Replace deprecated handlers**:
   - Update to modern lifespan handlers
   - Ensure backward compatibility
   - Test event handling

2. **Test**: Verify startup events work correctly

## 🔧 **Detailed Implementation**

### **Step 1: Enhanced qai_hub_patch.py**
```python
def patch_qai_hub_models():
    """Enhanced patch for qai_hub_models in bundled environment."""
    if getattr(sys, 'frozen', False):
        bundle_dir = sys._MEIPASS
        
        # Copy YAML files to correct locations
        yaml_files = ['asset_bases.yaml', 'devices_and_chipsets.yaml']
        for yaml_file in yaml_files:
            # Try multiple possible locations
            possible_sources = [
                os.path.join(bundle_dir, yaml_file),
                os.path.join(bundle_dir, 'qai_hub_models', yaml_file),
                os.path.join(bundle_dir, 'temp_src', 'qai_hub_models', yaml_file)
            ]
            
            for source in possible_sources:
                if os.path.exists(source):
                    # Copy to qai_hub_models directory
                    target = os.path.join(bundle_dir, 'qai_hub_models', yaml_file)
                    import shutil
                    shutil.copy2(source, target)
                    logger.info(f"✅ Copied {yaml_file} to {target}")
                    break
```

### **Step 2: TorchScript Pre-compilation**
```python
def pre_compile_torchscript_models():
    """Pre-compile TorchScript models during build."""
    try:
        from signwriting_translation.bin import load_sockeye_translator
        # Pre-compile models to avoid runtime compilation issues
        model_path = "sign/sockeye-text-to-factored-signwriting"
        translator, tokenizer_path = load_sockeye_translator(model_path)
        
        # Save compiled models
        torch.jit.save(translator, "compiled_translator.pt")
        logger.info("✅ Pre-compiled TorchScript models")
    except Exception as e:
        logger.warning(f"⚠️ Failed to pre-compile models: {e}")
```

### **Step 3: Modern FastAPI Handlers**
```python
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Modern lifespan handler for FastAPI."""
    # Startup
    logger.info("Starting SignBridge Backend")
    logger.info(f"Server will be available at: http://{config.HOST}:{config.PORT}")
    logger.info("-" * 60)
    
    load_platform_features()
    
    # Print summary
    logger.info("📊 Feature Loading Summary:")
    for feature, loaded in loaded_features.items():
        status = "OK" if loaded else "FAILED"
        logger.info(f"   {feature}: {status}")
    logger.info("-" * 60)
    
    yield
    
    # Shutdown
    logger.info("Shutting down SignBridge Backend")

app = FastAPI(lifespan=lifespan)
```

## 🧪 **Testing Strategy**

### **Test 1: YAML File Access**
```bash
# Test in bundled environment
./backend.exe
# Check logs for YAML file access
# Verify Speech-to-Text loads successfully
```

### **Test 2: TorchScript Compilation**
```bash
# Test Text-to-SignWriting functionality
curl -X POST "http://localhost:8000/translate_signwriting" \
     -H "Content-Type: application/json" \
     -d '{"text": "hello world"}'
# Verify translation works without TorchScript errors
```

### **Test 3: FastAPI Events**
```bash
# Check startup logs
# Verify no deprecation warnings
# Confirm all features load correctly
```

## 📊 **Expected Results**

### **Before Fixes**
- ❌ Speech-to-Text: FAILED (YAML file access)
- ❌ Text-to-SignWriting: FAILED (TorchScript compilation)
- ⚠️ FastAPI: Deprecation warnings

### **After Fixes**
- ✅ Speech-to-Text: OK (YAML files accessible)
- ✅ Text-to-SignWriting: OK (TorchScript works)
- ✅ FastAPI: No warnings (modern handlers)

## 🚨 **Priority Order**

1. **HIGH**: Fix YAML file access (Speech-to-Text critical)
2. **HIGH**: Fix TorchScript compilation (Text-to-SignWriting critical)
3. **MEDIUM**: Update FastAPI handlers (future compatibility)

## 📝 **Next Steps**

1. **Implement YAML file access fix**
2. **Test Speech-to-Text functionality**
3. **Implement TorchScript compilation fix**
4. **Test Text-to-SignWriting functionality**
5. **Update FastAPI handlers**
6. **Comprehensive testing**
7. **Document final solution**

This analysis provides a clear roadmap for fixing the production backend runtime issues. The solutions address the root causes while maintaining compatibility and performance.
