"""
Segmint — Pipeline Routes
Upload datasets, validate schemas, trigger and monitor data pipelines.
"""

import os
import uuid
import shutil
import threading
import pandas as pd
from typing import Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Response
from fastapi.responses import PlainTextResponse

from ..schemas import (
    PipelineStatusResponse,
    PipelineRunResponse,
    PipelineRunRequest,
    ValidationResponse,
    ValidationRequest,
)
from ...config import settings
from ...pipeline.clean import load_raw_data, detect_column_mapping
from ...pipeline.runner import run_pipeline, get_pipeline_status

router = APIRouter(prefix="/pipeline", tags=["pipeline"])

UPLOAD_DIR = os.path.join(settings.base_dir, "data", "raw", "custom_uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("/status", response_model=PipelineStatusResponse)
async def pipeline_status():
    """Get current pipeline status."""
    state = get_pipeline_status()
    return PipelineStatusResponse(**state)


@router.post("/upload", response_model=ValidationResponse)
async def upload_dataset(file: UploadFile = File(...)):
    """
    Upload a CSV or Excel dataset for validation and segmentation.
    Returns preview data, detected column mappings, and a file_token.
    """
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".csv", ".xlsx", ".xls", ".txt"]:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Please upload a CSV (.csv) or Excel (.xlsx/.xls) file.",
        )

    file_token = str(uuid.uuid4())
    saved_filename = f"{file_token}_{file.filename}"
    saved_path = os.path.join(UPLOAD_DIR, saved_filename)

    try:
        with open(saved_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    # Inspect the file
    try:
        df = load_raw_data(saved_path)
    except Exception as e:
        if os.path.exists(saved_path):
            os.remove(saved_path)
        raise HTTPException(status_code=400, detail=f"Could not read dataset: {str(e)}")

    columns = [str(c).strip() for c in df.columns]
    suggested_mapping = detect_column_mapping(df)

    # Validate mapping
    errors = []
    warnings = []

    if not suggested_mapping.get("customer_id"):
        errors.append("Could not automatically detect a Customer ID column. Please select one manually.")
    if not suggested_mapping.get("date"):
        errors.append("Could not automatically detect an Invoice/Order Date column. Please select one manually.")
    if not suggested_mapping.get("total_price") and not (suggested_mapping.get("quantity") and suggested_mapping.get("unit_price")):
        warnings.append("No explicit Total Price or Quantity+Unit Price detected. We will assume standard unit amounts.")

    null_counts = {str(c): int(df[c].isnull().sum()) for c in df.columns}
    preview_df = df.head(8).fillna("").astype(str)
    preview_rows = preview_df.to_dict(orient="records")

    is_valid = len(errors) == 0

    return ValidationResponse(
        is_valid=is_valid,
        file_token=saved_filename,
        filename=file.filename,
        row_count_estimate=len(df),
        columns=columns,
        suggested_mapping=suggested_mapping,
        preview_rows=preview_rows,
        null_counts=null_counts,
        errors=errors,
        warnings=warnings,
    )


@router.post("/validate", response_model=ValidationResponse)
async def validate_mapping(payload: ValidationRequest):
    """
    Re-validate an uploaded dataset with user-customized column mapping.
    """
    saved_path = os.path.join(UPLOAD_DIR, payload.file_token)
    if not os.path.exists(saved_path):
        raise HTTPException(status_code=404, detail="Uploaded file session expired or not found. Please re-upload.")

    try:
        df = load_raw_data(saved_path)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")

    columns = [str(c).strip() for c in df.columns]
    mapping = payload.column_mapping.model_dump() if payload.column_mapping else detect_column_mapping(df)

    errors = []
    warnings = []

    cust_col = mapping.get("customer_id")
    date_col = mapping.get("date")

    if not cust_col or cust_col not in df.columns:
        errors.append(f"Customer ID column '{cust_col}' is invalid or missing.")
    if not date_col or date_col not in df.columns:
        errors.append(f"Date column '{date_col}' is invalid or missing.")

    # Check date parseability
    if date_col and date_col in df.columns:
        sample_dates = pd.to_datetime(df[date_col].head(20), errors="coerce")
        if sample_dates.isnull().all():
            errors.append(f"Date column '{date_col}' contains invalid or unparseable date values.")

    null_counts = {str(c): int(df[c].isnull().sum()) for c in df.columns}
    preview_df = df.head(8).fillna("").astype(str)
    preview_rows = preview_df.to_dict(orient="records")

    is_valid = len(errors) == 0

    return ValidationResponse(
        is_valid=is_valid,
        file_token=payload.file_token,
        filename=payload.file_token.split("_", 1)[-1] if "_" in payload.file_token else payload.file_token,
        row_count_estimate=len(df),
        columns=columns,
        suggested_mapping=mapping,
        preview_rows=preview_rows,
        null_counts=null_counts,
        errors=errors,
        warnings=warnings,
    )


@router.post("/run", response_model=PipelineRunResponse)
async def trigger_pipeline(request: Optional[PipelineRunRequest] = None):
    """
    Trigger the Segmint pipeline for either Demo data or a validated Custom dataset.
    Runs asynchronously in a background worker thread.
    """
    state = get_pipeline_status()

    if state["status"] == "running":
        raise HTTPException(
            status_code=409,
            detail="Pipeline is already running. Check /api/pipeline/status for progress.",
        )

    custom_file_path = None
    column_mapping = None

    if request and request.source == "custom":
        if not request.file_token:
            raise HTTPException(status_code=400, detail="Missing file_token for custom dataset execution.")
        saved_path = os.path.join(UPLOAD_DIR, request.file_token)
        if not os.path.exists(saved_path):
            raise HTTPException(status_code=404, detail="Uploaded dataset file not found on server.")
        custom_file_path = saved_path
        column_mapping = request.column_mapping

    # Run in background thread
    thread = threading.Thread(
        target=run_pipeline,
        kwargs={"custom_file_path": custom_file_path, "column_mapping": column_mapping},
        daemon=True,
    )
    thread.start()

    return PipelineRunResponse(
        message=f"Pipeline started ({'Custom Dataset' if custom_file_path else 'Demo Dataset'}). Poll /api/pipeline/status for progress.",
        status="running",
    )


@router.get("/sample-template")
async def download_sample_template():
    """Download a ready-to-use sample CSV template."""
    sample_csv = """InvoiceNo,StockCode,Description,Quantity,InvoiceDate,UnitPrice,CustomerID,Country
536365,85123A,WHITE HANGING HEART T-LIGHT HOLDER,6,2024-01-05 08:26:00,2.55,17850,United Kingdom
536365,71053,WHITE METAL LANTERN,6,2024-01-05 08:26:00,3.39,17850,United Kingdom
536366,22633,HAND WARMER UNION JACK,8,2024-01-08 11:15:00,1.85,13047,United Kingdom
536367,84879,ASSORTED COLOUR BIRD ORNAMENT,32,2024-01-12 14:02:00,1.69,12583,France
536368,22960,JAM MAKING SET WITH JARS,12,2024-01-15 16:45:00,4.25,12583,France
536369,21730,GLASS STAR FROSTED T-LIGHT HOLDER,6,2024-01-20 09:30:00,4.95,14527,United Kingdom
"""
    return PlainTextResponse(
        content=sample_csv,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=segmint_sample_template.csv"},
    )
