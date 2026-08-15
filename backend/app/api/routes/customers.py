"""
Segmint — Customer Routes
Customer lookup, search, and listing endpoints.
"""

import os
import math
import pandas as pd
from fastapi import APIRouter, HTTPException, Query

from ..schemas import (
    CustomerDetail,
    CustomerListItem,
    CustomerListResponse,
)
from ...config import settings

router = APIRouter(prefix="/customers", tags=["customers"])

# In-memory cache for loaded data
_customers_cache = None


def _load_customers() -> pd.DataFrame:
    """Load labeled customer data, with caching."""
    global _customers_cache

    labeled_path = os.path.join(settings.processed_data_dir, "rfm_clusters_labeled.csv")

    if not os.path.exists(labeled_path):
        raise HTTPException(
            status_code=404,
            detail="Customer data not available. Run the pipeline first via POST /api/pipeline/run",
        )

    if _customers_cache is None or len(_customers_cache) == 0:
        _customers_cache = pd.read_csv(labeled_path)

    return _customers_cache


def invalidate_cache():
    """Clear the customer cache (called after pipeline runs)."""
    global _customers_cache
    _customers_cache = None


@router.get("", response_model=CustomerListResponse)
async def list_customers(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=200, description="Items per page"),
    search: str = Query(None, description="Search by CustomerID"),
    persona: str = Query(None, description="Filter by persona"),
    sort_by: str = Query("monetary", description="Sort field: recency, frequency, monetary"),
    sort_order: str = Query("desc", description="Sort order: asc, desc"),
):
    """List customers with pagination, search, and filtering."""
    df = _load_customers()

    # Search filter
    if search:
        df = df[df["CustomerID"].astype(str).str.contains(search, case=False)]

    # Persona filter
    if persona:
        df = df[df["persona"].str.lower() == persona.lower()]

    total = len(df)

    # Sort
    sort_col_map = {
        "recency": "Recency",
        "frequency": "Frequency",
        "monetary": "Monetary",
        "customer_id": "CustomerID",
    }
    sort_col = sort_col_map.get(sort_by, "Monetary")
    ascending = sort_order.lower() == "asc"
    df = df.sort_values(sort_col, ascending=ascending)

    # Paginate
    total_pages = max(1, math.ceil(total / page_size))
    start = (page - 1) * page_size
    end = start + page_size
    page_df = df.iloc[start:end]

    customers = [
        CustomerListItem(
            customer_id=int(row["CustomerID"]),
            recency=float(row["Recency"]),
            frequency=float(row["Frequency"]),
            monetary=float(row["Monetary"]),
            persona=str(row.get("persona", "Unknown")),
            persona_icon=str(row.get("persona_icon", "📊")),
            kmeans_cluster=int(row["kmeans_cluster"]),
        )
        for _, row in page_df.iterrows()
    ]

    return CustomerListResponse(
        customers=customers,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/{customer_id}", response_model=CustomerDetail)
async def get_customer(customer_id: int):
    """Get detailed info for a specific customer."""
    df = _load_customers()

    customer = df[df["CustomerID"] == customer_id]
    if customer.empty:
        raise HTTPException(
            status_code=404,
            detail=f"Customer {customer_id} not found.",
        )

    row = customer.iloc[0]
    return CustomerDetail(
        customer_id=int(row["CustomerID"]),
        recency=float(row["Recency"]),
        frequency=float(row["Frequency"]),
        monetary=float(row["Monetary"]),
        kmeans_cluster=int(row["kmeans_cluster"]),
        dbscan_cluster=int(row["dbscan_cluster"]),
        persona=str(row.get("persona", "Unknown")),
        persona_icon=str(row.get("persona_icon", "📊")),
        persona_color=str(row.get("persona_color", "#9ca3af")),
        action=str(row.get("action", "N/A")),
    )
