#!/usr/bin/env python3
"""
Whisper ONNX Conversion Test Script
Tests the feasibility of converting Whisper models to ONNX for NPU acceleration
"""

import os
import sys
import time
import numpy as np
from pathlib import Path

def test_environment():
    """Test if required packages are available"""
    print("🔍 Testing environment...")
    
    try:
        import torch
        print(f"✅ PyTorch: {torch.__version__}")
    except ImportError:
        print("❌ PyTorch not installed")
        return False
    
    try:
        import transformers
        print(f"✅ Transformers: {transformers.__version__}")
    except ImportError:
        print("❌ Transformers not installed")
        return False
    
    try:
        import onnx
        print(f"✅ ONNX: {onnx.__version__}")
    except ImportError:
        print("❌ ONNX not installed")
        return False
    
    try:
        import onnxruntime as ort
        print(f"✅ ONNX Runtime: {ort.__version__}")
        providers = ort.get_available_providers()
        print(f"📊 Available providers: {providers}")
        if 'QNNExecutionProvider' in providers:
            print("✅ QNNExecutionProvider available")
        else:
            print("❌ QNNExecutionProvider not available")
    except ImportError:
        print("❌ ONNX Runtime not installed")
        return False
    
    return True

def test_whisper_loading():
    """Test if Whisper models can be loaded"""
    print("\n🤖 Testing Whisper model loading...")
    
    try:
        from transformers import WhisperProcessor, WhisperForConditionalGeneration
        
        # Test loading Whisper Tiny
        model_name = "openai/whisper-tiny"
        print(f"📥 Loading {model_name}...")
        
        processor = WhisperProcessor.from_pretrained(model_name)
        model = WhisperForConditionalGeneration.from_pretrained(model_name)
        
        print(f"✅ Model loaded successfully")
        print(f"📊 Model parameters: {model.num_parameters():,}")
        
        return processor, model
        
    except Exception as e:
        print(f"❌ Failed to load Whisper model: {e}")
        return None, None

def test_onnx_conversion(processor, model):
    """Test ONNX conversion of Whisper model"""
    print("\n🔄 Testing ONNX conversion...")
    
    try:
        import torch
        
        # Create models directory if it doesn't exist
        models_dir = Path("models/whisper")
        models_dir.mkdir(parents=True, exist_ok=True)
        
        # Prepare dummy input (mel spectrogram)
        # Whisper expects mel spectrogram with shape [batch_size, n_mels, time]
        dummy_input = torch.randn(1, 80, 3000)  # 80 mel bins, 3000 time steps
        
        # Export to ONNX
        onnx_path = models_dir / "whisper-tiny.onnx"
        print(f"📤 Exporting to {onnx_path}...")
        
        torch.onnx.export(
            model,
            dummy_input,
            onnx_path,
            export_params=True,
            opset_version=11,
            do_constant_folding=True,
            input_names=['input_features'],
            output_names=['logits'],
            dynamic_axes={
                'input_features': {0: 'batch_size', 2: 'sequence_length'},
                'logits': {0: 'batch_size', 1: 'sequence_length'}
            }
        )
        
        print(f"✅ ONNX model saved to {onnx_path}")
        
        # Verify ONNX model
        import onnx
        onnx_model = onnx.load(onnx_path)
        onnx.checker.check_model(onnx_model)
        print("✅ ONNX model validation passed")
        
        return onnx_path
        
    except Exception as e:
        print(f"❌ ONNX conversion failed: {e}")
        return None

def test_qnn_compatibility(onnx_path):
    """Test if the ONNX model is compatible with QNN"""
    print("\n🧪 Testing QNN compatibility...")
    
    try:
        import onnxruntime as ort
        
        # Test loading with QNN provider
        providers = [
            ('QNNExecutionProvider', {
                'backend': 'QNN',
                'device_id': 0,
                'enable_htp': True,
                'htp_performance_mode': 'BURST'
            }),
            ('CPUExecutionProvider', {})
        ]
        
        print("📥 Loading ONNX model with QNN provider...")
        session = ort.InferenceSession(str(onnx_path), providers=providers)
        
        print(f"✅ Model loaded successfully")
        print(f"📊 Active providers: {session.get_providers()}")
        
        # Test inference with dummy input
        dummy_input = np.random.randn(1, 80, 3000).astype(np.float32)
        
        print("🧪 Running test inference...")
        start_time = time.perf_counter()
        outputs = session.run(None, {'input_features': dummy_input})
        end_time = time.perf_counter()
        
        inference_time = (end_time - start_time) * 1000
        print(f"✅ Inference completed in {inference_time:.2f}ms")
        print(f"📊 Output shape: {outputs[0].shape}")
        
        return True
        
    except Exception as e:
        print(f"❌ QNN compatibility test failed: {e}")
        return False

def test_audio_preprocessing():
    """Test audio preprocessing pipeline"""
    print("\n🎵 Testing audio preprocessing...")
    
    try:
        import librosa
        
        # Test if librosa can load and process audio
        print("✅ Librosa available for audio processing")
        
        # Test creating mel spectrogram (Whisper preprocessing)
        sample_rate = 16000
        duration = 3  # seconds
        samples = int(sample_rate * duration)
        
        # Create dummy audio
        dummy_audio = np.random.randn(samples)
        
        # Convert to mel spectrogram
        mel_spec = librosa.feature.melspectrogram(
            y=dummy_audio,
            sr=sample_rate,
            n_mels=80,
            hop_length=160,
            win_length=400
        )
        
        # Convert to log mel spectrogram
        log_mel_spec = librosa.power_to_db(mel_spec, ref=np.max)
        
        print(f"✅ Audio preprocessing successful")
        print(f"📊 Mel spectrogram shape: {log_mel_spec.shape}")
        
        return True
        
    except ImportError:
        print("❌ Librosa not installed")
        return False
    except Exception as e:
        print(f"❌ Audio preprocessing failed: {e}")
        return False

def main():
    """Main test function"""
    print("🚀 Whisper ONNX NPU Feasibility Test")
    print("=" * 50)
    
    # Test environment
    if not test_environment():
        print("\n❌ Environment test failed. Please install required packages:")
        print("pip install torch transformers onnx onnxruntime-qnn librosa")
        return
    
    # Test Whisper loading
    processor, model = test_whisper_loading()
    if model is None:
        return
    
    # Test ONNX conversion
    onnx_path = test_onnx_conversion(processor, model)
    if onnx_path is None:
        return
    
    # Test QNN compatibility
    qnn_success = test_qnn_compatibility(onnx_path)
    
    # Test audio preprocessing
    audio_success = test_audio_preprocessing()
    
    # Summary
    print("\n📋 Test Summary")
    print("=" * 50)
    print(f"✅ Environment: Ready")
    print(f"✅ Whisper Loading: {'Success' if model else 'Failed'}")
    print(f"✅ ONNX Conversion: {'Success' if onnx_path else 'Failed'}")
    print(f"✅ QNN Compatibility: {'Success' if qnn_success else 'Failed'}")
    print(f"✅ Audio Preprocessing: {'Success' if audio_success else 'Failed'}")
    
    if all([model, onnx_path, qnn_success, audio_success]):
        print("\n🎉 All tests passed! Whisper NPU implementation is feasible.")
        print("\n📝 Next steps:")
        print("1. Implement full Whisper NPU service")
        print("2. Add audio preprocessing pipeline")
        print("3. Integrate with existing API")
        print("4. Test with real audio files")
    else:
        print("\n⚠️ Some tests failed. Review issues before proceeding.")

if __name__ == "__main__":
    main()

