"""
Image preprocessing utilities for crop grading
"""

import io
import numpy as np
from PIL import Image
import logging

logger = logging.getLogger(__name__)

# Target image size for model input
TARGET_SIZE = (224, 224)  # Standard for MobileNetV3 and ResNet


def preprocess_image(image_data: bytes) -> np.ndarray:
    """
    Preprocess image for model inference
    
    Args:
        image_data: Raw image bytes
    
    Returns:
        Preprocessed image as numpy array (1, 224, 224, 3)
    """
    try:
        # Load image from bytes
        image = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize to target size
        image = image.resize(TARGET_SIZE, Image.Resampling.LANCZOS)
        
        # Convert to numpy array
        img_array = np.array(image, dtype=np.float32)
        
        # Normalize pixel values to [0, 1]
        img_array = img_array / 255.0
        
        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)
        
        logger.info(f"Image preprocessed successfully: shape {img_array.shape}")
        
        return img_array
        
    except Exception as e:
        logger.error(f"Error preprocessing image: {e}")
        raise ValueError(f"Failed to preprocess image: {str(e)}")


def augment_image(image_array: np.ndarray) -> list[np.ndarray]:
    """
    Create augmented versions of image for better prediction
    
    Args:
        image_array: Preprocessed image array
    
    Returns:
        List of augmented image arrays
    """
    augmented = [image_array]
    
    # Original image without batch dimension for augmentation
    img = image_array[0]
    
    # Horizontal flip
    flipped = np.fliplr(img)
    augmented.append(np.expand_dims(flipped, axis=0))
    
    # Slight brightness adjustment
    brightened = np.clip(img * 1.1, 0, 1)
    augmented.append(np.expand_dims(brightened, axis=0))
    
    darkened = np.clip(img * 0.9, 0, 1)
    augmented.append(np.expand_dims(darkened, axis=0))
    
    return augmented
