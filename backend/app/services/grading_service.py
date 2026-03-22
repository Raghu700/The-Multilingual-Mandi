"""
Main grading orchestration service
Coordinates YOLO segmentation + EfficientNet classification
"""
import time
from PIL import Image
from typing import Dict, Any, Tuple
from app.models.yolo_segmentor import YoloSegmentor
from app.models.efficientnet_classifier import GradingClassifierWrapper
from app.services.image_preprocessor import ImagePreprocessor
from app.services.explainability_service import ExplainabilityService
from app.models.schemas import (
    GradingResponse, SegmentationResult, GradeEnum,
    DefectSeverityEnum, FreshnessEnum, MarketabilityEnum
)
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class GradingService:
    """Orchestrates the complete grading pipeline"""
    
    def __init__(self):
        """Initialize models and services"""
        logger.info("initializing_grading_service")
        self.yolo_segmentor = YoloSegmentor()
        self.classifier = GradingClassifierWrapper()
        self.preprocessor = ImagePreprocessor()
        self.explainer = ExplainabilityService()
        logger.info("grading_service_ready")
    
    async def grade_crop(
        self,
        image: Image.Image,
        crop_type: str = None
    ) -> GradingResponse:
        """
        Complete grading pipeline
        
        Args:
            image: PIL Image of crop
            crop_type: Optional crop type hint
            
        Returns:
            GradingResponse with complete results
        """
        start_time = time.time()
        warnings = []
        
        try:
            # Step 1: Validate image quality
            is_valid, quality_warnings = self.preprocessor.validate_image_quality(image)
            warnings.extend(quality_warnings)
            
            if not is_valid:
                logger.warning("image_quality_insufficient", warnings=warnings)
            
            # Step 2: YOLO segmentation
            segmented_crop, seg_metadata = self.yolo_segmentor.segment(image)
            
            if not seg_metadata["detected"] or segmented_crop is None:
                return self._create_failure_response(
                    "No crop detected in image",
                    seg_metadata,
                    warnings,
                    time.time() - start_time
                )
            
            # Validate segmentation
            seg_valid, seg_warnings = self.yolo_segmentor.validate_detection(seg_metadata)
            warnings.extend(seg_warnings)
            
            # Step 3: EfficientNet classification
            classification_result = self.classifier.predict(segmented_crop)
            
            # Step 3.5: Validate crop type match if provided
            if crop_type:
                crop_match_valid, crop_match_warnings = self._validate_crop_type_match(
                    classification_result,
                    crop_type,
                    seg_metadata
                )
                warnings.extend(crop_match_warnings)
                
                # If crop type doesn't match, downgrade to Grade C
                if not crop_match_valid:
                    logger.warning(
                        "crop_type_mismatch",
                        expected=crop_type,
                        detected_confidence=classification_result.get("grade_confidence", 0)
                    )
                    classification_result["grade"] = "C"
                    classification_result["grade_confidence"] = max(
                        classification_result["grade_confidence"] * 0.3,
                        0.10  # 10% as decimal (0.10), not 10.0
                    )
                    classification_result["defect_severity"] = "high"
            
            # Step 4: Determine marketability
            marketability = self.explainer.determine_marketability(
                classification_result["grade"],
                classification_result["defect_severity"],
                classification_result["freshness"]
            )
            
            # Step 5: Generate explanation
            explanation = self.explainer.generate_explanation(
                classification_result["grade"],
                classification_result["grade_confidence"],
                classification_result["defect_severity"],
                classification_result["freshness"],
                warnings
            )
            
            # Step 6: Build response
            processing_time = (time.time() - start_time) * 1000
            
            response = GradingResponse(
                success=True,
                cropType=crop_type,
                grade=GradeEnum(classification_result["grade"]),
                gradeConfidence=classification_result["grade_confidence"],
                defectSeverity=DefectSeverityEnum(classification_result["defect_severity"]),
                freshness=FreshnessEnum(classification_result["freshness"]),
                marketability=marketability,
                warnings=warnings,
                segmentation=SegmentationResult(**seg_metadata),
                explanation=explanation,
                processingTimeMs=processing_time,
                modelVersion=f"yolov8-seg + efficientnet-b0 v{settings.VERSION}"
            )
            
            logger.info(
                "grading_complete",
                grade=response.grade,
                confidence=response.gradeConfidence,
                processing_time_ms=processing_time
            )
            
            return response
            
        except Exception as e:
            logger.error("grading_failed", error=str(e), exc_info=True)
            raise
    
    def _create_failure_response(
        self,
        error_message: str,
        seg_metadata: Dict[str, Any],
        warnings: list,
        processing_time: float
    ) -> GradingResponse:
        """Create response for failed grading"""
        return GradingResponse(
            success=False,
            cropType=None,
            grade=GradeEnum.C,
            gradeConfidence=0.0,
            defectSeverity=DefectSeverityEnum.HIGH,
            freshness=FreshnessEnum.STALE,
            marketability=MarketabilityEnum.LOW,
            warnings=warnings + [error_message],
            segmentation=SegmentationResult(**seg_metadata),
            explanation=ExplainabilityService.generate_explanation(
                "C", 0.0, "high", "stale", warnings + [error_message]
            ),
            processingTimeMs=processing_time * 1000,
            modelVersion=f"yolov8-seg + efficientnet-b0 v{settings.VERSION}"
        )
    
    def _validate_crop_type_match(
        self,
        classification_result: Dict[str, Any],
        expected_crop_type: str,
        seg_metadata: Dict[str, Any]
    ) -> Tuple[bool, list]:
        """
        Validate if detected crop matches expected crop type
        
        IMPORTANT: Since we're using pretrained models that aren't crop-specific,
        we use a VERY CONSERVATIVE approach. When a user selects a specific crop type,
        we require VERY HIGH confidence to accept it. Otherwise, we assume mismatch.
        
        Args:
            classification_result: Classification output from EfficientNet
            expected_crop_type: User-selected crop type
            seg_metadata: Segmentation metadata from YOLO
            
        Returns:
            Tuple of (is_valid, warnings_list)
        """
        warnings = []
        
        # Normalize crop type
        expected_crop = expected_crop_type.lower().strip()
        
        # STRICT VALIDATION: Since models aren't crop-specific, we need very high confidence
        # to trust that the image matches the selected crop type
        
        # Check detection confidence - must be very high
        detection_conf = seg_metadata.get("confidence", 0)
        if detection_conf < 0.75:  # Raised from 0.6 to 0.75 (75%)
            warnings.append(
                f"Detection confidence ({detection_conf:.1%}) too low to confirm this is {expected_crop}"
            )
            return False, warnings
        
        # Check classification confidence - must be VERY high since model isn't crop-specific
        grade_conf = classification_result.get("grade_confidence", 0)
        
        # CRITICAL: Without crop-specific models, we can't reliably distinguish crops
        # So we use a VERY STRICT threshold
        if grade_conf < 0.70:  # Raised from 0.4 to 0.70 (70%)
            warnings.append(
                f"Cannot confirm image matches selected crop type '{expected_crop}' (confidence: {grade_conf:.1%}). "
                f"Please ensure you uploaded the correct crop type."
            )
            return False, warnings
        
        # Check if detected object looks like a crop (not building, person, etc.)
        bbox = seg_metadata.get("bbox")
        if bbox:
            width = bbox[2] - bbox[0]
            height = bbox[3] - bbox[1]
            aspect_ratio = width / height if height > 0 else 0
            
            # Most crops have aspect ratio between 0.5 and 2.0
            # Buildings, landscapes have extreme ratios
            if aspect_ratio < 0.4 or aspect_ratio > 2.5:  # Tightened from 0.3-3.0
                warnings.append(
                    f"Object shape (aspect ratio: {aspect_ratio:.2f}) doesn't match typical {expected_crop} shape"
                )
                return False, warnings
        
        # Even with high confidence, add a cautionary note
        # since we can't truly verify crop type without crop-specific models
        if grade_conf < 0.85:  # Below 85% confidence
            warnings.append(
                f"Moderate confidence ({grade_conf:.1%}) - result assumes image shows {expected_crop}. "
                f"For best results, ensure clear photos of the selected crop type."
            )
        
        return True, warnings
    
    def get_debug_info(self, image: Image.Image) -> Dict[str, Any]:
        """Get detailed debug information"""
        segmented_crop, seg_metadata = self.yolo_segmentor.segment(image)
        
        debug_info = {
            "segmentation": seg_metadata,
            "imageQuality": self.preprocessor.get_quality_metrics(image),
            "classification": None,
            "rawOutputs": {}
        }
        
        if segmented_crop:
            classification = self.classifier.predict(segmented_crop)
            debug_info["classification"] = classification
            debug_info["rawOutputs"] = {
                "grade_probabilities": classification["grade_probs"]
            }
        
        return debug_info
