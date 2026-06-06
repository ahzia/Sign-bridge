import logging
import os

import requests
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

load_dotenv()

router = APIRouter()
logger = logging.getLogger("easysign-server")

OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"


class TranslateRequest(BaseModel):
    text: str


class TranslateResponse(BaseModel):
    original_text: str
    english_text: str


@router.post("/translate-to-english", response_model=TranslateResponse)
async def translate_to_english(request: TranslateRequest):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OpenAI API key not configured.")

    try:
        response = requests.post(
            OPENAI_API_URL,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": "gpt-4o-mini",
                "messages": [
                    {
                        "role": "system",
                        "content": "Translate the following Cantonese or Traditional Chinese text to natural English. Return only the English translation.",
                    },
                    {"role": "user", "content": request.text},
                ],
                "temperature": 0.2,
            },
            timeout=60,
        )
        response.raise_for_status()
        data = response.json()
        english_text = data["choices"][0]["message"]["content"].strip()
        return TranslateResponse(original_text=request.text, english_text=english_text)
    except requests.RequestException as e:
        raise HTTPException(status_code=503, detail=f"Translation failed: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation error: {str(e)}")
