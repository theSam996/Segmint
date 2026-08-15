"""
Segmint — Dataset Downloader
Downloads the UCI Online Retail Dataset from the official archive.
"""

import os
import requests

DATASET_URL = "https://archive.ics.uci.edu/ml/machine-learning-databases/00352/Online%20Retail.xlsx"
DEFAULT_SAVE_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "raw", "online_retail.xlsx")


def download_dataset(save_path: str = None, force: bool = False) -> str:
    """
    Download the UCI Online Retail Dataset (.xlsx).

    Args:
        save_path: Where to save the file. Defaults to data/raw/online_retail.xlsx.
        force: If True, re-download even if the file already exists.

    Returns:
        The absolute path to the downloaded file.
    """
    if save_path is None:
        save_path = os.path.abspath(DEFAULT_SAVE_PATH)
    else:
        save_path = os.path.abspath(save_path)

    # Create directory if it doesn't exist
    os.makedirs(os.path.dirname(save_path), exist_ok=True)

    # Skip if already downloaded (idempotent)
    if os.path.exists(save_path) and not force:
        file_size = os.path.getsize(save_path)
        print(f"✓ Dataset already exists at {save_path} ({file_size / 1024 / 1024:.1f} MB)")
        return save_path

    print(f"⬇ Downloading UCI Online Retail Dataset...")
    print(f"  Source: {DATASET_URL}")

    response = requests.get(DATASET_URL, stream=True, timeout=120)
    response.raise_for_status()

    total_size = int(response.headers.get("content-length", 0))
    downloaded = 0

    with open(save_path, "wb") as f:
        for chunk in response.iter_content(chunk_size=8192):
            if chunk:
                f.write(chunk)
                downloaded += len(chunk)
                if total_size > 0:
                    pct = (downloaded / total_size) * 100
                    print(f"\r  Progress: {pct:.1f}% ({downloaded / 1024 / 1024:.1f} MB)", end="", flush=True)

    print(f"\n✓ Dataset saved to {save_path} ({os.path.getsize(save_path) / 1024 / 1024:.1f} MB)")
    return save_path
