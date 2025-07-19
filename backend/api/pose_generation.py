import requests
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from config import config

router = APIRouter()

class PoseRequest(BaseModel):
    text: str
    spoken_language: str = "en"
    signed_language: str = "ase"

@router.post("/generate_pose")
async def generate_pose(request: PoseRequest):
    """
    Generate pose data from text using the translate project's API
    """
    try:
        # Construct the API URL
        params = {
            'text': request.text,
            'spoken': request.spoken_language,
            'signed': request.signed_language
        }
        
        # Make the API call - it returns binary pose data directly
        response = requests.get(config.POSE_API_URL, params=params)
        response.raise_for_status()
        
        # The API returns binary pose data directly
        pose_data = response.content
        
        # For now, we'll return the binary data as base64 encoded
        import base64
        pose_data_b64 = base64.b64encode(pose_data).decode('utf-8')
        
        return {
            "pose_data": pose_data_b64,
            "data_format": "binary_base64"
        }
        
    except requests.RequestException as e:
        raise HTTPException(status_code=503, detail=f"Pose generation failed: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}") 