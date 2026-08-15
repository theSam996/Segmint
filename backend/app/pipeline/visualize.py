"""
Segmint — Stage 5: PCA Visualization
Projects the scaled 3D RFM feature space into 2D for human-readable scatterplots.

IMPORTANT: PCA is applied AFTER clustering, on the same scaled features used for
clustering. It's strictly for visualization — cluster labels are colors on the plot,
not inputs to PCA.
"""

import os
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.decomposition import PCA


def compute_pca(X: np.ndarray, n_components: int = 2) -> dict:
    """
    Fit PCA and project features to n_components dimensions.

    Returns:
        dict with 'coords' (n×2 array), 'explained_variance', 'pca' (fitted model).
    """
    pca = PCA(n_components=n_components, random_state=42)
    coords = pca.fit_transform(X)

    ev = pca.explained_variance_ratio_
    total_ev = float(ev.sum())

    print(f"  ✓ PCA projection to {n_components}D")
    print(f"    PC1: {ev[0]:.1%} variance")
    print(f"    PC2: {ev[1]:.1%} variance")
    print(f"    Total explained: {total_ev:.1%}")

    if total_ev < 0.70:
        print(f"  ⚠ Warning: <70% variance explained — 2D plot may not fully represent cluster separation")

    return {
        "coords": coords,
        "explained_variance": [float(v) for v in ev],
        "total_explained_variance": total_ev,
        "pca": pca,
    }


def plot_pca_scatter(coords: np.ndarray, labels: np.ndarray,
                     title: str, output_path: str,
                     explained_variance: list = None,
                     persona_map: dict = None):
    """
    Create a publication-quality PCA scatter plot.
    """
    palette = ["#7c3aed", "#3b82f6", "#10b981", "#f59e0b",
               "#ef4444", "#ec4899", "#06b6d4", "#8b5cf6",
               "#f97316", "#14b8a6"]

    fig, ax = plt.subplots(figsize=(12, 8))

    unique_labels = sorted(set(labels))
    for i, label in enumerate(unique_labels):
        mask = labels == label
        color = "#6b7280" if label == -1 else palette[i % len(palette)]
        label_name = "Noise" if label == -1 else f"Cluster {label}"
        if persona_map and label in persona_map:
            label_name = persona_map[label]

        ax.scatter(
            coords[mask, 0], coords[mask, 1],
            c=color, alpha=0.6, s=20, label=label_name,
            edgecolors="white", linewidth=0.3,
        )

    ev_text = ""
    if explained_variance:
        ev_text = f" (PC1: {explained_variance[0]:.1%}, PC2: {explained_variance[1]:.1%})"

    ax.set_xlabel(f"Principal Component 1", fontsize=12)
    ax.set_ylabel(f"Principal Component 2", fontsize=12)
    ax.set_title(f"{title}{ev_text}", fontsize=14, fontweight="bold")
    ax.legend(loc="best", fontsize=9, framealpha=0.9)
    ax.grid(True, alpha=0.2)

    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"  📊 Saved PCA scatter: {output_path}")


def run_visualization(clustered_csv_path: str, output_dir: str,
                      plots_dir: str) -> dict:
    """
    Full Stage 5 pipeline: load clustered data → PCA → plot → save coords.

    Returns:
        dict with 'data' (PCA coords DataFrame), 'stats', 'output_path'.
    """
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(plots_dir, exist_ok=True)

    print(f"📉 Running PCA visualization...")

    clustered = pd.read_csv(clustered_csv_path)
    customer_ids = clustered["CustomerID"].values
    feature_cols = [c for c in clustered.columns
                    if c.endswith("_scaled")]
    X = clustered[feature_cols].values

    # --- Compute PCA ---
    pca_result = compute_pca(X)
    coords = pca_result["coords"]

    # --- Save PCA coordinates ---
    pca_df = pd.DataFrame({
        "CustomerID": customer_ids,
        "PC1": coords[:, 0],
        "PC2": coords[:, 1],
        "kmeans_cluster": clustered["kmeans_cluster"].values,
        "dbscan_cluster": clustered["dbscan_cluster"].values,
    })

    output_path = os.path.join(output_dir, "pca_coords.csv")
    pca_df.to_csv(output_path, index=False)
    print(f"  💾 Saved PCA coordinates to {output_path}")

    # --- Plot K-Means clusters ---
    plot_pca_scatter(
        coords, clustered["kmeans_cluster"].values,
        "K-Means Customer Segments",
        os.path.join(plots_dir, "pca_scatter_kmeans.png"),
        pca_result["explained_variance"],
    )

    # --- Plot DBSCAN clusters ---
    plot_pca_scatter(
        coords, clustered["dbscan_cluster"].values,
        "DBSCAN Customer Segments",
        os.path.join(plots_dir, "pca_scatter_dbscan.png"),
        pca_result["explained_variance"],
    )

    return {
        "data": pca_df,
        "explained_variance": pca_result["explained_variance"],
        "total_explained_variance": pca_result["total_explained_variance"],
        "output_path": output_path,
    }
