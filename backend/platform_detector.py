"""
Platform detection and configuration for SignBridge backend.
This module provides dynamic platform detection and configuration loading.
"""

import platform
import os
import sys
from typing import Dict, Any, Optional
from pathlib import Path


class PlatformDetector:
    """Detects platform and provides appropriate configuration."""
    
    def __init__(self):
        self.system = platform.system()
        self.machine = platform.machine()
        self.platform_id = self._detect_platform()
        self.config = self._load_platform_config()
    
    def _detect_platform(self) -> str:
        """Detect the current platform."""
        if self.system == "Windows":
            if self.machine == "ARM64":
                return "windows_arm64"
            else:
                # Check if NPU models are available on x64
                models_dir = Path(__file__).parent / "models"
                encoder_path = models_dir / "WhisperEncoder.onnx"
                decoder_path = models_dir / "WhisperDecoder.onnx"
                
                if encoder_path.exists() and decoder_path.exists():
                    return "windows_x64_npu"  # x64 with NPU support
                else:
                    return "windows_x64"
        elif self.system == "Darwin":
            return "macos"
        elif self.system == "Linux":
            return "linux"
        else:
            return "unknown"
    
    def _load_platform_config(self) -> Dict[str, Any]:
        """Load platform-specific configuration."""
        configs = {
            "windows_arm64": {
                "whisper_implementation": "npu",
                "whisper_module": "api.transcribe",
                "requirements_file": "requirements_main.txt",
                "setup_script": "setup_backend.ps1",
                "python_version": "3.11.13",
                "features": {
                    "speech_to_text": True,
                    "text_to_signwriting": True,
                    "text_simplification": True,
                    "pose_generation": True,
                    "npu_acceleration": True
                },
                "model_paths": {
                    "whisper_encoder": "models/WhisperEncoder.onnx",
                    "whisper_decoder": "models/WhisperDecoder.onnx"
                }
            },
            "macos": {
                "whisper_implementation": "openai",
                "whisper_module": "api.transcribe_openai",
                "requirements_file": "requirements_main.txt",
                "setup_script": "setup_py311_env.sh",
                "python_version": "3.11",
                "features": {
                    "speech_to_text": True,
                    "text_to_signwriting": True,
                    "text_simplification": True,
                    "pose_generation": True,
                    "npu_acceleration": False
                },
                "model_paths": {}
            },
            "windows_x64": {
                "whisper_implementation": "none",
                "whisper_module": None,
                "requirements_file": "requirements_main.txt",
                "setup_script": None,
                "python_version": "3.11",
                "features": {
                    "speech_to_text": False,
                    "text_to_signwriting": True,
                    "text_simplification": True,
                    "pose_generation": True,
                    "npu_acceleration": False
                },
                "model_paths": {}
            },
            "windows_x64_npu": {
                "whisper_implementation": "npu",
                "whisper_module": "api.transcribe",
                "requirements_file": "requirements_main.txt",
                "setup_script": "setup_backend.ps1",
                "python_version": "3.11.13",
                "features": {
                    "speech_to_text": True,
                    "text_to_signwriting": True,
                    "text_simplification": True,
                    "pose_generation": True,
                    "npu_acceleration": True
                },
                "model_paths": {
                    "whisper_encoder": "models/WhisperEncoder.onnx",
                    "whisper_decoder": "models/WhisperDecoder.onnx"
                }
            },
            "linux": {
                "whisper_implementation": "none",
                "whisper_module": None,
                "requirements_file": "requirements_main.txt",
                "setup_script": None,
                "python_version": "3.11",
                "features": {
                    "speech_to_text": False,
                    "text_to_signwriting": True,
                    "text_simplification": True,
                    "pose_generation": True,
                    "npu_acceleration": False
                },
                "model_paths": {}
            },
            "unknown": {
                "whisper_implementation": "none",
                "whisper_module": None,
                "requirements_file": "requirements_main.txt",
                "setup_script": None,
                "python_version": "3.11",
                "features": {
                    "speech_to_text": False,
                    "text_to_signwriting": True,
                    "text_simplification": True,
                    "pose_generation": True,
                    "npu_acceleration": False
                },
                "model_paths": {}
            }
        }
        
        return configs.get(self.platform_id, configs["unknown"])
    
    def get_platform_info(self) -> Dict[str, Any]:
        """Get comprehensive platform information."""
        return {
            "platform_id": self.platform_id,
            "system": self.system,
            "machine": self.machine,
            "python_version": sys.version,
            "config": self.config
        }
    
    def is_feature_available(self, feature: str) -> bool:
        """Check if a specific feature is available on this platform."""
        return self.config["features"].get(feature, False)
    
    def get_whisper_module(self) -> Optional[str]:
        """Get the appropriate Whisper module for this platform."""
        return self.config["whisper_module"]
    
    def get_requirements_file(self) -> str:
        """Get the appropriate requirements file for this platform."""
        return self.config["requirements_file"]
    
    def get_setup_script(self) -> Optional[str]:
        """Get the appropriate setup script for this platform."""
        return self.config["setup_script"]
    
    def get_model_paths(self) -> Dict[str, str]:
        """Get model paths for this platform."""
        return self.config["model_paths"]
    
    def print_platform_info(self):
        """Print platform information for debugging."""
        info = self.get_platform_info()
        print("Platform Detection Results:")
        print(f"   Platform ID: {info['platform_id']}")
        print(f"   System: {info['system']}")
        print(f"   Machine: {info['machine']}")
        print(f"   Python: {info['python_version']}")
        print(f"   Whisper Implementation: {info['config']['whisper_implementation']}")
        print(f"   Features Available:")
        for feature, available in info['config']['features'].items():
            status = "OK" if available else "FAILED"
            print(f"     {feature}: {status}")
        print()


# Global platform detector instance
platform_detector = PlatformDetector()


def get_platform_detector() -> PlatformDetector:
    """Get the global platform detector instance."""
    return platform_detector


def detect_platform() -> str:
    """Quick platform detection."""
    return platform_detector.platform_id


def is_feature_available(feature: str) -> bool:
    """Quick feature availability check."""
    return platform_detector.is_feature_available(feature)


if __name__ == "__main__":
    # Test platform detection
    platform_detector.print_platform_info()
