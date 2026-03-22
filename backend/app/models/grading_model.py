"""
Crop Quality Grading Model
Uses pre-trained MobileNetV3 or ResNet-50 for crop quality assessment
"""

import numpy as np
import logging
from typing import Dict, List
import random

logger = logging.getLogger(__name__)

# Crop-specific attribute weights (from design doc)
CROP_WEIGHTS = {
    'wheat': {'physical': 0.30, 'visual': 0.20, 'damage': 0.15, 'freshness': 0.05, 'contamination': 0.30},
    'tomato': {'physical': 0.20, 'visual': 0.30, 'damage': 0.15, 'freshness': 0.30, 'contamination': 0.05},
    'onion': {'physical': 0.30, 'visual': 0.20, 'damage': 0.10, 'freshness': 0.25, 'cropSpecific': 0.15},
    'chilli': {'physical': 0.20, 'visual': 0.35, 'damage': 0.05, 'contamination': 0.15, 'cropSpecific': 0.25},
    'cardamom': {'physical': 0.20, 'visual': 0.25, 'freshness': 0.05, 'contamination': 0.15, 'cropSpecific': 0.35},
    'potato': {'physical': 0.30, 'visual': 0.15, 'damage': 0.25, 'contamination': 0.10, 'cropSpecific': 0.20},
    'rice': {'physical': 0.35, 'visual': 0.05, 'damage': 0.15, 'contamination': 0.20, 'cropSpecific': 0.25},
    'cotton': {'physical': 0.20, 'visual': 0.10, 'damage': 0.05, 'contamination': 0.25, 'cropSpecific': 0.40},
}


