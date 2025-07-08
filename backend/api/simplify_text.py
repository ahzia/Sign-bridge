import requests
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

GROQ_API_URL = os.getenv("GROQ_API_URL", "https://api.groq.com/openai/v1/chat/completions")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

class TextRequest(BaseModel):
    text: str

@router.post("/simplify_text")
async def simplify_text(request: TextRequest):
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="Groq API key not configured.")
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "llama3-70b-8192",
        "messages": [
            {"role": "user", "content": f"Simplify this text in one short sentence, and only return me the Simplify text nothing it should not contain any bulit points, it should be just a sentence here is the text: {request.text}"}
        ]
    }
    try:
        response = requests.post(GROQ_API_URL, json=payload, headers=headers)
        response.raise_for_status()
        simplified_text = response.json().get("choices", [{}])[0].get("message", {}).get("content", "")
        return {"simplified_text": simplified_text}
    except requests.RequestException as e:
        raise HTTPException(status_code=503, detail=f"Groq API request failed: {str(e)}")
