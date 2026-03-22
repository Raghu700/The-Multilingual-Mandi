# Testing Guide - Crop Type Validation

## 🎯 What to Test

The crop type validation feature ensures uploaded images match the selected crop type. This guide will help you test all scenarios.

## 🚀 Quick Start

### 1. Ensure Backend is Running

Check if backend is running on port 8003:
```bash
curl http://localhost:8003/api/v1/health
```

Expected response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "modelsLoaded": {
    "yolo": true,
    "efficientnet": true
  },
  "timestamp": "2026-03-22T19:24:48.903645"
}
```

If not running, start it:
```bash
cd backend
python -m app.main
```

### 2. Choose Your Testing Method

#### Option A: Web Test Page (Recommended)
1. Open `test_crop_validation.html` in your browser
2. Select a crop type from dropdown
3. Upload an image
4. Click "Test Validation"
5. View results with warnings

#### Option B: Main Application
1. Ensure frontend is running (npm run dev)
2. Navigate to the Quality Grading tab
3. Select a crop type
4. Upload 2-3 images
5. Click "Analyze"
6. View results with warnings

#### Option C: Command Line (curl)
```bash
# Test with tomato
curl -X POST http://localhost:8003/api/v1/quality-grade \
  -F "image=@path/to/image.jpg" \
  -F "cropType=tomato"
