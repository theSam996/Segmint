"""
Segmint — Health Check Route
"""

from fastapi import APIRouter
import os

from ..schemas import HealthResponse
from ...config import settings
from ...pipeline.runner import get_pipeline_status

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Check API health and data availability."""
    pipeline_status = get_pipeline_status()

    # Check if processed data exists
    labeled_path = os.path.join(settings.processed_data_dir, "rfm_clusters_labeled.csv")
    data_available = os.path.exists(labeled_path)

    return HealthResponse(
        status="healthy",
        app=settings.app_name,
        version=settings.app_version,
        pipeline_status=pipeline_status["status"],
        data_available=data_available,
    )
