"""
Segmint — API Pydantic Schemas
Response and Request models for all API endpoints.
"""

from pydantic import BaseModel
from typing import Optional, Dict, List, Any


class HealthResponse(BaseModel):
    status: str
    app: str
    version: str
    pipeline_status: str
    data_available: bool


class ColumnMappingModel(BaseModel):
    customer_id: Optional[str] = None
    invoice_id: Optional[str] = None
    date: Optional[str] = None
    quantity: Optional[str] = None
    unit_price: Optional[str] = None
    total_price: Optional[str] = None


class ValidationRequest(BaseModel):
    file_token: str
    column_mapping: Optional[ColumnMappingModel] = None


class ValidationResponse(BaseModel):
    is_valid: bool
    file_token: str
    filename: str
    row_count_estimate: int
    columns: List[str]
    suggested_mapping: Dict[str, Optional[str]]
    preview_rows: List[Dict[str, Any]]
    null_counts: Dict[str, int]
    errors: List[str]
    warnings: List[str]


class PipelineRunRequest(BaseModel):
    source: str = "demo"  # "demo" | "custom"
    file_token: Optional[str] = None
    column_mapping: Optional[Dict[str, Optional[str]]] = None


class CustomerDetail(BaseModel):
    customer_id: int | str
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
    customer_id: int | str
    recency: float
    frequency: float
    monetary: float
    persona: str
    persona_icon: str
    kmeans_cluster: int


class CustomerListResponse(BaseModel):
    customers: List[CustomerListItem]
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
    clusters: List[ClusterSummaryItem]
    total_customers: int
    algorithm: str


class PCAPoint(BaseModel):
    customer_id: int | str
    pc1: float
    pc2: float
    kmeans_cluster: int
    dbscan_cluster: int
    persona: Optional[str] = None
    persona_color: Optional[str] = None


class PCAResponse(BaseModel):
    points: List[PCAPoint]
    explained_variance: List[float]
    total_explained_variance: float


class DistributionData(BaseModel):
    cluster_id: int
    persona: str
    values: List[float]


class DistributionResponse(BaseModel):
    metric: str
    distributions: List[DistributionData]


class AlgorithmMetrics(BaseModel):
    name: str
    cluster_count: int
    silhouette_score: Optional[float] = None
    inertia: Optional[float] = None
    noise_count: Optional[int] = None
    noise_percentage: Optional[float] = None
    parameters: Dict[str, Any]
    strengths: List[str]
    weaknesses: List[str]


class NoiseAnalysis(BaseModel):
    total_noise_customers: int
    noise_pct: float
    avg_recency: float
    avg_frequency: float
    avg_monetary: float
    key_findings: List[str]


class ContingencyCell(BaseModel):
    kmeans_cluster: int
    dbscan_cluster: int
    count: int
    persona: str


class ModelComparisonResponse(BaseModel):
    kmeans: AlgorithmMetrics
    dbscan: AlgorithmMetrics
    contingency_matrix: List[ContingencyCell]
    noise_analysis: NoiseAnalysis
    recommendation: str


class RevenueShareItem(BaseModel):
    cluster_id: int
    persona: str
    icon: str
    color: str
    customer_count: int
    pct_customers: float
    total_revenue: float
    pct_revenue: float
    avg_spend_per_customer: float


class AnalyticsResponse(BaseModel):
    revenue_distribution: List[RevenueShareItem]
    total_revenue: float
    total_customers: int
    correlation_frequency_monetary: float
    correlation_recency_monetary: float
    average_order_value: float


class PipelineStatusResponse(BaseModel):
    status: str
    current_stage: Optional[str] = None
    progress: int
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    duration: Optional[float] = None
    error: Optional[str] = None
    results: Optional[dict] = None
    source: Optional[str] = "demo"


class PipelineRunResponse(BaseModel):
    message: str
    status: str
