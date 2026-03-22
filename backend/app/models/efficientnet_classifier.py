"""EfficientNet-B0 Grading Classifier"""
import torch
import torch.nn as nn
from torchvision import transforms
from PIL import Image
import timm
from typing import Dict, Any, Tuple, Optional
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

class EfficientNetGradingClassifier(nn.Module):
    def __init__(self, num_grade_classes: int = 3, num_defect_classes: int = 3, num_freshness_classes: int = 3, pretrained: bool = True):
        super().__init__()
        self.backbone = timm.create_model("efficientnet_b0", pretrained=pretrained, num_classes=0, global_pool="avg")
        self.feature_dim = self.backbone.num_features
        self.grade_head = nn.Sequential(nn.Dropout(0.3), nn.Linear(self.feature_dim, 256), nn.ReLU(), nn.Dropout(0.2), nn.Linear(256, num_grade_classes))
        self.defect_head = nn.Sequential(nn.Dropout(0.3), nn.Linear(self.feature_dim, 128), nn.ReLU(), nn.Linear(128, num_defect_classes))
        self.freshness_head = nn.Sequential(nn.Dropout(0.3), nn.Linear(self.feature_dim, 128), nn.ReLU(), nn.Linear(128, num_freshness_classes))
    
    def forward(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        features = self.backbone(x)
        return self.grade_head(features), self.defect_head(features), self.freshness_head(features)

class GradingClassifierWrapper:
    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path or settings.EFFICIENTNET_MODEL_PATH
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = None
        self.transform = self._create_transform()
        self._load_model()
    
    def _create_transform(self) -> transforms.Compose:
        return transforms.Compose([
            transforms.Resize((settings.CLASSIFIER_INPUT_SIZE, settings.CLASSIFIER_INPUT_SIZE)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
    
    def _load_model(self) -> None:
        try:
            self.model = EfficientNetGradingClassifier(
                num_grade_classes=len(settings.GRADE_LABELS),
                num_defect_classes=len(settings.DEFECT_LABELS),
                num_freshness_classes=len(settings.FRESHNESS_LABELS),
                pretrained=True
            )
            try:
                checkpoint = torch.load(self.model_path, map_location=self.device)
                self.model.load_state_dict(checkpoint["model_state_dict"])
                logger.info("finetuned_weights_loaded", path=self.model_path)
            except:
                logger.warning("finetuned_weights_not_found", fallback="pretrained_only")
            self.model.to(self.device)
            self.model.eval()
            logger.info("classifier_ready", device=str(self.device))
        except Exception as e:
            logger.error("classifier_load_failed", error=str(e))
            raise
    
    @torch.no_grad()
    def predict(self, image: Image.Image) -> Dict[str, Any]:
        try:
            input_tensor = self.transform(image).unsqueeze(0).to(self.device)
            grade_logits, defect_logits, freshness_logits = self.model(input_tensor)
            grade_probs = torch.softmax(grade_logits, dim=1)[0]
            defect_probs = torch.softmax(defect_logits, dim=1)[0]
            freshness_probs = torch.softmax(freshness_logits, dim=1)[0]
            grade_idx = torch.argmax(grade_probs).item()
            defect_idx = torch.argmax(defect_probs).item()
            freshness_idx = torch.argmax(freshness_probs).item()
            result = {
                "grade": settings.GRADE_LABELS[grade_idx],
                "grade_confidence": float(grade_probs[grade_idx]),
                "grade_probs": {label: float(prob) for label, prob in zip(settings.GRADE_LABELS, grade_probs)},
                "defect_severity": settings.DEFECT_LABELS[defect_idx],
                "defect_confidence": float(defect_probs[defect_idx]),
                "freshness": settings.FRESHNESS_LABELS[freshness_idx],
                "freshness_confidence": float(freshness_probs[freshness_idx])
            }
            logger.info("classification_success", grade=result["grade"], confidence=result["grade_confidence"])
            return result
        except Exception as e:
            logger.error("classification_failed", error=str(e))
            raise
