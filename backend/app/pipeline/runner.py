"""
Segmint — Pipeline Runner (Orchestrator)
Executes all 6 stages of the RFM segmentation pipeline in sequence.
"""

import os
import time
from datetime import datetime

from .download import download_dataset
from .clean import run_cleaning
from .rfm import run_rfm
from .preprocess import run_preprocessing
from .cluster import run_clustering
from .visualize import run_visualization
from .label import run_labeling

# Resolve paths relative to this file
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
RAW_DIR = os.path.join(BASE_DIR, "data", "raw")
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")
OUTPUTS_DIR = os.path.join(BASE_DIR, "outputs")

# Global pipeline state
pipeline_state = {
    "status": "idle",       # idle | running | completed | error
    "current_stage": None,
    "progress": 0,
    "start_time": None,
    "end_time": None,
    "duration": None,
    "error": None,
    "results": None,
}


def get_pipeline_status() -> dict:
    """Return current pipeline state."""
    return pipeline_state.copy()


def run_pipeline() -> dict:
    """
    Execute the full Segmint pipeline:
      Stage 0: Download dataset
      Stage 1: Clean data
      Stage 2: Compute RFM
      Stage 3: Preprocess (scale)
      Stage 4: Cluster (K-Means + DBSCAN)
      Stage 5: PCA visualization
      Stage 6: Business labeling

    Returns:
        dict with overall results and per-stage stats.
    """
    global pipeline_state

    pipeline_state.update({
        "status": "running",
        "current_stage": "initializing",
        "progress": 0,
        "start_time": datetime.now().isoformat(),
        "end_time": None,
        "duration": None,
        "error": None,
        "results": None,
    })

    overall_start = time.time()
    results = {"stages": {}}

    try:
        # ============================================================
        # Stage 0: Download dataset
        # ============================================================
        pipeline_state["current_stage"] = "downloading"
        pipeline_state["progress"] = 5
        print("\n" + "=" * 60)
        print("STAGE 0: Downloading Dataset")
        print("=" * 60)

        raw_file = download_dataset(os.path.join(RAW_DIR, "online_retail.xlsx"))
        results["stages"]["download"] = {"file_path": raw_file}

        # ============================================================
        # Stage 1: Clean data
        # ============================================================
        pipeline_state["current_stage"] = "cleaning"
        pipeline_state["progress"] = 15
        print("\n" + "=" * 60)
        print("STAGE 1: Data Cleaning")
        print("=" * 60)

        clean_result = run_cleaning(raw_file, PROCESSED_DIR)
        results["stages"]["cleaning"] = clean_result["stats"]

        # ============================================================
        # Stage 2: RFM Calculation
        # ============================================================
        pipeline_state["current_stage"] = "rfm_calculation"
        pipeline_state["progress"] = 30
        print("\n" + "=" * 60)
        print("STAGE 2: RFM Calculation")
        print("=" * 60)

        rfm_result = run_rfm(clean_result["output_path"], PROCESSED_DIR)
        results["stages"]["rfm"] = rfm_result["stats"]

        # ============================================================
        # Stage 3: Preprocessing
        # ============================================================
        pipeline_state["current_stage"] = "preprocessing"
        pipeline_state["progress"] = 45
        print("\n" + "=" * 60)
        print("STAGE 3: Preprocessing")
        print("=" * 60)

        preprocess_result = run_preprocessing(rfm_result["output_path"], PROCESSED_DIR)
        results["stages"]["preprocessing"] = preprocess_result["stats"]

        # ============================================================
        # Stage 4: Clustering
        # ============================================================
        pipeline_state["current_stage"] = "clustering"
        pipeline_state["progress"] = 60
        print("\n" + "=" * 60)
        print("STAGE 4: Clustering (K-Means + DBSCAN)")
        print("=" * 60)

        cluster_result = run_clustering(
            preprocess_result["output_path"], PROCESSED_DIR, OUTPUTS_DIR
        )
        results["stages"]["clustering"] = {
            "kmeans": {
                "k": cluster_result["kmeans_result"]["k"],
                "silhouette": cluster_result["kmeans_result"]["silhouette"],
                "inertia": cluster_result["kmeans_result"]["inertia"],
            },
            "dbscan": {
                "n_clusters": cluster_result["dbscan_result"]["n_clusters"],
                "n_noise": cluster_result["dbscan_result"]["n_noise"],
                "noise_pct": cluster_result["dbscan_result"]["noise_pct"],
                "eps": cluster_result["dbscan_result"]["eps"],
            },
        }

        # ============================================================
        # Stage 5: PCA Visualization
        # ============================================================
        pipeline_state["current_stage"] = "visualization"
        pipeline_state["progress"] = 80
        print("\n" + "=" * 60)
        print("STAGE 5: PCA Visualization")
        print("=" * 60)

        viz_result = run_visualization(
            cluster_result["output_path"], PROCESSED_DIR, OUTPUTS_DIR
        )
        results["stages"]["visualization"] = {
            "explained_variance": viz_result["explained_variance"],
            "total_explained_variance": viz_result["total_explained_variance"],
        }

        # ============================================================
        # Stage 6: Business Labeling
        # ============================================================
        pipeline_state["current_stage"] = "labeling"
        pipeline_state["progress"] = 90
        print("\n" + "=" * 60)
        print("STAGE 6: Business Labeling")
        print("=" * 60)

        label_result = run_labeling(
            rfm_result["output_path"],
            cluster_result["output_path"],
            PROCESSED_DIR,
        )
        results["stages"]["labeling"] = {
            "persona_map": label_result["persona_map"],
            "cluster_count": len(label_result["persona_map"]),
        }

        # ============================================================
        # Complete
        # ============================================================
        duration = round(time.time() - overall_start, 2)

        results["summary"] = {
            "total_customers": int(rfm_result["stats"]["total_customers"]),
            "clusters_found": int(cluster_result["kmeans_result"]["k"]),
            "pipeline_duration_seconds": duration,
            "data_date_range": f"{clean_result['stats']['date_range_start']} → {clean_result['stats']['date_range_end']}",
        }

        pipeline_state.update({
            "status": "completed",
            "current_stage": "done",
            "progress": 100,
            "end_time": datetime.now().isoformat(),
            "duration": duration,
            "results": results,
        })

        print("\n" + "=" * 60)
        print(f"✅ PIPELINE COMPLETE in {duration:.1f}s")
        print(f"   Customers: {results['summary']['total_customers']:,}")
        print(f"   Clusters: {results['summary']['clusters_found']}")
        print("=" * 60)

        return results

    except Exception as e:
        pipeline_state.update({
            "status": "error",
            "error": str(e),
            "end_time": datetime.now().isoformat(),
            "duration": round(time.time() - overall_start, 2),
        })
        print(f"\n❌ Pipeline error at stage '{pipeline_state['current_stage']}': {e}")
        raise
