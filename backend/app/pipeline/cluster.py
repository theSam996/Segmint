"""
Segmint — Stage 4: Clustering
Applies K-Means and DBSCAN to the scaled RFM feature matrix.

K-Means: elbow method + silhouette scores to find optimal k, then fit.
DBSCAN: k-distance plot to find eps, then fit with chosen parameters.
"""

import os
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend for server
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.cluster import KMeans, DBSCAN
from sklearn.metrics import silhouette_score
from sklearn.neighbors import NearestNeighbors


def find_optimal_k(X: np.ndarray, k_range: range = range(2, 11),
                   output_dir: str = None) -> dict:
    """
    Run elbow method and silhouette analysis to find optimal k for K-Means.

    Returns:
        dict with 'optimal_k', 'inertias', 'silhouette_scores'.
    """
    inertias = []
    sil_scores = []

    for k in k_range:
        km = KMeans(n_clusters=k, random_state=42, n_init=10)
        labels = km.fit_predict(X)
        inertias.append(float(km.inertia_))
        sil = silhouette_score(X, labels)
        sil_scores.append(float(sil))
        print(f"    k={k}: inertia={km.inertia_:.1f}, silhouette={sil:.4f}")

    # Best k = highest silhouette score
    optimal_k = list(k_range)[np.argmax(sil_scores)]
    print(f"  ✓ Optimal k={optimal_k} (silhouette={max(sil_scores):.4f})")

    # --- Plot elbow ---
    if output_dir:
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

        # Elbow plot
        ax1.plot(list(k_range), inertias, "o-", color="#7c3aed", linewidth=2, markersize=8)
        ax1.axvline(x=optimal_k, color="#ef4444", linestyle="--", alpha=0.7, label=f"Optimal k={optimal_k}")
        ax1.set_xlabel("Number of Clusters (k)", fontsize=12)
        ax1.set_ylabel("Inertia (WCSS)", fontsize=12)
        ax1.set_title("Elbow Method", fontsize=14, fontweight="bold")
        ax1.legend()
        ax1.grid(True, alpha=0.3)

        # Silhouette plot
        ax2.plot(list(k_range), sil_scores, "o-", color="#3b82f6", linewidth=2, markersize=8)
        ax2.axvline(x=optimal_k, color="#ef4444", linestyle="--", alpha=0.7, label=f"Optimal k={optimal_k}")
        ax2.set_xlabel("Number of Clusters (k)", fontsize=12)
        ax2.set_ylabel("Silhouette Score", fontsize=12)
        ax2.set_title("Silhouette Analysis", fontsize=14, fontweight="bold")
        ax2.legend()
        ax2.grid(True, alpha=0.3)

        plt.tight_layout()
        plt.savefig(os.path.join(output_dir, "elbow_silhouette.png"), dpi=150, bbox_inches="tight")
        plt.close()
        print(f"  📊 Saved elbow/silhouette plots")

    return {
        "optimal_k": optimal_k,
        "inertias": inertias,
        "silhouette_scores": sil_scores,
    }


def run_kmeans(X: np.ndarray, k: int) -> dict:
    """
    Fit K-Means with the chosen k.

    Returns:
        dict with 'labels', 'centroids', 'inertia', 'silhouette'.
    """
    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = km.fit_predict(X)

    sil = silhouette_score(X, labels)
    print(f"  ✓ K-Means fitted: k={k}, silhouette={sil:.4f}")

    return {
        "labels": labels,
        "centroids": km.cluster_centers_,
        "inertia": float(km.inertia_),
        "silhouette": float(sil),
        "k": k,
    }


