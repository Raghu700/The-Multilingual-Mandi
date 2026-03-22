"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from enum import Enum


class GradeEnum(str, Enum):
    """Quality grade enumeration"""
    A = "A"
    B = "B"
    C = "C"


class DefectSeverityEnum(str, Enum):
    """Defect severity levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class FreshnessEnum(str, Enum):
    """Freshness levels"""
    FRESH = "fresh"
    MODERATE = "moderate"
    STALE = "stale"


class MarketabilityEnum(str, Enum):
    """Market readiness"""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class SegmentationResult(BaseModel):
    """YOLO segmentation output"""
    detected: bool = Field(..., description="Whether crop was detected")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Detection confidence")
    bbox: Optional[List[int]] = Field(None, description="Bounding box [x1, y1, x2, y2]")
    mask_area: Optional[int] = Field(None, description="Segmented area in pixels")
    num_detections: int = Field(0, description="Total objects detected")


class ExplanationFactors(BaseModel):
    """Factors contributing to grade"""
    summary: str = Field(..., description="Human-readable summary")
    factors: List[str] = Field(..., description="Key quality factors")
    recommendations: Optional[List[str]] = Field(None, description="Improvement suggestions")


class GradingResponse(BaseModel):
    """Complete grading response"""
    success: bool = Field(..., description="Request success status")
    cropType: Optional[str] = Field(None, description="Detected or provided crop type")
    grade: GradeEnum = Field(..., description="Quality grade A/B/C")
    gradeConfidence: float = Field(..., ge=0.0, le=1.0, description="Grade confidence score")
    defectSeverity: DefectSeverityEnum = Field(..., description="Defect level")
    freshness: FreshnessEnum = Field(..., description="Freshness assessment")
    marketability: MarketabilityEnum = Field(..., description="Market readiness")
    warnings: List[str] = Field(default_factory=list, description="Quality warnings")
    segmentation: SegmentationResult = Field(..., description="Segmentation metadata")
    explanation: ExplanationFactors = Field(..., description="Grade explanation")
    processingTimeMs: float = Field(..., description="Total processing time")
    modelVersion: str = Field(..., description="Model version identifier")


class ErrorResponse(BaseModel):
    """Error response schema"""
    success: bool = False
    error: str = Field(..., description="Error message")
    errorCode: str = Field(..., description="Error code for client handling")
    details: Optional[Dict[str, Any]] = Field(None, description="Additional error details")


class HealthResponse(BaseModel):
    """Health check response"""
    status: str = Field(..., description="Service status")
    version: str = Field(..., description="API version")
    modelsLoaded: Dict[str, bool] = Field(..., description="Model loading status")
    timestamp: str = Field(..., description="Response timestamp")


class DebugResponse(BaseModel):
    """Debug response with intermediate outputs"""
    success: bool
    segmentation: Dict[str, Any] = Field(..., description="Segmentation details")
    classification: Dict[str, Any] = Field(..., description="Classification details")
    imageQuality: Dict[str, Any] = Field(..., description="Image quality metrics")
    rawOutputs: Dict[str, Any] = Field(..., description="Raw model outputs")
