"""
Segmint — Stage 1: Data Cleaning
Reads raw transaction Excel/CSV file and produces a cleaned DataFrame.

Supports:
  - Default UCI Online Retail format (.xlsx/.csv)
  - Custom column mappings for user-uploaded datasets
  - Automatic type conversions, cancellation removals, null checks
"""

import os
from typing import Optional, Dict
import pandas as pd
import numpy as np


def load_raw_data(file_path: str) -> pd.DataFrame:
    """Load raw dataset from .xlsx or .csv."""
    print(f"📂 Loading raw data from {file_path}...")
    ext = os.path.splitext(file_path)[1].lower()
    if ext in [".xlsx", ".xls"]:
        df = pd.read_excel(file_path, engine="openpyxl")
    elif ext in [".csv", ".txt"]:
        df = pd.read_csv(file_path, low_memory=False)
    else:
        # Try reading as csv first, fallback to excel
        try:
            df = pd.read_csv(file_path, low_memory=False)
        except Exception:
            df = pd.read_excel(file_path, engine="openpyxl")

    print(f"  Loaded {len(df):,} rows × {len(df.columns)} columns")
    return df


def detect_column_mapping(df: pd.DataFrame) -> Dict[str, Optional[str]]:
    """
    Intelligently infer column mappings from standard or common column names.
    Returns standard keys: customer_id, invoice_id, date, quantity, unit_price, total_price.
    """
    cols = {str(c).strip(): c for c in df.columns}
    cols_lower = {str(c).strip().lower(): c for c in df.columns}

    mapping = {
        "customer_id": None,
        "invoice_id": None,
        "date": None,
        "quantity": None,
        "unit_price": None,
        "total_price": None,
    }

    # Customer ID patterns
    for name in ["customerid", "customer_id", "client_id", "userid", "user_id", "customer", "account_id", "cust_id"]:
        if name in cols_lower:
            mapping["customer_id"] = cols_lower[name]
            break

    # Invoice / Transaction ID patterns
    for name in ["invoiceno", "invoice_no", "invoice", "invoicenumber", "order_id", "orderid", "transaction_id", "trans_id", "receipt_id"]:
        if name in cols_lower:
            mapping["invoice_id"] = cols_lower[name]
            break

    # Date patterns
    for name in ["invoicedate", "invoice_date", "orderdate", "order_date", "date", "timestamp", "transaction_date", "trans_date"]:
        if name in cols_lower:
            mapping["date"] = cols_lower[name]
            break

    # Quantity patterns
    for name in ["quantity", "qty", "count", "items", "units"]:
        if name in cols_lower:
            mapping["quantity"] = cols_lower[name]
            break

    # Unit Price patterns
    for name in ["unitprice", "unit_price", "price", "item_price", "rate"]:
        if name in cols_lower:
            mapping["unit_price"] = cols_lower[name]
            break

    # Total Price / Amount patterns
    for name in ["totalprice", "total_price", "total_amount", "amount", "total", "sales", "revenue", "spend"]:
        if name in cols_lower:
            mapping["total_price"] = cols_lower[name]
            break

    return mapping


