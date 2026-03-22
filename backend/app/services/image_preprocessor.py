"""
Image preprocessing and quality validation
"""
import cv2
import numpy as np
from PIL import Image
from typing import Tuple, List, Dict, Any
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class ImagePreprocessor:
    """Image quality validation and preprocessing"""
    
    @staticmethod
    def validate_image_quality(image: Image.Image) -> Tuple[bool, List[str]]:
        """
        Validate image quality for grading
        
        Args:
            image: PIL Image
            
        Returns:
            Tuple of (is_valid, warnings_list)
        """
        warnings = []
        
        # Convert to numpy for analysis
        img_array = np.array(image)
        
        # Check if grayscale
        if len(img_array.shape) == 2:
            warnings.append("Image is grayscale, color analysis may be limited")
        
        # Check blur using Laplacian variance
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY) if len(img_array.shape) == 3 else img_array
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        
        if laplacian_var < settings.BLUR_THRESHOLD:
            warnings.append(f"Image appears blurry (sharpness: {laplacian_var:.1f})")
        
        # Check brightness
        brightness = np.mean(gray)
        if brightness < settings.BRIGHTNESS_MIN:
            warnings.append(f"Image too dark (brightness: {brightness:.1f})")
        elif brightness > settings.BRIGHTNESS_MAX:
            warnings.append(f"Image too bright (brightness: {brightness:.1f})")
        
        # Check resolution
        height, width = gray.shape
        if height < 224 or width < 224:
            warnings.append(f"Image resolution too low ({width}x{height})")
        
        is_valid = len(warnings) == 0 or laplacian_var >= settings.BLUR_THRESHOLD * 0.5
        
        logger.info(
            "image_quality_check",
            is_valid=is_valid,
            blur_score=laplacian_var,
            brightness=brightness,
            resolution=f"{width}x{height}",
            warnings_count=len(warnings)
        )
        
        return is_valid, warnings
    
    @staticmethod
    def get_quality_metrics(image: Image.Image) -> Dict[str, Any]:
        """Get detailed image quality metrics"""
        img_array = np.array(image)
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY) if len(img_array.shape) == 3 else img_array
        
        return {
            "resolution": {"width": image.width, "height": image.height},
            "blur_score": float(cv2.Laplacian(gray, cv2.CV_64F).var()),
            "brightness": float(np.mean(gray)),
            "contrast": float(np.std(gray)),
            "is_color": len(img_array.shape) == 3
        }
