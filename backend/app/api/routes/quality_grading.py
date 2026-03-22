"""
Quality Grading API Routes
"""
from fastapi import APIRouter, File, UploadFile, Form, HTTPException, Depends
from fastapi.responses import JSONResponse
from PIL import Image
import io
from datetime import datetime
from typing import Optional
from app.services.grading_service import GradingService
from app.models.schemas import GradingResponse, ErrorResponse, HealthResponse, DebugResponse
from app.core.config import settings, get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter()

# Global service instance
grading_service: Optional[GradingService] = None


def get_grading_service() -> GradingService:
    """Dependency injection for grading service"""
    global grading_service
    if grading_service is None:
        grading_service = GradingService()
    return grading_service


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    try:
        service = get_grading_service()
        models_loaded = {
            "yolo": service.yolo_segmentor.model is not None,
            "efficientnet": service.classifier.model is not None
        }
        
        return HealthResponse(
            status="healthy",
            version=settings.VERSION,
            modelsLoaded=models_loaded,
            timestamp=datetime.utcnow().isoformat()
        )
    except Exception as e:
        logger.error("health_check_failed", error=str(e))
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "error": str(e)}
        )


@router.post("/quality-grade", response_model=GradingResponse)
async def grade_quality(
    image: UploadFile = File(..., description="Crop image file"),
    cropType: Optional[str] = Form(None, description="Optional crop type hint"),
    service: GradingService = Depends(get_grading_service)
):
    """
    Grade crop quality from uploaded image
    
    - **image**: Image file (JPEG/PNG)
    - **cropType**: Optional crop type (tomato, onion, etc.)
    
    Returns structured grading response with grade, confidence, and explanation
    """
    try:
        # Validate file type
        if not image.content_type.startswith("image/"):
            raise HTTPException(
                status_code=400,
                detail="Invalid file type. Please upload an image file."
            )
        
        # Read image
        image_data = await image.read()
        
        # Check file size
        if len(image_data) > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size: {settings.MAX_UPLOAD_SIZE_MB}MB"
            )
        
        # Load image
        try:
            pil_image = Image.open(io.BytesIO(image_data))
            pil_image = pil_image.convert("RGB")
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to load image: {str(e)}"
            )
        
        # Validate crop type
        if cropType and cropType.lower() not in settings.SUPPORTED_CROPS:
            logger.warning("unsupported_crop_type", crop_type=cropType)
        
        # Run grading
        logger.info("grading_request_received", crop_type=cropType, image_size=len(image_data))
        result = await service.grade_crop(pil_image, cropType)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("grading_request_failed", error=str(e), exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.post("/quality-grade/debug", response_model=DebugResponse)
async def grade_quality_debug(
    image: UploadFile = File(...),
    service: GradingService = Depends(get_grading_service)
):
    """
    Debug endpoint with intermediate outputs
    Returns detailed segmentation and classification metadata
    """
    try:
        image_data = await image.read()
        pil_image = Image.open(io.BytesIO(image_data)).convert("RGB")
        
        debug_info = service.get_debug_info(pil_image)
        
        return DebugResponse(
            success=True,
            **debug_info
        )
        
    except Exception as e:
        logger.error("debug_request_failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))