def clean_transactions(df: pd.DataFrame, column_mapping: Optional[dict] = None) -> dict:
    """
    Clean raw transaction data and standardize into standard schema:
    [CustomerID, InvoiceNo, InvoiceDate, Quantity, UnitPrice, TotalPrice]

    Returns:
        dict with keys:
            - 'data': cleaned pd.DataFrame
            - 'stats': dict of cleaning statistics
    """
    stats = {"original_rows": len(df)}

    # Apply mapping if provided or auto-detect
    if not column_mapping:
        column_mapping = detect_column_mapping(df)

    cust_col = column_mapping.get("customer_id")
    inv_col = column_mapping.get("invoice_id")
    date_col = column_mapping.get("date")
    qty_col = column_mapping.get("quantity")
    price_col = column_mapping.get("unit_price")
    total_col = column_mapping.get("total_price")

    if not cust_col or cust_col not in df.columns:
        raise ValueError(f"Customer ID column not found in dataset. Detected: {list(df.columns)}")
    if not date_col or date_col not in df.columns:
        raise ValueError(f"Date column not found in dataset. Detected: {list(df.columns)}")

    # Standardize column naming
    rename_dict = {
        cust_col: "CustomerID",
        date_col: "InvoiceDate",
    }
    if inv_col and inv_col in df.columns:
        rename_dict[inv_col] = "InvoiceNo"
    else:
        # Synthesize InvoiceNo if missing using index
        df["InvoiceNo"] = [f"INV_{i}" for i in range(len(df))]

    if qty_col and qty_col in df.columns:
        rename_dict[qty_col] = "Quantity"
    else:
        df["Quantity"] = 1

    if price_col and price_col in df.columns:
        rename_dict[price_col] = "UnitPrice"

    if total_col and total_col in df.columns:
        rename_dict[total_col] = "TotalPrice"

    df = df.rename(columns=rename_dict)

    # --- 1. Drop null CustomerID ---
    null_customer_mask = df["CustomerID"].isnull()
    stats["null_customer_rows"] = int(null_customer_mask.sum())
    stats["null_customer_pct"] = round(null_customer_mask.mean() * 100, 1) if len(df) > 0 else 0
    df = df[~null_customer_mask].copy()
    print(f"  ✂ Dropped {stats['null_customer_rows']:,} rows with null CustomerID ({stats['null_customer_pct']}%)")

    # --- 2. Cast CustomerID to string/int representation ---
    try:
        df["CustomerID"] = df["CustomerID"].astype(float).astype(int)
    except Exception:
        # Categorical customer codes
        df["CustomerID"] = df["CustomerID"].astype(str)

    # --- 3. Cast InvoiceDate to datetime ---
    df["InvoiceDate"] = pd.to_datetime(df["InvoiceDate"], errors="coerce")
    null_date_mask = df["InvoiceDate"].isnull()
    if null_date_mask.sum() > 0:
        df = df[~null_date_mask].copy()

    # --- 4. Remove cancellations (InvoiceNo starts with 'C' if string) ---
    df["InvoiceNo"] = df["InvoiceNo"].astype(str)
    cancellation_mask = df["InvoiceNo"].str.startswith("C")
    stats["cancellation_rows"] = int(cancellation_mask.sum())
    df = df[~cancellation_mask].copy()
    if stats["cancellation_rows"] > 0:
        print(f"  ✂ Removed {stats['cancellation_rows']:,} cancellation rows")

    # --- 5. Clean Quantity & Prices ---
    if "Quantity" in df.columns:
        df["Quantity"] = pd.to_numeric(df["Quantity"], errors="coerce").fillna(1)
        bad_qty_mask = df["Quantity"] <= 0
        stats["bad_quantity_rows"] = int(bad_qty_mask.sum())
        df = df[~bad_qty_mask].copy()
    else:
        df["Quantity"] = 1
        stats["bad_quantity_rows"] = 0

    if "UnitPrice" in df.columns:
        df["UnitPrice"] = pd.to_numeric(df["UnitPrice"], errors="coerce").fillna(0)
        bad_price_mask = df["UnitPrice"] <= 0
        stats["bad_price_rows"] = int(bad_price_mask.sum())
        df = df[~bad_price_mask].copy()
    else:
        stats["bad_price_rows"] = 0

    # --- 6. Compute or Validate TotalPrice ---
    if "TotalPrice" not in df.columns or df["TotalPrice"].isnull().all():
        if "Quantity" in df.columns and "UnitPrice" in df.columns:
            df["TotalPrice"] = df["Quantity"] * df["UnitPrice"]
        else:
            df["TotalPrice"] = 1.0
    else:
        df["TotalPrice"] = pd.to_numeric(df["TotalPrice"], errors="coerce").fillna(0)
        bad_total_mask = df["TotalPrice"] <= 0
        df = df[~bad_total_mask].copy()

    stats["cleaned_rows"] = len(df)
    stats["unique_customers"] = df["CustomerID"].nunique()
    stats["unique_invoices"] = df["InvoiceNo"].nunique()
    stats["date_range_start"] = str(df["InvoiceDate"].min().date()) if len(df) > 0 else "N/A"
    stats["date_range_end"] = str(df["InvoiceDate"].max().date()) if len(df) > 0 else "N/A"

    print(f"  ✓ Cleaned dataset: {stats['cleaned_rows']:,} rows, "
          f"{stats['unique_customers']:,} customers, "
          f"{stats['unique_invoices']:,} invoices")
    print(f"  📅 Date range: {stats['date_range_start']} → {stats['date_range_end']}")

    return {"data": df, "stats": stats}


def run_cleaning(raw_file_path: str, output_dir: str, column_mapping: Optional[dict] = None) -> dict:
    """
    Full Stage 1 pipeline: load raw data → clean → save.

    Returns:
        dict with 'data' (DataFrame), 'stats' (dict), and 'output_path' (str).
    """
    os.makedirs(output_dir, exist_ok=True)

    df_raw = load_raw_data(raw_file_path)
    result = clean_transactions(df_raw, column_mapping=column_mapping)

    output_path = os.path.join(output_dir, "cleaned_transactions.csv")
    result["data"].to_csv(output_path, index=False)
    print(f"  💾 Saved cleaned data to {output_path}")

    result["output_path"] = output_path
    return result
