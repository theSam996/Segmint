"""
Segmint — Stage 1: Data Cleaning
Reads raw transaction Excel file and produces a cleaned DataFrame.

Cleaning operations:
  - Drop rows with null CustomerID (~25% of dataset)
  - Remove cancellations (InvoiceNo starting with 'C')
  - Remove negative/zero Quantity and UnitPrice
  - Cast InvoiceDate to datetime64
  - Compute TotalPrice = Quantity × UnitPrice
"""

import os
import pandas as pd
import numpy as np


def load_raw_data(file_path: str) -> pd.DataFrame:
    """Load the raw Excel dataset."""
    print(f"📂 Loading raw data from {file_path}...")
    df = pd.read_excel(file_path, engine="openpyxl")
    print(f"  Loaded {len(df):,} rows × {len(df.columns)} columns")
    return df


def clean_transactions(df: pd.DataFrame) -> dict:
    """
    Clean raw transaction data and return cleaned DataFrame plus stats.

    Returns:
        dict with keys:
            - 'data': cleaned pd.DataFrame
            - 'stats': dict of cleaning statistics
    """
    stats = {"original_rows": len(df)}

    # --- 1. Drop null CustomerID ---
    null_customer_mask = df["CustomerID"].isnull()
    stats["null_customer_rows"] = int(null_customer_mask.sum())
    stats["null_customer_pct"] = round(null_customer_mask.mean() * 100, 1)
    df = df[~null_customer_mask].copy()
    print(f"  ✂ Dropped {stats['null_customer_rows']:,} rows with null CustomerID ({stats['null_customer_pct']}%)")

    # --- 2. Cast CustomerID to int ---
    df["CustomerID"] = df["CustomerID"].astype(int)

    # --- 3. Cast InvoiceDate to datetime ---
    df["InvoiceDate"] = pd.to_datetime(df["InvoiceDate"])

    # --- 4. Remove cancellations (InvoiceNo starts with 'C') ---
    df["InvoiceNo"] = df["InvoiceNo"].astype(str)
    cancellation_mask = df["InvoiceNo"].str.startswith("C")
    stats["cancellation_rows"] = int(cancellation_mask.sum())
    df = df[~cancellation_mask].copy()
    print(f"  ✂ Removed {stats['cancellation_rows']:,} cancellation rows")

    # --- 5. Remove negative/zero Quantity ---
    bad_qty_mask = df["Quantity"] <= 0
    stats["bad_quantity_rows"] = int(bad_qty_mask.sum())
    df = df[~bad_qty_mask].copy()
    print(f"  ✂ Removed {stats['bad_quantity_rows']:,} rows with Quantity ≤ 0")

    # --- 6. Remove negative/zero UnitPrice ---
    bad_price_mask = df["UnitPrice"] <= 0
    stats["bad_price_rows"] = int(bad_price_mask.sum())
    df = df[~bad_price_mask].copy()
    print(f"  ✂ Removed {stats['bad_price_rows']:,} rows with UnitPrice ≤ 0")

    # --- 7. Compute TotalPrice ---
    df["TotalPrice"] = df["Quantity"] * df["UnitPrice"]

    stats["cleaned_rows"] = len(df)
    stats["unique_customers"] = df["CustomerID"].nunique()
    stats["unique_invoices"] = df["InvoiceNo"].nunique()
    stats["date_range_start"] = str(df["InvoiceDate"].min().date())
    stats["date_range_end"] = str(df["InvoiceDate"].max().date())

    print(f"  ✓ Cleaned dataset: {stats['cleaned_rows']:,} rows, "
          f"{stats['unique_customers']:,} customers, "
          f"{stats['unique_invoices']:,} invoices")
    print(f"  📅 Date range: {stats['date_range_start']} → {stats['date_range_end']}")

    return {"data": df, "stats": stats}


def run_cleaning(raw_file_path: str, output_dir: str) -> dict:
    """
    Full Stage 1 pipeline: load raw data → clean → save.

    Returns:
        dict with 'data' (DataFrame), 'stats' (dict), and 'output_path' (str).
    """
    os.makedirs(output_dir, exist_ok=True)

    df_raw = load_raw_data(raw_file_path)
    result = clean_transactions(df_raw)

    output_path = os.path.join(output_dir, "cleaned_transactions.csv")
    result["data"].to_csv(output_path, index=False)
    print(f"  💾 Saved cleaned data to {output_path}")

    result["output_path"] = output_path
    return result
