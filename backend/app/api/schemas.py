"""
Segmint — API Pydantic Schemas
Response models for all API endpoints.
"""

from pydantic import BaseModel
from typing import Optional


class HealthResponse(BaseModel):
    status: str
    app: str
    version: str
    pipeline_status: str
    data_available: bool


class CustomerDetail(BaseModel):
    customer_id: int
    recency: float
    frequency: float
    monetary: float
    kmeans_cluster: int
    dbscan_cluster: int
    persona: str
    persona_icon: str
    persona_color: str
    action: str


class CustomerListItem(BaseModel):
    customer_id: int
    recency: float
    frequency: float
    monetary: float
    persona: str
    persona_icon: str
    kmeans_cluster: int


class CustomerListResponse(BaseModel):
    customers: list[CustomerListItem]
    total: int
    page: int
    page_size: int
    total_pages: int


class ClusterSummaryItem(BaseModel):
    cluster_id: int
    persona: str
    icon: str
    description: str
    action: str
    color: str
    avg_recency: float
    avg_frequency: float
    avg_monetary: float
    customer_count: int
    pct_of_base: float
    r_level: str
    f_level: str
    m_level: str


class ClusterSummaryResponse(BaseModel):
    clusters: list[ClusterSummaryItem]
    total_customers: int
    algorithm: str


class PCAPoint(BaseModel):
    customer_id: int
    pc1: float
    pc2: float
    kmeans_cluster: int
    dbscan_cluster: int
    persona: Optional[str] = None
    persona_color: Optional[str] = None


class PCAResponse(BaseModel):
    points: list[PCAPoint]
    explained_variance: list[float]
    total_explained_variance: float


class DistributionData(BaseModel):
    cluster_id: int
    persona: str
    values: list[float]


class DistributionResponse(BaseModel):
    metric: str
    distributions: list[DistributionData]


class PipelineStatusResponse(BaseModel):
    status: str
    current_stage: Optional[str] = None
    progress: int
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    duration: Optional[float] = None
    error: Optional[str] = None
    results: Optional[dict] = None


class PipelineRunResponse(BaseModel):
    message: str
    status: str
