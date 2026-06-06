import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("easysign-server")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("EasySign server starting")
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


@app.get("/health")
def health():
    return {"status": "ok", "service": "easysign-server"}
