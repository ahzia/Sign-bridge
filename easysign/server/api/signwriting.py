import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from signwriting_translation.bin import load_sockeye_translator, tokenize_spoken_text, translate

router = APIRouter()
logger = logging.getLogger("easysign-server")

_translator = None
_tokenizer_path = None


def load_signwriting_at_startup():
    global _translator, _tokenizer_path
    if _translator is None:
        logger.info("Loading SignWriting model")
        model_path = "sign/sockeye-text-to-factored-signwriting"
        _translator, _tokenizer_path = load_sockeye_translator(model_path)


class TextRequest(BaseModel):
    text: str


@router.post("/translate_signwriting")
async def translate_signwriting(request: TextRequest):
    try:
        if _translator is None:
            load_signwriting_at_startup()
        tokenized_text = tokenize_spoken_text(request.text)
        model_input = f"$en $ase {tokenized_text}"
        outputs = translate(_translator, [model_input])
        return {"signwriting": outputs[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")
