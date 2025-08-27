"""
Dynamic SignBridge Backend with platform-specific feature loading.
This version automatically detects the platform and loads appropriate features.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import logging
import os
from typing import Dict, Any, Optional

# Apply patches for production build
try:
    from qai_hub_patch import apply_patches
    apply_patches()
except ImportError:
    # Patch module not available, continue without patches
    pass

from config import config
from platform_detector import get_platform_detector, is_feature_available

# Initialize platform detector
platform_detector = get_platform_detector()

# Configure logging
logging.basicConfig(level=getattr(logging, config.LOG_LEVEL))
logger = logging.getLogger(__name__)

# Modern lifespan handler for FastAPI
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Modern lifespan handler for FastAPI startup and shutdown."""
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

# Initialize FastAPI app with lifespan handler
app = FastAPI(
    title="SignBridge Backend",
    description="Dynamic Voice-to-Sign Translation API with platform-specific optimizations",
    version="2.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.get_cors_origins(),
    allow_credentials=config.CORS_ALLOW_CREDENTIALS,
    allow_methods=config.CORS_ALLOW_METHODS,
    allow_headers=config.CORS_ALLOW_HEADERS,
)

# Track loaded features
loaded_features: Dict[str, bool] = {}
feature_routers: Dict[str, Any] = {}
def load_feature_safely(feature_name: str, module_path: str, router_name: str = "router") -> bool:
    """
    Safely load a feature module with error handling.
    
    Args:
        feature_name: Human-readable feature name
        module_path: Python module path
        router_name: Router variable name in the module
    
    Returns:
        bool: True if feature loaded successfully, False otherwise
    """
    try:
        # Import the module
        module = __import__(module_path, fromlist=[router_name])
        router = getattr(module, router_name)
        
        # Include the router in the app
        app.include_router(router)
        
        # Track successful loading
        loaded_features[feature_name] = True
        feature_routers[feature_name] = router
        
        logger.info(f"{feature_name} loaded successfully")
        return True
        
    except ImportError as e:
        logger.warning(f"⚠️  {feature_name} not available: {e}")
        loaded_features[feature_name] = False
        return False
        
    except Exception as e:
        logger.error(f"❌ Failed to load {feature_name}: {e}")
        loaded_features[feature_name] = False
        return False


def load_platform_features():
    """Load features based on platform detection."""
    logger.info("Loading platform-specific features...")
    platform_detector.print_platform_info()
    
    # Load Whisper transcription based on platform
    whisper_module = platform_detector.get_whisper_module()
    if whisper_module and is_feature_available("speech_to_text"):
        load_feature_safely("Speech-to-Text", whisper_module)
        
        # Whisper model will be initialized on first use for better UX
        logger.info("📝 Whisper model will be initialized on first use")
    else:
        logger.info("⚠️  Speech-to-Text not available on this platform")
        loaded_features["Speech-to-Text"] = False
    
    # Load SignWriting translation (available on all platforms)
    if is_feature_available("text_to_signwriting"):
        load_feature_safely("Text-to-SignWriting", "api.signwriting_translation_pytorch")
    else:
        logger.warning("⚠️  Text-to-SignWriting not available")
        loaded_features["Text-to-SignWriting"] = False
    
    # Load text simplification (available on all platforms)
    if is_feature_available("text_simplification"):
        load_feature_safely("Text Simplification", "api.simplify_text")
    else:
        logger.warning("⚠️  Text Simplification not available")
        loaded_features["Text Simplification"] = False
    
    # Load pose generation (available on all platforms)
    if is_feature_available("pose_generation"):
        load_feature_safely("Pose Generation", "api.pose_generation")
    else:
        logger.warning("⚠️  Pose Generation not available")
        loaded_features["Pose Generation"] = False


