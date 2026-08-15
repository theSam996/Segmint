"""
Segmint — Pipeline Routes
Trigger and monitor the data pipeline.
"""

import threading
from fastapi import APIRouter, HTTPException

from ..schemas import PipelineStatusResponse, PipelineRunResponse
from ...pipeline.runner import run_pipeline, get_pipeline_status

router = APIRouter(prefix="/pipeline", tags=["pipeline"])


@router.get("/status", response_model=PipelineStatusResponse)
async def pipeline_status():
    """Get current pipeline status."""
    state = get_pipeline_status()
    return PipelineStatusResponse(**state)


@router.post("/run", response_model=PipelineRunResponse)
async def trigger_pipeline():
    """
    Trigger the full Segmint pipeline.
    Runs in a background thread to avoid blocking the API.
    """
    state = get_pipeline_status()

    if state["status"] == "running":
        raise HTTPException(
            status_code=409,
            detail="Pipeline is already running. Check /api/pipeline/status for progress.",
        )

    # Run pipeline in background thread
    thread = threading.Thread(target=run_pipeline, daemon=True)
    thread.start()

    return PipelineRunResponse(
        message="Pipeline started. Poll /api/pipeline/status for progress.",
        status="running",
    )
