"""
Download the credit card fraud detection dataset.
Falls back gracefully if download is not possible.
"""
import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
DATASET_PATH = BASE_DIR / 'creditcard_2023.csv'


def download_dataset():
    if DATASET_PATH.exists():
        size_mb = DATASET_PATH.stat().st_size / (1024 * 1024)
        if size_mb > 100:
            print(f"Dataset already exists ({size_mb:.1f} MB)")
            return True

    print("Dataset not found locally. Attempting to download...")
    
    # Try to download from Hugging Face datasets
    datasets = None
    try:
        # Try direct HTTP download from Hugging Face datasets repository
        import urllib.request
        import gzip
        
        # Primary download disabled for reliability; direct download will be used when available.
        # If a reliable URL is provided later, it can be restored here.
    except ImportError:
        pass
    
    # Try with kagglehub
    try:
        import kagglehub
        path = kagglehub.dataset_download("nelgiriyewithana/credit-card-fraud-detection-dataset-2023")
        import shutil
        for f in Path(path).iterdir():
            if f.suffix == '.csv':
                shutil.copy(f, DATASET_PATH)
                size_mb = DATASET_PATH.stat().st_size / (1024 * 1024)
                if size_mb > 100:
                    print(f"Downloaded dataset via kagglehub: {size_mb:.1f} MB")
                    return True
    except Exception as e:
        print(f"kagglehub download failed: {e}")
    
    print("Could not download dataset. Simulation will use demo mode with generated fraud patterns.")
    return False


if __name__ == "__main__":
    success = download_dataset()
    sys.exit(0 if success else 1)