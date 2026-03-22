"""
YOLO Segmentation Module
Handles crop detection and segmentation using YOLOv8
"""
import torch
import numpy as np
from PIL import Image
from typing import Optional, Tuple, Dict, Any, List
from ultralytics import YOLO
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class YoloSegmentor:
    """YOLOv8 segmentation wrapper for crop detection"""
    
    def __init__(self, model_path: Optional[str] = None):
        """
        Initialize YOLO segmentation model
        
        Args:
            model_path: Path to YOLO weights file. If None, uses pretrained yolov8n-seg
        """
        self.model_path = model_path or settings.YOLO_MODEL_PATH
        self.confidence_threshold = settings.YOLO_CONFIDENCE_THRESHOLD
        self.iou_threshold = settings.YOLO_IOU_THRESHOLD
        self.model = None
        self._load_model()
    
    def _load_model(self) -> None:
        """Load YOLO model from disk or download pretrained"""
        try:
            # Try loading custom weights
            self.model = YOLO(self.model_path)
            logger.info("yolo_model_loaded", path=self.model_path)
        except Exception as e:
            # Fallback to pretrained YOLOv8n-seg
            logger.warning(
                "custom_model_load_failed",
                error=str(e),
                fallback="yolov8n-seg.pt"
            )
            self.model = YOLO("yolov8n-seg.pt")  # Pretrained segmentation model
            logger.info("yolo_pretrained_loaded", model="yolov8n-seg")
    
    def segment(
        self, 
        image: Image.Image
    ) -> Tuple[Optional[Image.Image], Dict[str, Any]]:
        """
        Segment crop from image
        
        Args:
            image: PIL Image object
            
        Returns:
            Tuple of (segmented_crop_image, metadata_dict)
            Returns (None, metadata) if no crop detected
        """
        try:
            # Run YOLO inference
            results = self.model.predict(
                source=image,
                conf=self.confidence_threshold,
                iou=self.iou_threshold,
                verbose=False
            )
            
            if not results or len(results) == 0:
                return None, self._create_metadata(detected=False)
            
            result = results[0]
            
            # Check if any objects detected
            if result.boxes is None or len(result.boxes) == 0:
                return None, self._create_metadata(detected=False)
            
            # Get highest confidence detection
            confidences = result.boxes.conf.cpu().numpy()
            best_idx = np.argmax(confidences)
            best_confidence = float(confidences[best_idx])
            
            # Extract bounding box
            bbox = result.boxes.xyxy[best_idx].cpu().numpy().astype(int)
            x1, y1, x2, y2 = bbox
            
            # Crop the image
            cropped_image = image.crop((x1, y1, x2, y2))
            
            # Calculate mask area if masks available
            mask_area = None
            if result.masks is not None and len(result.masks) > 0:
                mask = result.masks.data[best_idx].cpu().numpy()
                mask_area = int(np.sum(mask > 0.5))
            
            metadata = self._create_metadata(
                detected=True,
                confidence=best_confidence,
                bbox=[int(x1), int(y1), int(x2), int(y2)],
                mask_area=mask_area,
                num_detections=len(result.boxes)
            )
            
            logger.info(
                "segmentation_success",
                confidence=best_confidence,
                bbox=metadata["bbox"],
                num_detections=metadata["num_detections"]
            )
            
            return cropped_image, metadata
            
        except Exception as e:
            logger.error("segmentation_failed", error=str(e), exc_info=True)
            return None, self._create_metadata(
                detected=False,
                error=str(e)
            )
    
    def _create_metadata(
        self,
        detected: bool = False,
        confidence: float = 0.0,
        bbox: Optional[list] = None,
        mask_area: Optional[int] = None,
        num_detections: int = 0,
        error: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create standardized metadata dictionary"""
        return {
            "detected": detected,
            "confidence": confidence,
            "bbox": bbox,
            "mask_area": mask_area,
            "num_detections": num_detections,
            "error": error
        }
    
    def validate_detection(self, metadata: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """
        Validate detection quality
        
        Args:
            metadata: Segmentation metadata
            
        Returns:
            Tuple of (is_valid, warnings_list)
        """
        warnings = []
        
        if not metadata["detected"]:
            return False, ["No crop detected in image"]
        
        # Check confidence
        if metadata["confidence"] < self.confidence_threshold:
            warnings.append(
                f"Low detection confidence: {metadata['confidence']:.2f}"
            )
        
        # Check mask area
        if metadata["mask_area"] and metadata["mask_area"] < settings.MIN_CROP_AREA_PIXELS:
            warnings.append(
                f"Detected crop area too small: {metadata['mask_area']} pixels"
            )
        
        # Check multiple detections
        if metadata["num_detections"] > 1:
            warnings.append(
                f"Multiple objects detected ({metadata['num_detections']}), using highest confidence"
            )
        
        is_valid = len(warnings) == 0 or metadata["confidence"] >= self.confidence_threshold
        
        return is_valid, warnings
