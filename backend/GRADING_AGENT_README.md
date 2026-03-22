# Quality Grading Agent

Production-ready AI service for crop quality grading using YOLO segmentation + EfficientNet-B0 classification.

## Architecture

**2-Stage Pipeline:**
1. **YOLO Segmentation** - Detects and segments crop from background
2. **EfficientNet-B0 Classification** - Multi-output grading (grade, defects, freshness)

## Features

- ✅ Real-world image handling (background clutter, poor lighting, shadows)
- ✅ Multi-output prediction (grade A/B/C, defect severity, freshness)
- ✅ Image quality validation (blur, brightness, resolution)
- ✅ Rule-based explainability (farmer-friendly explanations)
- ✅ Production-ready error handling
- ✅ Structured logging
- ✅ FastAPI with automatic docs
- ✅ Configurable thresholds
- ✅ Debug endpoints for testing

## Installation

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements-grading-agent.txt
```

### 2. Download Models (Optional)

For MVP, the system uses pretrained models:
- YOLO: `yolov8n-seg.pt` (auto-downloaded)
- EfficientNet: Pretrained ImageNet weights

For production with fine-tuned weights:
```bash
# Place your models in backend/models/
mkdir -p models
# Copy yolo_seg.pt and efficientnet_grading.pth
```

### 3. Configuration

Create `.env` file:
```env
DEBUG=false
PORT=8003
YOLO_CONFIDENCE_THRESHOLD=0.5
CLASSIFIER_CONFIDENCE_THRESHOLD=0.6
MAX_UPLOAD_SIZE_MB=10
LOG_LEVEL=INFO
```

## Running the Service

### Development
```bash
python -m app.main
```

### Production
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8003 --workers 4
```

## API Endpoints

### 1. Grade Quality
```bash
POST /api/v1/quality-grade
```

**Request:**
```bash
curl -X POST "http://localhost:8003/api/v1/quality-grade" \
  -F "image=@tomato.jpg" \
  -F "cropType=tomato"
```

**Response:**
```json
{
  "success": true,
  "cropType": "tomato",
  "grade": "A",
  "gradeConfidence": 0.91,
  "defectSeverity": "low",
  "freshness": "fresh",
  "marketability": "high",
  "warnings": [],
  "segmentation": {
    "detected": true,
    "confidence": 0.93,
    "bbox": [120, 80, 450, 380],
    "mask_area": 45600,
    "num_detections": 1
  },
  "explanation": {
    "summary": "Premium quality crop with excellent market potential. Minimal defects and strong freshness indicators.",
    "factors": [
      "Premium quality detected",
      "Minimal visible defects",
      "Excellent freshness indicators",
      "High confidence in quality assessment"
    ],
    "recommendations": null
  },
  "processingTimeMs": 1847.3,
  "modelVersion": "yolov8-seg + efficientnet-b0 v1.0.0"
}
```

### 2. Health Check
```bash
GET /api/v1/health
```

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "modelsLoaded": {
    "yolo": true,
    "efficientnet": true
  },
  "timestamp": "2026-03-22T12:00:00"
}
```

### 3. Debug Endpoint
```bash
POST /api/v1/quality-grade/debug
```

Returns intermediate outputs for testing.

## Project Structure

```
backend/
├── app/
│   ├── main.py                          # FastAPI application
│   ├── core/
│   │   ├── config.py                    # Configuration management
│   │   └── logging.py                   # Structured logging
│   ├── models/
│   │   ├── schemas.py                   # Pydantic schemas
│   │   ├── yolo_segmentor.py           # YOLO segmentation
│   │   └── efficientnet_classifier.py  # EfficientNet classifier
│   ├── services/
│   │   ├── grading_service.py          # Main orchestration
│   │   ├── image_preprocessor.py       # Image validation
│   │   └── explainability_service.py   # Explanation generation
│   └── api/
│       └── routes/
│           └── quality_grading.py      # API routes
├── models/                              # Model weights (optional)
├── requirements-grading-agent.txt      # Dependencies
└── GRADING_AGENT_README.md            # This file
```

## Error Handling

The service handles:
- ❌ Invalid file types → 400 Bad Request
- ❌ File too large → 413 Payload Too Large
- ❌ No crop detected → Returns grade C with warning
- ❌ Model load failure → 503 Service Unavailable
- ❌ Blurry/dark images → Warning in response
- ❌ Multiple crops → Uses highest confidence

## Configuration Options

| Variable | Default | Description |
|----------|---------|-------------|
| `YOLO_CONFIDENCE_THRESHOLD` | 0.5 | Min confidence for detection |
| `CLASSIFIER_CONFIDENCE_THRESHOLD` | 0.6 | Min confidence for grade |
| `BLUR_THRESHOLD` | 100.0 | Laplacian variance threshold |
| `BRIGHTNESS_MIN` | 30 | Minimum brightness |
| `BRIGHTNESS_MAX` | 225 | Maximum brightness |
| `MIN_CROP_AREA_PIXELS` | 1000 | Min segmented area |
| `MAX_UPLOAD_SIZE_MB` | 10 | Max upload size |

## Training (Future Enhancement)

The code is structured for easy fine-tuning:

### YOLO Segmentation Training
```python
# Train on custom crop dataset
from ultralytics import YOLO
model = YOLO('yolov8n-seg.pt')
model.train(data='crops.yaml', epochs=100)
```

### EfficientNet Classifier Training
```python
# Fine-tune on labeled crop images
from app.models.efficientnet_classifier import EfficientNetGradingClassifier
model = EfficientNetGradingClassifier(pretrained=True)
# Add training loop with multi-output loss
```

## TODO / Future Enhancements

- [ ] Multi-crop batch processing
- [ ] Crop-specific models (8 crop types)
- [ ] Enhanced defect taxonomy (disease classification)
- [ ] Price band integration
- [ ] Multilingual explanation output
- [ ] Model versioning and A/B testing
- [ ] Prometheus metrics
- [ ] Redis caching for repeated images
- [ ] Async batch processing queue
- [ ] Mobile-optimized model (TFLite/ONNX)
- [ ] Grad-CAM visualization for explainability
- [ ] Farmer feedback loop for continuous learning

## Performance

**Expected Inference Times:**
- YOLO Segmentation: ~200-500ms
- EfficientNet Classification: ~100-300ms
- Total Pipeline: ~500-1000ms (CPU), ~200-400ms (GPU)

**Resource Requirements:**
- RAM: 2-4GB
- GPU: Optional (CUDA-compatible for faster inference)
- Storage: ~500MB for models

## Integration with Frontend

Update your frontend service to call this endpoint:

```typescript
// src/services/cropGradingService.ts
const GRADING_API_URL = 'http://localhost:8003/api/v1';

export async function gradeCrop(imageFile: File, cropType: string) {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('cropType', cropType);
  
  const response = await fetch(`${GRADING_API_URL}/quality-grade`, {
    method: 'POST',
    body: formData
  });
  
  return await response.json();
}
```

## Support

For issues or questions:
1. Check logs in structured JSON format
2. Use `/api/v1/quality-grade/debug` for detailed diagnostics
3. Review configuration in `.env`
4. Check model loading status via `/api/v1/health`

## License

Part of EktaMandi / The-Multilingual-Mandi agritech platform.
