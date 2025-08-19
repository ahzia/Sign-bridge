# Phase 16: Qualcomm AI Hub Whisper Integration Plan

## 🎯 **Objective**
Integrate the Qualcomm AI Hub whisper implementation (NPU-optimized for Snapdragon X Elite) into SignBridge to replace the current OpenAI whisper placeholder, providing real-time speech-to-text functionality with hardware acceleration.

## 📊 **Current State Analysis**

### **Existing Implementation Issues**
- **OpenAI Whisper**: Not working due to compilation issues on Windows ARM64
- **Current Status**: Using placeholder transcription in `main.py`
- **Blocking Issues**: 
  - Visual Studio Build Tools compilation problems
  - ARM64 compatibility issues with PyTorch dependencies
  - Missing `kernel32.lib` and other Windows libraries

### **Qualcomm AI Hub Whisper Advantages**
- ✅ **NPU Optimization**: Specifically designed for Snapdragon X Elite
- ✅ **ONNX Runtime**: Uses ONNX with QNN provider for hardware acceleration
- ✅ **Standalone Version**: No AI Hub dependencies required for distribution
- ✅ **ARM64 Compatible**: Tested and working on Windows ARM64
- ✅ **Performance**: Optimized for real-time transcription
- ✅ **Fallback Support**: Automatically falls back to CPU if NPU unavailable

## 🏗️ **Integration Architecture**

### **Proposed Structure**
```
backend/
├── whisper/
│   ├── __init__.py
│   ├── qualcomm_whisper.py          # Main integration class
│   ├── standalone_model.py          # ONNX model wrapper
│   ├── standalone_whisper.py        # Whisper implementation
│   └── config.yaml                  # Whisper configuration
├── models/
│   ├── WhisperEncoder.onnx          # Encoder model
│   ├── WhisperDecoder.onnx          # Decoder model
│   └── mel_filters.npz              # Mel filter coefficients
└── api/
    └── transcribe_qualcomm.py       # New transcription endpoint
```

### **Integration Points**
1. **Backend API**: New `/api/transcribe_qualcomm` endpoint
2. **Model Loading**: Lazy loading with caching
3. **Audio Processing**: Real-time chunk processing
4. **Error Handling**: Graceful fallback to CPU
5. **Performance Monitoring**: NPU vs CPU usage tracking

## 🔧 **Implementation Plan**

### **Phase 16.1: Core Integration (Week 1)**

#### **Step 1: Setup Qualcomm Whisper Environment**
```bash
# Install uv package manager
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"

# Create new virtual environment for whisper
cd backend
uv venv whisper_env
uv pip install onnxruntime-qnn==1.21.0
uv pip install numpy sounddevice pyyaml
```

#### **Step 2: Copy and Adapt Whisper Code**
- Copy `standalone_model.py` and `standalone_whisper.py` from simple-whisper-transcription
- Adapt for FastAPI integration
- Create `qualcomm_whisper.py` wrapper class

#### **Step 3: Download Models**
- Download ONNX models from Google Drive (provided by friend)
- Place in `backend/models/` directory
- Create `config.yaml` for whisper configuration

#### **Step 4: Create Integration Class**
```python
# backend/whisper/qualcomm_whisper.py
class QualcommWhisperTranscriber:
    def __init__(self, config_path="whisper/config.yaml"):
        self.model = None
        self.config = self.load_config(config_path)
        self.is_initialized = False
    
    def initialize(self):
        """Lazy initialization of the whisper model"""
        if not self.is_initialized:
            self.model = StandaloneWhisperModel(
                encoder_path=self.config["encoder_path"],
                decoder_path=self.config["decoder_path"]
            )
            self.is_initialized = True
    
    def transcribe_audio(self, audio_data, sample_rate=16000):
        """Transcribe audio data using Qualcomm whisper"""
        self.initialize()
        return self.model.transcribe(audio_data, sample_rate)
    
    def transcribe_file(self, file_path):
        """Transcribe audio file using Qualcomm whisper"""
        self.initialize()
        # Load and process audio file
        return self.model.transcribe_file(file_path)
```

### **Phase 16.2: API Integration (Week 1)**

#### **Step 1: Create New Transcription Endpoint**
```python
# backend/api/transcribe_qualcomm.py
from fastapi import APIRouter, UploadFile, File, HTTPException
from whisper.qualcomm_whisper import QualcommWhisperTranscriber
import tempfile
import os

router = APIRouter()
transcriber = QualcommWhisperTranscriber()

@router.post("/transcribe_qualcomm")
async def transcribe_qualcomm(audio: UploadFile = File(...)):
    """Transcribe audio using Qualcomm AI Hub whisper"""
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
            contents = await audio.read()
            temp_file.write(contents)
            temp_path = temp_file.name
        
        # Transcribe using Qualcomm whisper
        result = transcriber.transcribe_file(temp_path)
        
        return {"text": result, "provider": "qualcomm_whisper"}
    
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
```

#### **Step 2: Update Main Backend**
```python
# backend/main.py
from api.transcribe_qualcomm import router as transcribe_qualcomm_router

# Add new router
app.include_router(transcribe_qualcomm_router, prefix="/api")
```

