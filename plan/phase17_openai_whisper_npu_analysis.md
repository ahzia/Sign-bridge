# Phase 17: OpenAI Whisper NPU Analysis & Implementation Strategy

## Objective
Analyze the feasibility of running the original OpenAI Whisper library on NPU (Snapdragon X Elite) and provide implementation strategies for optimal performance on both NPU and CPU fallback.

---

## Current Status Analysis

### ✅ **What We Know Works:**
1. **Qualcomm AI Hub Whisper**: Successfully runs on NPU using ONNX Runtime with QNN provider
2. **ONNX Models**: We have working WhisperEncoder.onnx and WhisperDecoder.onnx files
3. **Token Decoding**: The original Qualcomm implementation uses proper `whisper.decoding.get_tokenizer()`

### ❌ **What's Currently Broken:**
1. **OpenAI Whisper Installation**: Fails on Windows ARM64 due to compilation issues:
   - `numba` compilation errors (C++ type conversion issues)
   - `llvmlite` build failures (CMake generator issues)
   - Missing Visual Studio components for ARM64 compilation

---

## NPU Implementation Strategies

### **Strategy 1: ONNX Runtime with QNN Provider (RECOMMENDED)**

#### **Advantages:**
- ✅ **Proven to Work**: Qualcomm AI Hub Whisper already demonstrates this approach
- ✅ **NPU Acceleration**: Direct access to Snapdragon X Elite NPU via QNN provider
- ✅ **Cross-Platform**: Works on Windows, macOS, Linux with appropriate providers
- ✅ **Performance**: Significantly faster than CPU-only inference
- ✅ **Fallback Support**: Automatic fallback to CPU if NPU unavailable

#### **Implementation Approach:**
```python
import onnxruntime as ort

# Configure execution providers
providers = [
    ('QNNExecutionProvider', {
        'backend': 'QNN',
        'device_id': 0,
        'enable_htp': True,
        'htp_performance_mode': 'BURST',
        'enable_htp_fp16_precision': True
    }),
    ('CPUExecutionProvider', {})
]

# Load ONNX models
encoder_session = ort.InferenceSession("WhisperEncoder.onnx", providers=providers)
decoder_session = ort.InferenceSession("WhisperDecoder.onnx", providers=providers)
```

#### **Required Components:**
1. **ONNX Runtime QNN**: `pip install onnxruntime-qnn`
2. **Qualcomm AI Hub Models**: For model conversion and optimization
3. **ONNX Models**: Pre-converted Whisper encoder/decoder models
4. **Token Decoder**: Use `whisper.decoding.get_tokenizer()` for proper token-to-text conversion

---

### **Strategy 2: Direct OpenAI Whisper with NPU Backend**

#### **Challenges:**
- ❌ **Compilation Issues**: OpenAI Whisper requires `numba` which fails to compile on Windows ARM64
- ❌ **Limited NPU Support**: OpenAI Whisper doesn't natively support NPU acceleration
- ❌ **Dependency Hell**: Complex dependency chain with compilation requirements

#### **Potential Solutions:**
1. **Use Pre-compiled Wheels**: If available for ARM64
2. **Docker Container**: Run in x86_64 container with emulation
3. **Alternative Python Versions**: Try Python 3.11 instead of 3.12
4. **Manual Compilation**: Fix compilation issues manually

#### **Implementation Attempt:**
```bash
# Try different Python versions
python -m pip install openai-whisper --no-deps
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
pip install transformers
```

---

### **Strategy 3: Hybrid Approach (BEST OF BOTH WORLDS)**

#### **Architecture:**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Model Layer   │
│   (Tauri/React) │◄──►│   (FastAPI)     │◄──►│   (ONNX/QNN)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Fallback      │
                       │   (CPU/GPU)     │
                       └─────────────────┘
```

#### **Implementation:**
1. **Primary**: Use ONNX Runtime with QNN provider for NPU acceleration
2. **Fallback**: Use OpenAI Whisper for CPU/GPU when NPU unavailable
3. **Unified API**: Same interface regardless of backend

```python
class WhisperTranscriber:
    def __init__(self):
        self.npu_available = self._check_npu_availability()
        self.initialize_backend()
    
    def _check_npu_availability(self):
        try:
            import onnxruntime as ort
            providers = ort.get_available_providers()
            return 'QNNExecutionProvider' in providers
        except:
            return False
    
    def initialize_backend(self):
        if self.npu_available:
            self.backend = ONNXWhisperBackend()  # NPU-optimized
        else:
            self.backend = OpenAIWhisperBackend()  # CPU/GPU fallback
    
    def transcribe(self, audio):
        return self.backend.transcribe(audio)