def find_eps_dbscan(X: np.ndarray, min_samples: int = 5,
                    output_dir: str = None) -> float:
    """
    Use k-distance plot to find optimal eps for DBSCAN.

    Returns:
        Suggested eps value.
    """
    nn = NearestNeighbors(n_neighbors=min_samples)
    nn.fit(X)
    distances, _ = nn.kneighbors(X)

    # k-th nearest neighbor distances, sorted
    k_distances = np.sort(distances[:, -1])

    # Find the "knee" — steepest increase in gradient
    gradient = np.gradient(k_distances)
    knee_idx = np.argmax(gradient > np.percentile(gradient, 95))
    eps = float(k_distances[knee_idx])

    # Fallback: if eps is too small, use the 90th percentile
    if eps < 0.1:
        eps = float(np.percentile(k_distances, 90))

    print(f"  📐 Suggested eps={eps:.4f} (from k-distance elbow)")

    # --- Plot k-distance ---
    if output_dir:
        fig, ax = plt.subplots(figsize=(10, 5))
        ax.plot(range(len(k_distances)), k_distances, color="#7c3aed", linewidth=1.5)
        ax.axhline(y=eps, color="#ef4444", linestyle="--", alpha=0.7,
                   label=f"eps={eps:.3f}")
        ax.set_xlabel("Points (sorted)", fontsize=12)
        ax.set_ylabel(f"{min_samples}-NN Distance", fontsize=12)
        ax.set_title("K-Distance Plot (DBSCAN)", fontsize=14, fontweight="bold")
        ax.legend()
        ax.grid(True, alpha=0.3)
        plt.tight_layout()
        plt.savefig(os.path.join(output_dir, "k_distance_plot.png"), dpi=150, bbox_inches="tight")
        plt.close()
        print(f"  📊 Saved k-distance plot")

    return eps


def run_dbscan(X: np.ndarray, eps: float, min_samples: int = 5) -> dict:
    """
    Fit DBSCAN with the chosen eps and min_samples.

    Returns:
        dict with 'labels', 'n_clusters', 'n_noise', 'noise_pct'.
    """
    db = DBSCAN(eps=eps, min_samples=min_samples)
    labels = db.fit_predict(X)

    n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
    n_noise = int((labels == -1).sum())
    noise_pct = round(n_noise / len(labels) * 100, 1)

    print(f"  ✓ DBSCAN fitted: {n_clusters} clusters, {n_noise} noise points ({noise_pct}%)")

    return {
        "labels": labels,
        "n_clusters": n_clusters,
        "n_noise": n_noise,
        "noise_pct": noise_pct,
        "eps": eps,
        "min_samples": min_samples,
    }


def run_clustering(scaled_csv_path: str, output_dir: str,
                   plots_dir: str) -> dict:
    """
    Full Stage 4 pipeline: load scaled RFM → run K-Means + DBSCAN → save.

    Returns:
        dict with 'data', 'kmeans_result', 'dbscan_result', 'output_path'.
    """
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(plots_dir, exist_ok=True)

    print(f"🔬 Running clustering algorithms...")

    scaled_df = pd.read_csv(scaled_csv_path)
    customer_ids = scaled_df["CustomerID"].values
    feature_cols = [c for c in scaled_df.columns if c != "CustomerID"]
    X = scaled_df[feature_cols].values

    # --- K-Means ---
    print(f"\n  📍 K-Means Analysis:")
    k_analysis = find_optimal_k(X, output_dir=plots_dir)
    kmeans_result = run_kmeans(X, k_analysis["optimal_k"])

    # --- DBSCAN ---
    print(f"\n  📍 DBSCAN Analysis:")
    eps = find_eps_dbscan(X, min_samples=5, output_dir=plots_dir)
    dbscan_result = run_dbscan(X, eps=eps, min_samples=5)

    # --- Build output DataFrame ---
    clustered = scaled_df.copy()
    clustered["kmeans_cluster"] = kmeans_result["labels"]
    clustered["dbscan_cluster"] = dbscan_result["labels"]

    output_path = os.path.join(output_dir, "rfm_clustered.csv")
    clustered.to_csv(output_path, index=False)
    print(f"\n  💾 Saved clustered data to {output_path}")

    # Add k-analysis stats to kmeans result
    kmeans_result["k_analysis"] = k_analysis

    return {
        "data": clustered,
        "kmeans_result": kmeans_result,
        "dbscan_result": dbscan_result,
        "output_path": output_path,
    }