class CropGradingModel:
    """
    Crop quality grading model wrapper
    Currently uses mock predictions - will be replaced with actual TensorFlow model
    """
    
    def __init__(self, model_path: str = None):
        """
        Initialize the grading model
        
        Args:
            model_path: Path to saved model file (optional)
        """
        self.model = None
        self.model_loaded = False
        
        try:
            # TODO: Load actual TensorFlow model
            # self.model = tf.keras.models.load_model(model_path)
            # self.model_loaded = True
            
            # For now, use mock model
            logger.info("Using mock grading model (TensorFlow model not yet trained)")
            self.model_loaded = True
            
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise
    
    def predict(self, image: np.ndarray, crop_type: str) -> Dict:
        """
        Predict crop quality grade from image
        
        Args:
            image: Preprocessed image array (1, 224, 224, 3)
            crop_type: Type of crop
        
        Returns:
            Dictionary with grading results
        """
        try:
            # TODO: Replace with actual model inference
            # predictions = self.model.predict(image)
            
            # Mock prediction for now
            grade, confidence, attributes = self._mock_predict(crop_type)
            
            # Calculate attribute scores
            scores = self._calculate_scores(attributes, crop_type)
            
            # Identify influential categories
            influential = self._get_influential_categories(scores)
            
            return {
                'grade': grade,
                'confidence': confidence,
                'attributes': attributes,
                'attributeScores': scores,
                'influentialCategories': influential
            }
            
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            raise
    
    def _mock_predict(self, crop_type: str) -> tuple:
        """
        Generate mock predictions (temporary until model is trained)
        """
        # Random grade with weighted probabilities
        grades = ['A', 'B', 'C']
        grade_probs = [0.4, 0.4, 0.2]  # 40% A, 40% B, 20% C
        grade = random.choices(grades, weights=grade_probs)[0]
        
        # Confidence based on grade
        if grade == 'A':
            confidence = random.uniform(85, 95)
        elif grade == 'B':
            confidence = random.uniform(75, 90)
        else:
            confidence = random.uniform(70, 85)
        
        # Generate mock attributes
        attributes = self._generate_mock_attributes(grade, crop_type)
        
        return grade, round(confidence, 1), attributes
    
    def _generate_mock_attributes(self, grade: str, crop_type: str) -> Dict:
        """Generate realistic mock attribute values based on grade"""
        
        # Base scores by grade
        if grade == 'A':
            base_range = (85, 95)
            damage_range = (0, 5)
        elif grade == 'B':
            base_range = (70, 85)
            damage_range = (5, 15)
        else:
            base_range = (50, 70)
            damage_range = (15, 30)
        
        def rand_score(low, high):
            return round(random.uniform(low, high), 1)
        
        def rand_damage(low, high):
            return round(random.uniform(low, high), 1)
        
        attributes = {
            'physical': {
                'sizeUniformity': rand_score(*base_range),
                'shapeRegularity': rand_score(*base_range),
                'weightConsistency': rand_score(*base_range),
                'textureQuality': rand_score(*base_range),
                'firmnessLevel': rand_score(*base_range),
                'maturityLevel': rand_score(*base_range),
            },
            'visual': {
                'colorConsistency': rand_score(*base_range),
                'colorIntensity': rand_score(*base_range),
                'glossLevel': rand_score(*base_range),
                'surfaceBlemishes': rand_damage(*damage_range),
                'discolorationPatterns': rand_damage(*damage_range),
                'bruisingIndicators': rand_damage(*damage_range),
            },
            'damage': {
                'physicalDamage': rand_damage(*damage_range),
                'insectDamage': rand_damage(*damage_range),
                'diseaseSymptoms': rand_damage(*damage_range),
                'mechanicalDamage': rand_damage(*damage_range),
                'weatherDamage': rand_damage(*damage_range),
                'storageDamage': rand_damage(*damage_range),
                'totalDamagePercentage': rand_damage(*damage_range),
            },
            'freshness': {
                'moistureContent': rand_score(*base_range),
                'wiltingIndicators': rand_damage(*damage_range),
                'stemLeafFreshness': rand_score(*base_range),
                'skinIntegrity': rand_score(*base_range),
                'estimatedShelfLife': random.randint(5, 14) if grade == 'A' else random.randint(3, 7),
                'freshnessScore': rand_score(*base_range),
            },
            'contamination': {
                'foreignMatter': rand_damage(*damage_range),
                'pestInfestation': rand_damage(*damage_range),
                'chemicalResidueIndicators': rand_damage(*damage_range),
                'moldFungalGrowth': rand_damage(*damage_range),
                'contaminationLevel': rand_damage(*damage_range),
            },
            'cropSpecific': self._generate_crop_specific(crop_type, base_range)
        }
        
        return attributes
    
    def _generate_crop_specific(self, crop_type: str, base_range: tuple) -> Dict:
        """Generate crop-specific attributes"""
        def rand_score(low, high):
            return round(random.uniform(low, high), 1)
        
        crop_attrs = {}
        
        if crop_type == 'tomato':
            crop_attrs = {
                'tomatoFirmness': rand_score(*base_range),
                'tomatoStemAttachment': rand_score(*base_range),
                'tomatoColorUniformity': rand_score(*base_range),
            }
        elif crop_type == 'onion':
            crop_attrs = {
                'onionBulbSize': rand_score(*base_range),
                'onionSkinQuality': rand_score(*base_range),
                'onionSprouting': rand_score(*base_range),
            }
        elif crop_type == 'wheat':
            crop_attrs = {
                'wheatGrainSizeDistribution': rand_score(*base_range),
                'wheatForeignMatter': rand_score(*base_range),
                'wheatBrokenGrains': rand_score(*base_range),
            }
        # Add more crop types as needed
        
        return crop_attrs
    
    def _calculate_scores(self, attributes: Dict, crop_type: str) -> Dict:
        """Calculate weighted scores for each attribute category"""
        
        def avg_score(values: Dict) -> float:
            """Calculate average score from attribute values"""
            numeric_values = [v for v in values.values() if isinstance(v, (int, float))]
            return sum(numeric_values) / len(numeric_values) if numeric_values else 0
        
        # Calculate category scores
        physical_score = avg_score(attributes['physical'])
        visual_score = avg_score(attributes['visual'])
        damage_score = 100 - avg_score(attributes['damage'])  # Invert damage (less is better)
        freshness_score = avg_score(attributes['freshness'])
        contamination_score = 100 - avg_score(attributes['contamination'])  # Invert
        crop_specific_score = avg_score(attributes['cropSpecific']) if attributes['cropSpecific'] else 0
        
        # Get weights for this crop
        weights = CROP_WEIGHTS.get(crop_type, {
            'physical': 0.25, 'visual': 0.20, 'damage': 0.15, 
            'freshness': 0.15, 'contamination': 0.15, 'cropSpecific': 0.10
        })
        
        # Calculate weighted overall score
        overall = (
            physical_score * weights.get('physical', 0.25) +
            visual_score * weights.get('visual', 0.20) +
            damage_score * weights.get('damage', 0.15) +
            freshness_score * weights.get('freshness', 0.15) +
            contamination_score * weights.get('contamination', 0.15) +
            crop_specific_score * weights.get('cropSpecific', 0.10)
        )
        
        return {
            'physical': round(physical_score, 1),
            'visual': round(visual_score, 1),
            'damage': round(damage_score, 1),
            'freshness': round(freshness_score, 1),
            'contamination': round(contamination_score, 1),
            'cropSpecific': round(crop_specific_score, 1),
            'overall': round(overall, 1)
        }
    
    def _get_influential_categories(self, scores: Dict) -> List[str]:
        """Identify top 3 most influential categories"""
        # Remove 'overall' from consideration
        category_scores = {k: v for k, v in scores.items() if k != 'overall'}
        
        # Sort by score (descending)
        sorted_categories = sorted(category_scores.items(), key=lambda x: x[1], reverse=True)
        
        # Return top 3
        return [cat[0] for cat in sorted_categories[:3]]
    
    def aggregate_results(self, results: List[Dict]) -> Dict:
        """
        Aggregate results from multiple images
        
        Args:
            results: List of prediction results from multiple images
        
        Returns:
            Aggregated result
        """
        # Use majority voting for grade
        grades = [r['grade'] for r in results]
        final_grade = max(set(grades), key=grades.count)
        
        # Average confidence
        avg_confidence = sum(r['confidence'] for r in results) / len(results)
        
        # Use result with highest confidence for attributes
        best_result = max(results, key=lambda x: x['confidence'])
        
        return {
            'grade': final_grade,
            'confidence': round(avg_confidence, 1),
            'attributes': best_result['attributes'],
            'attributeScores': best_result['attributeScores'],
            'influentialCategories': best_result['influentialCategories'],
            'num_images_processed': len(results)
        }
