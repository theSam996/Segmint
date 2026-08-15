"""
Segmint — Cluster Routes
Cluster summaries, PCA coordinates, and distribution data.
"""

import os
import pandas as pd
from fastapi import APIRouter, HTTPException, Query

from ..schemas import (
    ClusterSummaryItem,
    ClusterSummaryResponse,
    PCAPoint,
    PCAResponse,
    DistributionData,
    DistributionResponse,
)
from ...config import settings

router = APIRouter(prefix="/clusters", tags=["clusters"])

# In-memory caches
_summary_cache = None
_pca_cache = None
_labeled_cache = None


def _load_summary() -> pd.DataFrame:
    global _summary_cache
    path = os.path.join(settings.processed_data_dir, "cluster_summary.csv")
    if not os.path.exists(path):
        raise HTTPException(404, "Cluster summary not available. Run the pipeline first.")
    if _summary_cache is None:
        _summary_cache = pd.read_csv(path)
    return _summary_cache


def _load_pca() -> pd.DataFrame:
    global _pca_cache
    path = os.path.join(settings.processed_data_dir, "pca_coords.csv")
    if not os.path.exists(path):
        raise HTTPException(404, "PCA data not available. Run the pipeline first.")
    if _pca_cache is None:
        _pca_cache = pd.read_csv(path)
    return _pca_cache


def _load_labeled() -> pd.DataFrame:
    global _labeled_cache
    path = os.path.join(settings.processed_data_dir, "rfm_clusters_labeled.csv")
    if not os.path.exists(path):
        raise HTTPException(404, "Labeled data not available. Run the pipeline first.")
    if _labeled_cache is None:
        _labeled_cache = pd.read_csv(path)
    return _labeled_cache


def invalidate_cache():
    global _summary_cache, _pca_cache, _labeled_cache
    _summary_cache = None
    _pca_cache = None
    _labeled_cache = None


@router.get("/summary", response_model=ClusterSummaryResponse)
async def get_cluster_summary():
    """Get cluster summary with personas and business actions."""
    df = _load_summary()
    labeled = _load_labeled()

    clusters = []
    for _, row in df.iterrows():
        clusters.append(ClusterSummaryItem(
            cluster_id=int(row["kmeans_cluster"]),
            persona=str(row["persona"]),
            icon=str(row["icon"]),
            description=str(row["description"]),
            action=str(row["action"]),
            color=str(row["color"]),
            avg_recency=float(row["avg_recency"]),
            avg_frequency=float(row["avg_frequency"]),
            avg_monetary=float(row["avg_monetary"]),
            customer_count=int(row["customer_count"]),
            pct_of_base=float(row["pct_of_base"]),
            r_level=str(row["r_level"]),
            f_level=str(row["f_level"]),
            m_level=str(row["m_level"]),
        ))

    return ClusterSummaryResponse(
        clusters=clusters,
        total_customers=int(labeled["CustomerID"].nunique()),
        algorithm="K-Means",
    )


@router.get("/pca", response_model=PCAResponse)
async def get_pca_data():
    """Get PCA 2D projection data for scatter plot visualization."""
    pca_df = _load_pca()
    labeled = _load_labeled()

    # Merge persona info
    persona_info = labeled[["CustomerID", "persona", "persona_color"]].drop_duplicates()
    merged = pca_df.merge(persona_info, on="CustomerID", how="left")

    points = []
    for _, row in merged.iterrows():
        points.append(PCAPoint(
            customer_id=int(row["CustomerID"]),
            pc1=round(float(row["PC1"]), 4),
            pc2=round(float(row["PC2"]), 4),
            kmeans_cluster=int(row["kmeans_cluster"]),
            dbscan_cluster=int(row["dbscan_cluster"]),
            persona=str(row.get("persona", "")),
            persona_color=str(row.get("persona_color", "#9ca3af")),
        ))

    # Read explained variance from pipeline results or compute
    # For now, estimate from the data (will be overwritten by pipeline results)
    explained_variance = [0.0, 0.0]
    total_ev = 0.0

    return PCAResponse(
        points=points,
        explained_variance=explained_variance,
        total_explained_variance=total_ev,
    )


@router.get("/distribution", response_model=DistributionResponse)
async def get_distribution(
    metric: str = Query("monetary", description="RFM metric: recency, frequency, monetary"),
):
    """Get distribution data for a specific RFM metric per cluster."""
    labeled = _load_labeled()

    col_map = {
        "recency": "Recency",
        "frequency": "Frequency",
        "monetary": "Monetary",
    }
    col = col_map.get(metric.lower())
    if not col:
        raise HTTPException(400, f"Invalid metric '{metric}'. Use: recency, frequency, monetary")

    distributions = []
    for cluster_id in sorted(labeled["kmeans_cluster"].unique()):
        cluster_data = labeled[labeled["kmeans_cluster"] == cluster_id]
        persona = cluster_data["persona"].iloc[0] if "persona" in cluster_data.columns else f"Cluster {cluster_id}"

        distributions.append(DistributionData(
            cluster_id=int(cluster_id),
            persona=str(persona),
            values=cluster_data[col].tolist(),
        ))

    return DistributionResponse(
        metric=metric.lower(),
        distributions=distributions,
    )
