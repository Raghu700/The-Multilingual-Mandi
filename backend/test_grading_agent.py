"""
Quick test script for Quality Grading Agent
Tests the API with a sample image
"""
import requests
import sys
from pathlib import Path


def test_health():
    """Test health endpoint"""
    print("Testing health endpoint...")
    response = requests.get("http://localhost:8003/api/v1/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}\n")
    return response.status_code == 200


def test_grading(image_path: str, crop_type: str = "tomato"):
    """Test grading endpoint"""
    print(f"Testing grading with image: {image_path}")
    
    if not Path(image_path).exists():
        print(f"Error: Image file not found: {image_path}")
        return False
    
    with open(image_path, 'rb') as f:
        files = {'image': f}
        data = {'cropType': crop_type}
        
        response = requests.post(
            "http://localhost:8003/api/v1/quality-grade",
            files=files,
            data=data
        )
    
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"\n✅ Grading Success!")
        print(f"Grade: {result['grade']}")
        print(f"Confidence: {result['gradeConfidence']:.2%}")
        print(f"Defect Severity: {result['defectSeverity']}")
        print(f"Freshness: {result['freshness']}")
        print(f"Marketability: {result['marketability']}")
        print(f"Processing Time: {result['processingTimeMs']:.1f}ms")
        print(f"\nSegmentation:")
        print(f"  Detected: {result['segmentation']['detected']}")
        print(f"  Confidence: {result['segmentation']['confidence']:.2%}")
        print(f"\nExplanation:")
        print(f"  {result['explanation']['summary']}")
        print(f"\nFactors:")
        for factor in result['explanation']['factors']:
            print(f"  - {factor}")
        
        if result['warnings']:
            print(f"\n⚠️  Warnings:")
            for warning in result['warnings']:
                print(f"  - {warning}")
        
        return True
    else:
        print(f"Error: {response.text}")
        return False


if __name__ == "__main__":
    print("=" * 60)
    print("Quality Grading Agent - Test Script")
    print("=" * 60)
    print()
    
    # Test health
    if not test_health():
        print("❌ Health check failed. Is the server running?")
        print("Start server with: python -m app.main")
        sys.exit(1)
    
    # Test grading
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
        crop_type = sys.argv[2] if len(sys.argv) > 2 else "tomato"
        test_grading(image_path, crop_type)
    else:
        print("Usage: python test_grading_agent.py <image_path> [crop_type]")
        print("Example: python test_grading_agent.py tomato.jpg tomato")
