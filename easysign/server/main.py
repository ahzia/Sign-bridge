import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.pose import router as pose_router
from api.signwriting import load_signwriting_at_startup, router as signwriting_router
from api.transcribe import load_whisper_at_startup, router as transcribe_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("easysign-server")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("EasySign server starting")
    load_whisper_at_startup()
    load_signwriting_at_startup()
    yield
    logger.info("EasySign server shutting down")


app = FastAPI(title="easysign-server", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transcribe_router)
app.include_router(signwriting_router)
app.include_router(pose_router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "easysign-server"}