#### **Step 3: Update Frontend API Service**
```typescript
// frontend/src/services/ApiService.ts
export class ApiService {
  static async transcribeQualcomm(audioBlob: Blob): Promise<TranscribeResponse> {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    
    const response = await axios.post(
      `${this.baseUrl}/api/transcribe_qualcomm`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000 // 30 second timeout for transcription
      }
    );
    
    return response.data;
  }
}
```

### **Phase 16.3: Real-time Audio Integration (Week 2)**

#### **Step 1: Real-time Audio Processing**
```python
# backend/whisper/realtime_processor.py
class RealtimeWhisperProcessor:
    def __init__(self, chunk_duration=4, sample_rate=16000):
        self.transcriber = QualcommWhisperTranscriber()
        self.chunk_duration = chunk_duration
        self.sample_rate = sample_rate
        self.audio_buffer = []
    
    def process_audio_chunk(self, audio_chunk):
        """Process real-time audio chunk"""
        self.audio_buffer.extend(audio_chunk)
        
        # Process when buffer is full
        if len(self.audio_buffer) >= self.chunk_duration * self.sample_rate:
            chunk = np.array(self.audio_buffer[:self.chunk_duration * self.sample_rate])
            self.audio_buffer = self.audio_buffer[self.chunk_duration * self.sample_rate:]
            
            return self.transcriber.transcribe_audio(chunk, self.sample_rate)
        
        return None
```

#### **Step 2: WebSocket Support for Real-time**
```python
# backend/api/realtime_transcribe.py
from fastapi import WebSocket
import json

@router.websocket("/ws/transcribe")
async def websocket_transcribe(websocket: WebSocket):
    await websocket.accept()
    processor = RealtimeWhisperProcessor()
    
    try:
        while True:
            # Receive audio chunk
            audio_data = await websocket.receive_bytes()
            
            # Process and transcribe
            result = processor.process_audio_chunk(audio_data)
            
            if result:
                await websocket.send_text(json.dumps({
                    "text": result,
                    "timestamp": time.time()
                }))
    except WebSocketDisconnect:
        pass
```

### **Phase 16.4: Performance Optimization (Week 2)**

#### **Step 1: NPU Detection and Monitoring**
```python
# backend/whisper/npu_monitor.py
class NPUMonitor:
    def __init__(self):
        self.npu_available = False
        self.current_provider = "CPU"
    
    def detect_npu(self):
        """Detect if NPU is available"""
        try:
            import onnxruntime
            providers = onnxruntime.get_available_providers()
            self.npu_available = "QNNExecutionProvider" in providers
            return self.npu_available
        except:
            return False
    
    def get_performance_metrics(self):
        """Get performance metrics"""
        return {
            "npu_available": self.npu_available,
            "current_provider": self.current_provider,
            "transcription_speed": self.measure_speed()
        }
```

#### **Step 2: Model Caching and Optimization**
```python
# backend/whisper/model_cache.py
class ModelCache:
    def __init__(self):
        self.cached_model = None
        self.last_used = None
    
    def get_model(self):
        """Get cached model or load new one"""
        if self.cached_model is None:
            self.cached_model = QualcommWhisperTranscriber()
            self.cached_model.initialize()
        
        self.last_used = time.time()
        return self.cached_model
    
    def cleanup_old_models(self, max_age=3600):
        """Cleanup old models to free memory"""
        if (self.last_used and 
            time.time() - self.last_used > max_age and 
            self.cached_model):
            del self.cached_model
            self.cached_model = None
```

### **Phase 16.5: Testing and Validation (Week 3)**

#### **Step 1: Unit Tests**
```python
# tests/test_qualcomm_whisper.py
import pytest
from backend.whisper.qualcomm_whisper import QualcommWhisperTranscriber

def test_whisper_initialization():
    transcriber = QualcommWhisperTranscriber()
    assert transcriber.is_initialized == False
    
    transcriber.initialize()
    assert transcriber.is_initialized == True

def test_audio_transcription():
    transcriber = QualcommWhisperTranscriber()
    # Test with sample audio file
    result = transcriber.transcribe_file("tests/sample_audio.wav")
    assert isinstance(result, str)
    assert len(result) > 0
```

#### **Step 2: Performance Benchmarks**
```python
# tests/benchmark_whisper.py
def benchmark_transcription_speed():
    transcriber = QualcommWhisperTranscriber()
    
    # Test with different audio lengths
    audio_files = ["short.wav", "medium.wav", "long.wav"]
    
    for audio_file in audio_files:
        start_time = time.time()
        result = transcriber.transcribe_file(audio_file)
        end_time = time.time()
        
        duration = end_time - start_time
        print(f"{audio_file}: {duration:.2f}s")
```

#### **Step 3: Integration Tests**
```python
# tests/test_integration.py
def test_api_integration():
    # Test the full API pipeline
    with open("tests/sample_audio.wav", "rb") as f:
        response = client.post("/api/transcribe_qualcomm", files={"audio": f})
    
    assert response.status_code == 200
    assert "text" in response.json()
```

