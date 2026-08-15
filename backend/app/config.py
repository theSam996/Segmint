"""
Segmint — Configuration
Centralized settings via Pydantic BaseSettings.
"""

import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # App
    app_name: str = "Segmint"
    app_version: str = "1.0.0"
    debug: bool = True

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # CORS
    cors_origins: list[str] = [
        "http://localhost:5173",    # Vite dev server
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ]

    # Data paths (relative to backend/)
    base_dir: str = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    raw_data_dir: str = ""
    processed_data_dir: str = ""
    outputs_dir: str = ""

    def model_post_init(self, __context) -> None:
        """Set derived paths after initialization."""
        if not self.raw_data_dir:
            self.raw_data_dir = os.path.join(self.base_dir, "data", "raw")
        if not self.processed_data_dir:
            self.processed_data_dir = os.path.join(self.base_dir, "data", "processed")
        if not self.outputs_dir:
            self.outputs_dir = os.path.join(self.base_dir, "outputs")

    class Config:
        env_prefix = "SEGMINT_"


settings = Settings()