```

---

## Performance Comparison

### **Expected Performance (Snapdragon X Elite):**

| Backend | Latency | Throughput | Power Efficiency | Accuracy |
|---------|---------|------------|------------------|----------|
| **ONNX + QNN (NPU)** | ~50-100ms | High | Excellent | Same as OpenAI |
| **OpenAI Whisper (CPU)** | ~500-1000ms | Medium | Good | Reference |
| **OpenAI Whisper (GPU)** | ~200-400ms | High | Medium | Same as CPU |

### **Memory Usage:**
- **ONNX Models**: ~400MB (encoder + decoder)
- **OpenAI Whisper**: ~1GB+ (full model + dependencies)
- **Runtime Memory**: ONNX typically uses less memory

---

## Implementation Plan

### **Phase 1: Fix Current ONNX Implementation (IMMEDIATE)**
1. **Fix Token Decoding**: Use proper `whisper.decoding.get_tokenizer()`
2. **Test with Real Audio**: Verify transcription quality
3. **Performance Benchmarking**: Measure latency and accuracy

### **Phase 2: Optimize ONNX Pipeline (SHORT TERM)**
1. **Model Quantization**: Convert to INT8 for faster inference
2. **Batch Processing**: Optimize for real-time streaming
3. **Memory Management**: Implement efficient caching

### **Phase 3: Hybrid System (MEDIUM TERM)**
1. **OpenAI Whisper Integration**: Add as fallback option
2. **Automatic Provider Selection**: Choose best available backend
3. **Unified API**: Consistent interface across backends

### **Phase 4: Advanced Optimization (LONG TERM)**
1. **Custom NPU Kernels**: Optimize specific operations
2. **Model Distillation**: Create smaller, faster models
3. **Multi-Model Ensemble**: Combine multiple models for better accuracy

---

## Technical Requirements

### **For ONNX + QNN (Current Approach):**
```bash
# Core dependencies
pip install onnxruntime-qnn
pip install openai-whisper  # For tokenizer only
pip install torch numpy pydub

# Model files
models/
├── WhisperEncoder.onnx
├── WhisperDecoder.onnx
└── mel_filters.npz
```

### **For OpenAI Whisper (Fallback):**
```bash
# Alternative installation methods
pip install openai-whisper --no-deps
pip install torch --index-url https://download.pytorch.org/whl/cpu
pip install transformers tokenizers
```

---

## Recommendations

### **Immediate Action (This Week):**
1. **✅ Fix Current ONNX Implementation**: Resolve token decoding issues
2. **✅ Test Performance**: Benchmark against reference audio
3. **✅ Document Results**: Create performance comparison

### **Short Term (Next 2 Weeks):**
1. **🔄 Optimize ONNX Pipeline**: Improve latency and memory usage
2. **🔄 Add Fallback Support**: Implement CPU fallback for edge cases
3. **🔄 Production Testing**: Test on real Snapdragon X Elite hardware

### **Medium Term (Next Month):**
1. **🔄 Hybrid System**: Integrate OpenAI Whisper as fallback
2. **🔄 Advanced Features**: Add streaming, batching, quantization
3. **🔄 Cross-Platform**: Ensure compatibility across all target platforms

---

## Conclusion

**The ONNX + QNN approach is the recommended solution** for the following reasons:

1. **✅ Proven Technology**: Qualcomm AI Hub Whisper demonstrates it works
2. **✅ NPU Acceleration**: Direct access to Snapdragon X Elite NPU
3. **✅ Better Performance**: Significantly faster than CPU-only OpenAI Whisper
4. **✅ Lower Resource Usage**: Smaller memory footprint and dependencies
5. **✅ Cross-Platform**: Works on all target platforms with appropriate providers

**The current token decoding issue is solvable** by using the proper Whisper tokenizer from the original implementation, which we already have access to.

**OpenAI Whisper can be added as a fallback** for cases where NPU is unavailable, providing a complete solution that works everywhere.

---

## Next Steps

1. **Fix token decoding in current ONNX implementation**
2. **Test with real audio files**
3. **Benchmark performance on Snapdragon X Elite**
4. **Implement automatic provider selection**
5. **Add OpenAI Whisper as fallback option**

This approach gives us the best of both worlds: NPU acceleration when available, with reliable fallback options for maximum compatibility.