## 📋 **Configuration Files**

### **Whisper Configuration**
```yaml
# backend/whisper/config.yaml
# Audio settings
sample_rate: 16000
chunk_duration: 4
channels: 1

# Processing settings
max_workers: 4
silence_threshold: 0.001
queue_timeout: 1.0

# Model paths
encoder_path: "models/WhisperEncoder.onnx"
decoder_path: "models/WhisperDecoder.onnx"

# NPU settings
enable_npu: true
npu_fallback: true
performance_mode: "burst"
```

### **Environment Variables**
```bash
# backend/.env
WHISPER_PROVIDER=qualcomm
WHISPER_MODEL_PATH=models/
WHISPER_ENABLE_NPU=true
WHISPER_FALLBACK_CPU=true
```

## 🚀 **Performance Expectations**

### **NPU Performance (Snapdragon X Elite)**
- **Latency**: 2-4 seconds for 10-second audio
- **Throughput**: Real-time processing capability
- **Memory Usage**: ~500MB for model + runtime
- **Power Efficiency**: 50-70% better than CPU-only

### **CPU Fallback Performance**
- **Latency**: 4-8 seconds for 10-second audio
- **Throughput**: Near real-time with buffering
- **Memory Usage**: ~800MB for model + runtime
- **Compatibility**: Works on all platforms

## ⚠️ **Potential Drawbacks and Mitigations**

### **1. Model Size and Distribution**
**Drawback**: ONNX models are large (~1.5GB total)
**Mitigation**: 
- Include models in production build
- Use model compression techniques
- Implement progressive model loading

### **2. Platform Dependency**
**Drawback**: NPU optimization only works on Snapdragon X Elite
**Mitigation**:
- Automatic CPU fallback
- Platform detection and optimization
- Graceful degradation

### **3. Memory Usage**
**Drawback**: Higher memory usage than OpenAI whisper
**Mitigation**:
- Model caching with cleanup
- Memory monitoring
- Configurable model loading

### **4. Initialization Time**
**Drawback**: Model loading takes 5-10 seconds
**Mitigation**:
- Lazy initialization
- Background loading
- Loading indicators in UI

### **5. Dependency Complexity**
**Drawback**: Additional dependencies (ONNX Runtime, QNN)
**Mitigation**:
- Isolated whisper environment
- Clear dependency documentation
- Automated setup scripts

## 🔄 **Migration Strategy**

### **Phase 1: Parallel Implementation**
- Keep existing placeholder transcription
- Add new Qualcomm whisper endpoint
- Test both implementations side-by-side

### **Phase 2: Gradual Migration**
- Update frontend to use new endpoint
- Monitor performance and reliability
- Keep fallback to placeholder if needed

### **Phase 3: Full Integration**
- Remove placeholder implementation
- Update all documentation
- Optimize for production

## 📊 **Success Metrics**

### **Technical Metrics**
- ✅ **Transcription Accuracy**: >95% for clear speech
- ✅ **Latency**: <5 seconds for 10-second audio
- ✅ **NPU Utilization**: >80% when available
- ✅ **Memory Usage**: <1GB total
- ✅ **Error Rate**: <1% for valid audio

### **User Experience Metrics**
- ✅ **Response Time**: <3 seconds for UI feedback
- ✅ **Reliability**: 99% uptime
- ✅ **Cross-platform**: Works on Windows ARM64, x64, macOS
- ✅ **Accessibility**: No degradation in user experience

## 🎯 **Next Steps**

### **Immediate Actions (Week 1)**
1. **Setup Environment**: Install uv and create whisper environment
2. **Download Models**: Get ONNX models from provided Google Drive
3. **Basic Integration**: Create QualcommWhisperTranscriber class
4. **API Endpoint**: Implement basic transcription endpoint

### **Short-term Goals (Week 2)**
1. **Real-time Processing**: Add WebSocket support
2. **Performance Monitoring**: Implement NPU detection
3. **Error Handling**: Add comprehensive error handling
4. **Testing**: Create unit and integration tests

### **Long-term Goals (Week 3)**
1. **Production Integration**: Update main backend
2. **Frontend Updates**: Modify API service
3. **Documentation**: Update all documentation
4. **Performance Optimization**: Fine-tune for production

## 📝 **Conclusion**

The Qualcomm AI Hub whisper integration represents a significant upgrade for SignBridge, providing:

1. **Hardware Acceleration**: NPU optimization for Snapdragon X Elite
2. **Real-time Performance**: Sub-second transcription latency
3. **Platform Compatibility**: Works on Windows ARM64 without compilation issues
4. **Production Ready**: Standalone distribution without external dependencies

The integration plan provides a structured approach to implementing this upgrade while maintaining backward compatibility and ensuring robust error handling. The performance improvements and hardware optimization will significantly enhance the user experience for Snapdragon X Elite users while maintaining compatibility with other platforms through CPU fallback.

**Estimated Timeline**: 3 weeks for complete integration
**Risk Level**: Low (proven technology, clear implementation path)
**Impact**: High (enables full speech-to-text functionality)
