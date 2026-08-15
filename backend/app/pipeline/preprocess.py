"""
Segmint — Stage 3: Preprocessing for Clustering
Transforms raw RFM values into a scaled feature matrix suitable for
distance-based clustering algorithms (K-Means, DBSCAN).

Operations:
  1. log1p transform on Frequency and Monetary (fixes right-skew)
  2. IQR-based Winsorization (caps extreme outliers)
  3. StandardScaler (zero mean, unit variance)
"""

import os
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler


def winsorize_iqr(series: pd.Series, factor: float = 1.5) -> pd.Series:
    """Cap outliers beyond IQR * factor."""
    q1 = series.quantile(0.25)
    q3 = series.quantile(0.75)
    iqr = q3 - q1
    lower = q1 - factor * iqr
    upper = q3 + factor * iqr
    return series.clip(lower=lower, upper=upper)


def preprocess_rfm(rfm: pd.DataFrame) -> dict:
    """
    Transform raw RFM features into a scaled matrix for clustering.

    Args:
        rfm: DataFrame with columns [CustomerID, Recency, Frequency, Monetary]

    Returns:
        dict with keys:
            - 'data': DataFrame with scaled features (same index as input)
            - 'scaler': fitted StandardScaler instance
            - 'stats': preprocessing statistics
    """
    feature_cols = ["Recency", "Frequency", "Monetary"]
    df = rfm[["CustomerID"]].copy()

    # --- 1. Log1p transform on Frequency and Monetary ---
    # Recency is left as-is because it's already roughly linear in meaningful terms
    log_frequency = np.log1p(rfm["Frequency"])
    log_monetary = np.log1p(rfm["Monetary"])

    transformed = pd.DataFrame({
        "Recency": rfm["Recency"].values,
        "Frequency": log_frequency.values,
        "Monetary": log_monetary.values,
    })

    print(f"  🔄 Applied log1p to Frequency and Monetary")

    # --- 2. Winsorize outliers (IQR × 1.5) ---
    for col in transformed.columns:
        original_min = transformed[col].min()
        original_max = transformed[col].max()
        transformed[col] = winsorize_iqr(transformed[col])
        new_min = transformed[col].min()
        new_max = transformed[col].max()
        if original_min != new_min or original_max != new_max:
            print(f"  ✂ Winsorized {col}: [{original_min:.2f}, {original_max:.2f}] → [{new_min:.2f}, {new_max:.2f}]")

    # --- 3. StandardScaler ---
    scaler = StandardScaler()
    scaled_values = scaler.fit_transform(transformed)

    scaled_df = pd.DataFrame(
        scaled_values,
        columns=["Recency_scaled", "Frequency_scaled", "Monetary_scaled"],
        index=rfm.index,
    )
    scaled_df.insert(0, "CustomerID", rfm["CustomerID"].values)

    stats = {
        "feature_means": {col: round(float(m), 4) for col, m in zip(feature_cols, scaler.mean_)},
        "feature_stds": {col: round(float(s), 4) for col, s in zip(feature_cols, scaler.scale_)},
        "customers_processed": len(scaled_df),
    }

    print(f"  ✓ Scaled {stats['customers_processed']:,} customers to zero-mean, unit-variance")

    return {"data": scaled_df, "scaler": scaler, "stats": stats}


def run_preprocessing(rfm_csv_path: str, output_dir: str) -> dict:
    """
    Full Stage 3 pipeline: load raw RFM → preprocess → save.

    Returns:
        dict with 'data' (DataFrame), 'scaler', 'stats', 'output_path'.
    """
    os.makedirs(output_dir, exist_ok=True)

    print(f"⚙️ Preprocessing RFM features...")
    rfm = pd.read_csv(rfm_csv_path)
    result = preprocess_rfm(rfm)

    output_path = os.path.join(output_dir, "rfm_scaled.csv")
    result["data"].to_csv(output_path, index=False)
    print(f"  💾 Saved scaled features to {output_path}")

    result["output_path"] = output_path
    return result
