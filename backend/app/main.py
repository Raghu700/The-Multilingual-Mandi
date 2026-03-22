"""Quality Grading Agent - Main Application"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import quality_grading
from app.core.config import settings
from app.core.logging import setup_logging, get_logger

setup_logging()
logger = get_logger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-powered crop quality grading service",
    docs_url="/docs"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    quality_grading.router,
    prefix=settings.API_V1_PREFIX,
    tags=["Quality Grading"]
)

@app.on_event("startup")
async def startup_event():
    logger.info("application_starting", project=settings.PROJECT_NAME)

@app.get("/")
async def root():
    return {"service": settings.PROJECT_NAME, "version": settings.VERSION, "status": "running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
