"""
Rule-based explainability for grading decisions
Generates farmer-friendly explanations without LLM
"""
from typing import Dict, List
from app.models.schemas import GradeEnum, DefectSeverityEnum, FreshnessEnum, MarketabilityEnum, ExplanationFactors


class ExplainabilityService:
    """Generate human-readable explanations for grading decisions"""
    
    @staticmethod
    def generate_explanation(
        grade: str,
        grade_confidence: float,
        defect_severity: str,
        freshness: str,
        warnings: List[str]
    ) -> ExplanationFactors:
        """
        Generate explanation based on model outputs
        
        Args:
            grade: Quality grade (A/B/C)
            grade_confidence: Confidence score
            defect_severity: Defect level
            freshness: Freshness level
            warnings: List of warnings
            
        Returns:
            ExplanationFactors with summary and factors
        """
        factors = []
        recommendations = []
        
        # Grade-specific factors
        if grade == "A":
            factors.append("Premium quality detected")
            if defect_severity == "low":
                factors.append("Minimal visible defects")
            if freshness == "fresh":
                factors.append("Excellent freshness indicators")
        elif grade == "B":
            factors.append("Good quality with minor issues")
            if defect_severity == "medium":
                factors.append("Some visible defects present")
            if freshness == "moderate":
                factors.append("Acceptable freshness level")
        else:  # Grade C
            factors.append("Quality concerns detected")
            if defect_severity == "high":
                factors.append("Significant defects observed")
                recommendations.append("Consider sorting to remove damaged produce")
            if freshness == "stale":
                factors.append("Freshness indicators below optimal")
                recommendations.append("Sell quickly to minimize losses")
        
        # Confidence-based factors
        if grade_confidence < 0.7:
            factors.append("Moderate confidence in assessment")
            recommendations.append("Consider uploading clearer images for better accuracy")
        elif grade_confidence >= 0.9:
            factors.append("High confidence in quality assessment")
        
        # Warning-based factors
        if any("blurry" in w.lower() for w in warnings):
            recommendations.append("Retake photo in better lighting for improved accuracy")
        if any("dark" in w.lower() for w in warnings):
            recommendations.append("Use natural daylight for better image quality")
        
        # Generate summary
        summary = ExplainabilityService._generate_summary(
            grade, defect_severity, freshness, grade_confidence
        )
        
        return ExplanationFactors(
            summary=summary,
            factors=factors,
            recommendations=recommendations if recommendations else None
        )
    
    @staticmethod
    def _generate_summary(grade: str, defect: str, freshness: str, confidence: float) -> str:
        """Generate concise summary statement"""
        if grade == "A" and defect == "low" and freshness == "fresh":
            return "Premium quality crop with excellent market potential. Minimal defects and strong freshness indicators."
        elif grade == "A":
            return "High quality crop suitable for premium markets with good overall characteristics."
        elif grade == "B" and confidence >= 0.7:
            return "Good quality crop with acceptable characteristics for standard markets."
        elif grade == "B":
            return "Moderate quality crop with some visible issues but still marketable."
        elif grade == "C" and defect == "high":
            return "Quality concerns detected with significant defects. Consider sorting or quick sale."
        else:
            return "Below standard quality. Recommend immediate action to minimize losses."
    
    @staticmethod
    def determine_marketability(grade: str, defect_severity: str, freshness: str) -> MarketabilityEnum:
        """Determine market readiness based on quality factors"""
        if grade == "A" and defect_severity == "low" and freshness == "fresh":
            return MarketabilityEnum.HIGH
        elif grade == "A" or (grade == "B" and defect_severity != "high"):
            return MarketabilityEnum.HIGH if grade == "A" else MarketabilityEnum.MEDIUM
        elif grade == "B":
            return MarketabilityEnum.MEDIUM
        else:
            return MarketabilityEnum.LOW