```

## 🧪 Test Scenarios

### Test Case 1: Correct Crop Match ✅

**Setup**:
- Select: Tomato
- Upload: Actual tomato image

**Expected Result**:
- Grade: A, B, or C (based on actual quality)
- Confidence: High (60%+)
- Warnings: None or minimal
- Success message

**What to Check**:
- [ ] Grade reflects actual crop quality
- [ ] Confidence is reasonable (50%+)
- [ ] No crop mismatch warnings
- [ ] Processing completes successfully

---

### Test Case 2: Wrong Crop Type ⚠️

**Setup**:
- Select: Tomato
- Upload: Rice/wheat/onion image (different crop)

**Expected Result**:
- Grade: C (forced downgrade)
- Confidence: Low (< 40%)
- Warning: "Classification confidence very low - uploaded image may not match selected crop type"
- Yellow warning box displayed

**What to Check**:
- [ ] Grade is forced to C
- [ ] Confidence is significantly reduced
- [ ] Warning message mentions crop type mismatch
- [ ] Warning is clearly visible to user

---

### Test Case 3: Non-Crop Object ⚠️

**Setup**:
- Select: Any crop (e.g., Tomato)
- Upload: Building, person, landscape, or random object

**Expected Result**:
- Grade: C (forced downgrade)
- Confidence: Very low (< 20%)
- Multiple warnings:
  - "Low detection confidence - image may not contain [crop]"
  - "Unusual object shape detected - may not be [crop]"
- Yellow warning box with multiple warnings

**What to Check**:
- [ ] Grade is forced to C
- [ ] Multiple warnings displayed
- [ ] Warnings mention detection issues
- [ ] Aspect ratio warning if applicable

---

### Test Case 4: Poor Quality Image ⚠️

**Setup**:
- Select: Any crop
- Upload: Blurry, dark, or very small crop image

**Expected Result**:
- Grade: May be C or low B
- Warnings about image quality:
  - "Image appears blurry"
  - "Image too dark/bright"
  - "Detected crop area too small"

**What to Check**:
- [ ] Image quality warnings displayed
- [ ] Grade reflects poor quality
- [ ] User understands what's wrong

---

### Test Case 5: Multiple Objects ⚠️

**Setup**:
- Select: Any crop
- Upload: Image with multiple crops or objects

**Expected Result**:
- Grade: Based on highest confidence detection
- Warning: "Multiple objects detected (X), using highest confidence"

**What to Check**:
- [ ] System picks best detection
- [ ] Warning about multiple objects
- [ ] Grading still completes

---

## 📊 Validation Thresholds

Understanding the validation logic:

| Check | Threshold | Purpose |
|-------|-----------|---------|
| Detection Confidence | ≥ 60% | Ensure object is recognizable |
| Classification Confidence (Reject) | < 40% | Detect wrong crop type |
| Classification Confidence (Accept) | ≥ 50% | Confirm correct crop type |
| Aspect Ratio | 0.3 - 3.0 | Detect non-crop objects |

## 🔍 What to Look For

### In the UI:

1. **Grade Display**:
   - Large, clear grade (A/B/C)
   - Color-coded (Green/Yellow/Red)

2. **Warning Box**:
   - Yellow background with ⚠️ icon
   - Clear warning text
   - Explains what went wrong

3. **Confidence Score**:
   - Displayed as percentage
   - Low confidence (< 40%) indicates issues

4. **Processing Time**:
   - Should be < 5 seconds
   - Displayed in milliseconds

### In the API Response:

```json
{
  "success": true,
  "cropType": "tomato",
  "grade": "C",
  "gradeConfidence": 12.5,
  "defectSeverity": "high",
  "freshness": "moderate",
  "marketability": "low",
  "warnings": [
    "Classification confidence very low (35%) - uploaded image may not match selected crop type 'tomato'"
  ],
  "segmentation": {
    "detected": true,
    "confidence": 0.72,
    "bbox": [100, 150, 400, 450]
  },
  "explanation": {
    "summary": "Quality assessment indicates concerns...",
    "factors": [...]
  },
  "processingTimeMs": 2341
}
```

## 🐛 Troubleshooting

### Backend Not Responding

**Symptom**: Cannot connect to http://localhost:8003

**Solution**:
```bash
cd backend
python -m app.main
```

Wait for: "Uvicorn running on http://0.0.0.0:8003"

---

### Models Not Loading

**Symptom**: Health check shows `"modelsLoaded": {"yolo": false, "efficientnet": false}`

**Solution**:
1. Check if model files exist:
   - `backend/yolov8n-seg.pt` (YOLO)
   - `backend/models/efficientnet_grading.pth` (EfficientNet - optional)

2. YOLO will auto-download if missing
3. EfficientNet uses pretrained weights (no file needed for MVP)

---

### No Warnings Displayed

**Symptom**: Wrong crop uploaded but no warnings shown

**Possible Causes**:
1. Frontend not reading `warnings` field from API
2. Backend validation not running
3. Confidence thresholds too lenient

**Check**:
1. Inspect API response in browser DevTools
2. Look for `warnings` array in response
3. Check backend logs for validation messages

---

### All Images Get Grade C

**Symptom**: Every image gets Grade C regardless of quality

**Possible Causes**:
1. Validation thresholds too strict
2. Model not loaded properly
3. Image preprocessing issues

**Check**:
1. Test with known good crop image
2. Check backend logs for errors
3. Try debug endpoint: `/api/v1/quality-grade/debug`

---

## 📝 Test Checklist

Use this checklist to ensure comprehensive testing:

- [ ] Backend health check passes
- [ ] Frontend loads without errors
- [ ] Test Case 1: Correct crop → Normal grading
- [ ] Test Case 2: Wrong crop → Grade C + warning
- [ ] Test Case 3: Non-crop object → Grade C + multiple warnings
- [ ] Test Case 4: Poor quality image → Quality warnings
- [ ] Test Case 5: Multiple objects → Multiple detection warning
- [ ] Warning messages are clear and helpful
- [ ] Confidence scores make sense
- [ ] Processing time is reasonable (< 5s)
- [ ] UI displays warnings prominently
- [ ] Grade colors are correct (A=green, B=yellow, C=red)

## 🎓 Understanding Results

### Good Result (Correct Crop):
```
Grade: A or B
Confidence: 60-95%
Warnings: None or minor
Marketability: High or Medium
```

### Suspicious Result (Wrong Crop):
```
Grade: C
Confidence: 10-40%
Warnings: "Classification confidence very low..."
Marketability: Low
```

### Failed Detection (Non-Crop):
```
Grade: C
Confidence: < 20%
Warnings: Multiple (detection, aspect ratio, etc.)
Marketability: Low
```

## 🚀 Next Steps After Testing

1. **Document Findings**:
   - Which scenarios work well?
   - Which need threshold adjustments?
   - Any false positives/negatives?

2. **Adjust Thresholds** (if needed):
   - Edit `backend/app/services/grading_service.py`
   - Modify confidence thresholds
   - Restart backend

3. **Collect Real Data**:
   - Test with actual farmer photos
   - Document edge cases
   - Build test dataset

4. **Iterate**:
   - Refine validation logic
   - Improve warning messages
   - Add crop-specific rules

## 📞 Support

If you encounter issues:

1. Check backend logs in terminal
2. Check browser console for frontend errors
3. Review `CROP_TYPE_VALIDATION.md` for detailed documentation
4. Test with `test_crop_validation.html` for isolated testing

## ✅ Success Criteria

The validation feature is working correctly if:

1. ✅ Correct crops get normal grades (A/B/C based on quality)
2. ✅ Wrong crops get Grade C with warnings
3. ✅ Non-crop objects get Grade C with multiple warnings
4. ✅ Warning messages are clear and helpful
5. ✅ System doesn't give high grades to obviously wrong images
6. ✅ Processing completes in reasonable time (< 5s)
7. ✅ UI displays warnings prominently

Happy Testing! 🎉
