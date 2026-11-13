import sys
import os
from pathlib import Path
import asyncio

# Setup path so we can import the app
ROOT_DIR = Path(__file__).resolve().parent
sys.path.append(str(ROOT_DIR))

from app.diseases_detection.schema import DiseaseRequest
from app.diseases_detection.service import detect_disease

def main():
    print("Testing Disease Detection...")
    
    # Let's create a dummy image or use an existing one if available
    dummy_image_path = ROOT_DIR / "dummy_leaf.jpg"
    if not dummy_image_path.exists():
        from PIL import Image
        img = Image.new('RGB', (224, 224), color = (0, 128, 0))
        img.save(dummy_image_path)
        print("Created dummy leaf image.")

    request = DiseaseRequest(crop_name="tomato", image_path=str(dummy_image_path))
    
    try:
        result = detect_disease(request)
        print("Result:", result)
    except Exception as e:
        print(f"Error during detection: {e}")

if __name__ == "__main__":
    main()
