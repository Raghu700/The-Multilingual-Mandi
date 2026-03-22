# Quick Reference - Crop Type Validation

## 🎯 What It Does

Validates that uploaded crop images match the selected crop type. Prevents buildings, wrong crops, or random objects from getting high quality grades.

## ⚡ Quick Test

1. **Start Backend**: `cd backend && python -m app.main`
2. **Open Test Page**: `test_crop_validation.html` in browser
3. **Test**: Select tomato → Upload building image → Should get Grade C + warnings

## 📊 How It Works

```
User selects "Tomato" → Uploads image → System checks:
├─ Detection confidence ≥ 60%? ✓/✗
├─ Classification confidence ≥ 40%? ✓/✗
└─ Aspect ratio 0.3-3.0? ✓/✗

If any check fails → Grade C + Warning
If all checks pass → Normal grading
```

## 🔧 Key Files

| File | Purpose |
|------|---------|
| `backend/app/services/grading_service.py` | Validation logic |
| `src/components/CropGradingDemo.tsx` | Warning display |
| `src/services/cropGradingService.ts` | API integration |
| `test_crop_validation.html` | Test page |

## 📈 Validation Thresholds (STRICT MODE)

| Check | Threshold | Action if Failed |
|-------|-----------|------------------|
| Detection Confidence | < 75% | Grade C + "Detection confidence too low" |
| Classification Confidence | < 70% | Grade C + "Cannot confirm crop type match" |
| Aspect Ratio | < 0.4 or > 2.5 | Grade C + "Object shape doesn't match crop" |
| Warning Threshold | < 85% | Add warning even if passing |

## 🧪 Test Scenarios

| Scenario | Expected Result |
|----------|----------------|
| ✅ Correct crop (tomato → tomato) | Normal grade (A/B/C based on quality) |
| ⚠️ Wrong crop (tomato → rice) | Grade C + "May not match crop type" |
| ⚠️ Non-crop (tomato → building) | Grade C + Multiple warnings |

## 🚀 Status

✅ Backend: Running on port 8003  
✅ Frontend: Running on port 8000  
✅ Validation: Active  
✅ Tests: Ready  

## 📝 API Example

```bash
# Request
curl -X POST http://localhost:8003/api/v1/quality-grade \
  -F "image=@tomato.jpg" \
  -F "cropType=tomato"

# Response (mismatch detected)
{
  "grade": "C",
  "gradeConfidence": 12.5,
  "warnings": [
    "Classification confidence very low (35%) - uploaded image may not match selected crop type 'tomato'"
  ]
}
```

## 🎨 UI Display

Warnings appear in yellow box:
```
⚠️ Warning
Classification confidence very low (35%) - 
uploaded image may not match selected crop type 'tomato'
```

## 🔍 Debugging

**Check Backend Health**:
```bash
curl http://localhost:8003/api/v1/health
```

**View Backend Logs**:
- Look for: `crop_type_mismatch` events
- Check: Detection and classification confidence values

**Test Endpoint**:
```bash
curl -X POST http://localhost:8003/api/v1/quality-grade/debug \
  -F "image=@test.jpg"
```

## 📚 Documentation

- **Full Details**: `CROP_TYPE_VALIDATION.md`
- **Implementation**: `CROP_VALIDATION_SUMMARY.md`
- **Testing Guide**: `TESTING_GUIDE.md`
- **Backend Docs**: `backend/GRADING_AGENT_README.md`

## 🎯 Success Criteria

- [x] Wrong crops get Grade C
- [x] Non-crop objects get Grade C
- [x] Clear warning messages
- [x] Correct crops grade normally
- [x] Backend running and healthy
- [x] Frontend displays warnings

## 🚦 Next Steps

1. Test with real crop images
2. Test with wrong crop images
3. Test with non-crop images
4. Adjust thresholds if needed
5. Collect farmer feedback

## 💡 Tips

- Use `test_crop_validation.html` for quick testing
- Check browser console for API responses
- Backend logs show validation details
- Confidence < 40% = likely mismatch
- Multiple warnings = definitely wrong image

## ⚙️ Configuration

Edit thresholds in `backend/app/services/grading_service.py`:

```python
# Line ~85: Detection threshold
if detection_conf < 0.6:  # Change 0.6 to adjust

# Line ~92: Classification threshold
if grade_conf < 0.4:  # Change 0.4 to adjust

# Line ~103: Aspect ratio
if aspect_ratio < 0.3 or aspect_ratio > 3.0:  # Adjust range
```

Restart backend after changes.

---

**Ready to test!** Open `test_crop_validation.html` and try uploading different images. 🎉
