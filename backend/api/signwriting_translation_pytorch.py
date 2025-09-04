import torch
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from signwriting_translation.bin import load_sockeye_translator, tokenize_spoken_text, translate

router = APIRouter()

class TextRequest(BaseModel):
    text: str

import sys
import os
from pathlib import Path
if getattr(sys, 'frozen', False):
    print("Running in a bundled environment")
    path = Path(os.path.dirname(sys.executable)) / "_internal"
elif __file__:
    print("Running in a normal Python environment")
    path = Path(os.path.dirname(__file__)).parent
print("Determined path:", path)

@router.post("/translate_signwriting")
async def translate_signwriting(request: TextRequest):
    try:
        print("path in signwriting translation is ",path)
        print("getattr(sys, 'frozen', False) = ", getattr(sys, 'frozen', False))
        model_path = str(path / Path("models--sign--sockeye-text-to-factored-signwriting"))
        spoken_language = "en"
        signed_language = "ase"

        translator, tokenizer_path = load_sockeye_translator(model_path)
        tokenized_text = tokenize_spoken_text(request.text)
        model_input = f"${spoken_language} ${signed_language} {tokenized_text}"
        outputs = translate(translator, [model_input])
        return {"signwriting": outputs[0]}
    except Exception as e:
        print("Translation error:", e)
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")
