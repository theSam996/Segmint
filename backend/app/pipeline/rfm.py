"""
Segmint — Stage 2: RFM Calculation
Transforms cleaned line-item transactions into a per-customer RFM table.

  Recency   = days since last purchase (lower = more recent = better)
  Frequency = count of unique invoices (distinct purchase events)
  Monetary  = sum of TotalPrice across all orders
"""

import os
import pandas as pd
import numpy as np


def compute_rfm(df: pd.DataFrame) -> dict:
    """
    Compute RFM metrics per customer.

    Args:
        df: Cleaned transaction DataFrame with columns:
            [CustomerID, InvoiceNo, InvoiceDate, TotalPrice]

    Returns:
        dict with keys:
            - 'data': RFM DataFrame (one row per customer)
            - 'stats': dict of summary statistics
            - 'snapshot_date': the reference date used
    """
    # Snapshot date = 1 day after the last transaction
    # This ensures every Recency ≥ 1 (avoids log(0) issues downstream)
    max_date = df["InvoiceDate"].max()
    snapshot_date = max_date + pd.Timedelta(days=1)
    print(f"  📅 Snapshot date: {snapshot_date.date()} (max transaction + 1 day)")

    # --- Aggregate per customer ---
    rfm = df.groupby("CustomerID").agg(
        Recency=("InvoiceDate", lambda x: (snapshot_date - x.max()).days),
        Frequency=("InvoiceNo", "nunique"),
        Monetary=("TotalPrice", "sum")
    ).reset_index()

    # Round Monetary to 2 decimal places
    rfm["Monetary"] = rfm["Monetary"].round(2)

    # --- Summary stats ---
    stats = {
        "total_customers": len(rfm),
        "recency_mean": round(rfm["Recency"].mean(), 1),
        "recency_median": round(rfm["Recency"].median(), 1),
        "frequency_mean": round(rfm["Frequency"].mean(), 1),
        "frequency_median": round(rfm["Frequency"].median(), 1),
        "monetary_mean": round(rfm["Monetary"].mean(), 2),
        "monetary_median": round(rfm["Monetary"].median(), 2),
        "monetary_max": round(rfm["Monetary"].max(), 2),
        "snapshot_date": str(snapshot_date.date()),
    }

    print(f"  ✓ RFM table: {stats['total_customers']:,} customers")
    print(f"    Recency  — mean: {stats['recency_mean']} days, median: {stats['recency_median']} days")
    print(f"    Frequency — mean: {stats['frequency_mean']}, median: {stats['frequency_median']}")
    print(f"    Monetary  — mean: £{stats['monetary_mean']:,.2f}, median: £{stats['monetary_median']:,.2f}")

    return {"data": rfm, "stats": stats, "snapshot_date": snapshot_date}


def run_rfm(cleaned_csv_path: str, output_dir: str) -> dict:
    """
    Full Stage 2 pipeline: load cleaned transactions → compute RFM → save.

    Returns:
        dict with 'data' (DataFrame), 'stats' (dict), 'output_path' (str).
    """
    os.makedirs(output_dir, exist_ok=True)

    print(f"📊 Computing RFM metrics...")
    df = pd.read_csv(cleaned_csv_path, parse_dates=["InvoiceDate"])
    result = compute_rfm(df)

    output_path = os.path.join(output_dir, "rfm_raw.csv")
    result["data"].to_csv(output_path, index=False)
    print(f"  💾 Saved RFM table to {output_path}")

    result["output_path"] = output_path
    return result