@app.get("/")
async def root():
    """Root endpoint with platform and feature information."""
    platform_info = platform_detector.get_platform_info()
    
    return {
        "message": "SignBridge Backend is running!",
        "status": "operational",
        "version": "2.0.0",
        "platform": {
            "id": platform_info["platform_id"],
            "system": platform_info["system"],
            "machine": platform_info["machine"],
            "whisper_implementation": platform_info["config"]["whisper_implementation"]
        },
        "features": {
            "speech_to_text": {
                "available": is_feature_available("speech_to_text"),
                "loaded": loaded_features.get("Speech-to-Text", False),
                "implementation": platform_info["config"]["whisper_implementation"]
            },
            "text_to_signwriting": {
                "available": is_feature_available("text_to_signwriting"),
                "loaded": loaded_features.get("Text-to-SignWriting", False)
            },
            "text_simplification": {
                "available": is_feature_available("text_simplification"),
                "loaded": loaded_features.get("Text Simplification", False)
            },
            "pose_generation": {
                "available": is_feature_available("pose_generation"),
                "loaded": loaded_features.get("Pose Generation", False)
            },
            "npu_acceleration": {
                "available": is_feature_available("npu_acceleration"),
                "platform": platform_info["platform_id"] == "windows_arm64"
            }
        },
        "setup_info": {
            "requirements_file": platform_detector.get_requirements_file(),
            "setup_script": platform_detector.get_setup_script(),
            "python_version": platform_info["config"]["python_version"]
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "message": "Backend is running",
        "platform": platform_detector.platform_id,
        "features_loaded": len([f for f in loaded_features.values() if f])
    }


@app.get("/platform")
async def platform_info():
    """Get detailed platform information."""
    return platform_detector.get_platform_info()


@app.get("/features")
async def features_status():
    """Get detailed feature status."""
    # Get Whisper model status if available
    whisper_status = None
    if "Speech-to-Text" in loaded_features and loaded_features["Speech-to-Text"]:
        try:
            from api.transcribe import get_model_status
            whisper_status = get_model_status()
        except Exception as e:
            whisper_status = {"error": str(e)}
    
    return {
        "loaded_features": loaded_features,
        "available_features": platform_detector.config["features"],
        "platform_id": platform_detector.platform_id,
        "whisper_model": whisper_status
    }


@app.get("/setup-guide")
async def setup_guide():
    """Get setup instructions for the current platform."""
    platform_id = platform_detector.platform_id
    setup_script = platform_detector.get_setup_script()
    requirements_file = platform_detector.get_requirements_file()
    
    guides = {
        "windows_arm64": {
            "description": "Windows ARM64 with Snapdragon X Elite NPU acceleration",
            "setup_steps": [
                "1. Ensure you have Python 3.11.13 installed",
                "2. Run the setup script:",
                f"   .\\{setup_script}",
                "3. Activate the virtual environment:",
                "   .\\.venv\\Scripts\\activate",
                "4. Start the backend:",
                "   python main.py"
            ],
            "features": "Full feature set with NPU acceleration",
            "requirements_file": requirements_file
        },
        "windows_x64_npu": {
            "description": "Windows x64 with NPU acceleration",
            "setup_steps": [
                "1. Ensure you have Python 3.11.13 installed",
                "2. Run the setup script:",
                f"   .\\{setup_script}",
                "3. Activate the virtual environment:",
                "   .\\.venv\\Scripts\\activate",
                "4. Start the backend:",
                "   python main.py"
            ],
            "features": "Full feature set with NPU acceleration",
            "requirements_file": requirements_file
        },
        "macos": {
            "description": "macOS with standard OpenAI Whisper",
            "setup_steps": [
                "1. Ensure you have Python 3.11 installed",
                "2. Run the setup script:",
                f"   bash {setup_script}",
                "3. Activate the virtual environment:",
                "   source py311_venv/bin/activate",
                "4. Start the backend:",
                "   python main.py"
            ],
            "features": "Full feature set with CPU/GPU acceleration",
            "requirements_file": requirements_file
        },
        "windows_x64": {
            "description": "Windows x64 (limited functionality)",
            "setup_steps": [
                "1. Install Python 3.11",
                "2. Install dependencies:",
                f"   pip install -r {requirements_file}",
                "3. Start the backend:",
                "   python main.py"
            ],
            "features": "Limited features (no speech-to-text)",
            "requirements_file": requirements_file
        },
        "linux": {
            "description": "Linux (limited functionality)",
            "setup_steps": [
                "1. Install Python 3.11",
                "2. Install dependencies:",
                f"   pip install -r {requirements_file}",
                "3. Start the backend:",
                "   python main.py"
            ],
            "features": "Limited features (no speech-to-text)",
            "requirements_file": requirements_file
        }
    }
    
    return guides.get(platform_id, {
        "description": "Unknown platform",
        "setup_steps": ["Please contact support for setup instructions"],
        "features": "Unknown",
        "requirements_file": requirements_file
    })


# Modern lifespan handler for FastAPI
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Modern lifespan handler for FastAPI startup and shutdown."""
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


if __name__ == "__main__":
    import uvicorn
    
    print("Starting SignBridge Backend (Dynamic Version)")
    print(f"Server will be available at: http://{config.HOST}:{config.PORT}")
    print("-" * 60)
    
    # Load features before starting server
    load_platform_features()
    
    # Start the server
    uvicorn.run(
        "main:app",
        host=config.HOST,
        port=config.PORT,
        reload=False  # Disable reload in production to prevent restart loops
    )
