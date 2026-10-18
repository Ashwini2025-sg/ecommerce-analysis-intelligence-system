"""Data validation and cleaning utilities for the e-commerce dataset."""

from __future__ import annotations

from typing import Any

import pandas as pd

REQUIRED_COLUMNS = [
    "Order_ID",
    "Order_Date",
    "Customer_ID",
    "Customer_Name",
    "Product_ID",
    "Product_Name",
    "Category",
    "Quantity",
    "Unit_Price",
    "Discount",
    "City",
    "State",
    "Payment_Mode",
    "Customer_Type",
    "Rating",
]


def _standardize_columns(df: pd.DataFrame) -> pd.DataFrame:
    cleaned = df.copy()
    cleaned.columns = [str(column).strip() for column in cleaned.columns]
    return cleaned


def _safe_numeric(series: pd.Series) -> pd.Series:
    return pd.to_numeric(series, errors="coerce")


def calculate_data_quality_score(df: pd.DataFrame, report: dict[str, Any]) -> float:
    """Produce a simple quality score from 0 to 100."""
    if df.empty:
        return 0.0

    penalties = 0.0
    penalties += report.get("missing_values", 0) * 1.5
    penalties += report.get("duplicate_rows", 0) * 5
    penalties += report.get("invalid_negative_quantity", 0) * 2
    penalties += report.get("invalid_prices", 0) * 3
    penalties += report.get("invalid_dates", 0) * 4
    penalties += report.get("missing_categories", 0) * 1.5

    score = max(0.0, 100.0 - penalties)
    return round(score, 2)


def clean_ecommerce_data(df: pd.DataFrame) -> tuple[pd.DataFrame, dict[str, Any]]:
    """Clean the raw dataset and return cleaned data with a validation report."""
    if df is None or df.empty:
        empty_df = pd.DataFrame(columns=REQUIRED_COLUMNS)
        return empty_df, {
            "rows": 0,
            "columns": len(empty_df.columns),
            "missing_values": 0,
            "duplicate_rows": 0,
            "invalid_negative_quantity": 0,
            "invalid_prices": 0,
            "invalid_dates": 0,
            "missing_categories": 0,
            "data_quality_score": 0.0,
            "cleaning_actions": ["No data loaded."],
        }

    working = _standardize_columns(df).copy()
    missing_columns = [column for column in REQUIRED_COLUMNS if column not in working.columns]
    if missing_columns:
        raise ValueError(f"Missing required columns: {missing_columns}")

    report: dict[str, Any] = {
        "rows": int(len(working)),
        "columns": int(len(working.columns)),
        "missing_values": int(working.isna().sum().sum()),
        "duplicate_rows": int(working.duplicated(subset=REQUIRED_COLUMNS).sum()),
        "invalid_negative_quantity": 0,
        "invalid_prices": 0,
        "invalid_dates": 0,
        "missing_categories": 0,
        "cleaning_actions": [],
    }

    working = working.drop_duplicates(subset=REQUIRED_COLUMNS).copy()
    report["cleaning_actions"].append("Removed duplicate records.")

    working["Order_ID"] = working["Order_ID"].astype(str).str.strip()
    working["Customer_ID"] = working["Customer_ID"].astype(str).str.strip()
    working["Product_ID"] = working["Product_ID"].astype(str).str.strip()
    working["Customer_Name"] = working["Customer_Name"].fillna("Unknown Customer").astype(str).str.strip()
    working["Product_Name"] = working["Product_Name"].fillna("Unknown Product").astype(str).str.strip()

    working["Order_Date"] = pd.to_datetime(working["Order_Date"], errors="coerce")
    report["invalid_dates"] = int(working["Order_Date"].isna().sum())
    working = working.dropna(subset=["Order_Date"]).copy()
    report["cleaning_actions"].append("Converted Order_Date to datetime and removed invalid dates.")

    working["Quantity"] = _safe_numeric(working["Quantity"])
    working["Unit_Price"] = _safe_numeric(working["Unit_Price"])
    working["Discount"] = _safe_numeric(working["Discount"]).fillna(0)
    working["Rating"] = _safe_numeric(working["Rating"])

    report["invalid_negative_quantity"] = int((working["Quantity"] < 0).sum())
    working = working[working["Quantity"] >= 0].copy()
    report["cleaning_actions"].append("Removed invalid negative quantities.")

    report["invalid_prices"] = int((working["Unit_Price"] <= 0).sum())
    working = working[working["Unit_Price"] > 0].copy()
    report["cleaning_actions"].append("Removed invalid or zero unit prices.")

    working["Category"] = working["Category"].fillna("Unknown Category").astype(str).str.strip()
    working.loc[working["Category"] == "", "Category"] = "Unknown Category"
    report["missing_categories"] = int((working["Category"] == "Unknown Category").sum())
    report["cleaning_actions"].append("Filled missing categories with Unknown Category.")

    working["City"] = working["City"].fillna("Unknown City").astype(str).str.strip()
    working["State"] = working["State"].fillna("Unknown State").astype(str).str.strip()
    working["Payment_Mode"] = working["Payment_Mode"].fillna("Unknown").astype(str).str.strip()
    working["Customer_Type"] = working["Customer_Type"].fillna("New").astype(str).str.strip()

    working["Sales"] = working["Quantity"] * working["Unit_Price"]
    working["Net_Sales"] = working["Sales"] - working["Discount"]
    working["Year"] = working["Order_Date"].dt.year
    working["Month"] = working["Order_Date"].dt.month
    working["Month_Name"] = working["Order_Date"].dt.strftime("%b")
    working["Quarter"] = working["Order_Date"].dt.quarter

    working["Rating"] = working["Rating"].fillna(working["Rating"].median())
    working["Quantity"] = working["Quantity"].fillna(0)
    working["Discount"] = working["Discount"].fillna(0)

    report["final_rows"] = int(len(working))
    report["data_quality_score"] = calculate_data_quality_score(working, report)
    report["cleaning_actions"] = list(dict.fromkeys(report["cleaning_actions"]))
    return working.reset_index(drop=True), report
