import base64
import logging

import requests
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()
logger = logging.getLogger("easysign-server")

POSE_API_URL = "https://us-central1-sign-mt.cloudfunctions.net/spoken_text_to_signed_pose"


class PoseRequest(BaseModel):
    text: str
    spoken_language: str = "en"
    signed_language: str = "ase"


@router.post("/generate_pose")
async def generate_pose(request: PoseRequest):
    try:
        params = {
            "text": request.text,
            "spoken": request.spoken_language,
            "signed": request.signed_language,
        }
        response = requests.get(POSE_API_URL, params=params, timeout=60)
        response.raise_for_status()
        pose_data_b64 = base64.b64encode(response.content).decode("utf-8")
        return {"pose_data": pose_data_b64, "data_format": "binary_base64"}
    except requests.RequestException as e:
        raise HTTPException(status_code=503, detail=f"Pose generation failed: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")
