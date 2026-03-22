"""
Configuration management for Quality Grading Agent
Loads settings from environment variables with sensible defaults
"""
from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    """Application settings with environment variable support"""
    
    # API Settings
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "Quality Grading Agent"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Server Settings
    HOST: str = "0.0.0.0"
    PORT: int = 8003
    
    # Model Paths
    YOLO_MODEL_PATH: str = "models/yolo_seg.pt"  # YOLOv8 segmentation weights
    EFFICIENTNET_MODEL_PATH: str = "models/efficientnet_grading.pth"  # Fine-tuned weights
    
    # Model Configuration
    YOLO_CONFIDENCE_THRESHOLD: float = 0.5
    YOLO_IOU_THRESHOLD: float = 0.45
    CLASSIFIER_CONFIDENCE_THRESHOLD: float = 0.6
    
    # Image Processing
    MAX_UPLOAD_SIZE_MB: int = 10
    CLASSIFIER_INPUT_SIZE: int = 224  # EfficientNet-B0 input size
    MIN_CROP_AREA_PIXELS: int = 1000  # Minimum segmented crop area
    
    # Image Quality Thresholds
    BLUR_THRESHOLD: float = 100.0  # Laplacian variance threshold
    BRIGHTNESS_MIN: int = 30
    BRIGHTNESS_MAX: int = 225
    
    # Supported Crops
    SUPPORTED_CROPS: list = [
        "tomato", "onion", "potato", "wheat", "rice", 
        "chilli", "cardamom", "cotton"
    ]
    
    # Grade Mappings
    GRADE_LABELS: list = ["A", "B", "C"]
    DEFECT_LABELS: list = ["low", "medium", "high"]
    FRESHNESS_LABELS: list = ["fresh", "moderate", "stale"]
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"  # json or text
    
    # CORS
    CORS_ORIGINS: list = ["*"]  # Configure for production
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()


def get_settings() -> Settings:
    """Dependency injection for FastAPI"""
    return settings
