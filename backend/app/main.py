"""
Segmint — FastAPI Application Entry Point
Intelligent Customer Segmentation & RFM Analytics API
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .api.routes import health, pipeline, customers, clusters


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup and shutdown events."""
    print(f"🚀 {settings.app_name} v{settings.app_version} starting up...")
    print(f"   Raw data dir: {settings.raw_data_dir}")
    print(f"   Processed dir: {settings.processed_data_dir}")
    print(f"   Outputs dir: {settings.outputs_dir}")
    yield
    print(f"👋 {settings.app_name} shutting down...")


app = FastAPI(
    title=settings.app_name,
    description="Intelligent Customer Segmentation & RFM Analytics API",
    version=settings.app_version,
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers under /api prefix
app.include_router(health.router, prefix="/api")
app.include_router(pipeline.router, prefix="/api")
app.include_router(customers.router, prefix="/api")
app.include_router(clusters.router, prefix="/api")


@app.get("/")
async def root():
    return {
        "app": settings.app_name,
        "version": settings.app_version,
        "docs": "/docs",
        "api": "/api/health",
    }
