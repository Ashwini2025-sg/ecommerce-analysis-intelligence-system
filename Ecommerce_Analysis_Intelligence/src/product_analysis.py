"""Product performance analysis and classification utilities."""

from __future__ import annotations

import pandas as pd


def build_product_summary(df: pd.DataFrame) -> pd.DataFrame:
    """Summarize revenue and quantity by product."""
    if df is None or df.empty:
        return pd.DataFrame(columns=["Product_ID", "Product_Name", "Category", "Revenue", "Quantity", "Rating", "Average_Price"])

    if {"Product_ID", "Revenue", "Quantity", "Rating"}.issubset(df.columns):
        summary = df[["Product_ID", "Product_Name", "Category", "Revenue", "Quantity", "Rating"]].copy() if "Product_Name" in df.columns and "Category" in df.columns else df[["Product_ID", "Revenue", "Quantity", "Rating"]].copy()
        if "Product_Name" not in summary.columns:
            summary["Product_Name"] = summary["Product_ID"]
        if "Category" not in summary.columns:
            summary["Category"] = "General"
        return summary.sort_values("Revenue", ascending=False).reset_index(drop=True)

    group_columns = [column for column in ["Product_ID", "Product_Name", "Category"] if column in df.columns]
    if not group_columns:
        return pd.DataFrame(columns=["Product_ID", "Product_Name", "Category", "Revenue", "Quantity", "Rating"])

    summary = (
        df.groupby(group_columns, as_index=False)
        .agg(
            Revenue=("Net_Sales", "sum") if "Net_Sales" in df.columns else ("Revenue", "sum"),
            Quantity=("Quantity", "sum") if "Quantity" in df.columns else ("Quantity", "sum"),
            Rating=("Rating", "mean") if "Rating" in df.columns else ("Revenue", "mean"),
        )
        .sort_values("Revenue", ascending=False)
        .reset_index(drop=True)
    )
    return summary


def classify_products(
    df: pd.DataFrame,
    revenue_threshold: float = 1000,
    quantity_threshold: int = 30,
    rating_threshold: float = 4.5,
) -> pd.DataFrame:
    """Classify products using configurable thresholds.

    - Star Product: high revenue + strong customer rating
    - Premium Product: revenue above threshold with good value but not top rating
    - Volume Product: high quantity sold with strong demand
    - Needs Attention: low revenue or weak rating
    """
    summary = build_product_summary(df)
    if summary.empty:
        return summary.assign(Category=pd.Series(dtype="object"))

    def classify(row: pd.Series) -> str:
        if row["Rating"] >= rating_threshold and row["Revenue"] >= revenue_threshold:
            return "Star Product"
        if row["Revenue"] >= revenue_threshold and row["Rating"] >= 3.5 and row["Quantity"] < quantity_threshold:
            return "Premium Product"
        if row["Quantity"] >= quantity_threshold and row["Revenue"] >= revenue_threshold / 2:
            return "Volume Product"
        return "Needs Attention"

    summary["Category"] = summary.apply(classify, axis=1)
    return summary


def top_products(df: pd.DataFrame, by: str = "Revenue", limit: int = 10) -> pd.DataFrame:
    """Return top products by revenue or quantity."""
    summary = build_product_summary(df)
    if summary.empty:
        return summary
    metric = "Revenue" if by == "Revenue" else "Quantity"
    return summary.sort_values(metric, ascending=False).head(limit).reset_index(drop=True)


def product_performance_matrix(df: pd.DataFrame) -> pd.DataFrame:
    """Return product performance metrics for a matrix-style analysis."""
    summary = build_product_summary(df)
    if summary.empty:
        return summary
    summary["Revenue_Rank"] = summary["Revenue"].rank(ascending=False, method="first")
    summary["Quantity_Rank"] = summary["Quantity"].rank(ascending=False, method="first")
    summary["Rating_Rank"] = summary["Rating"].rank(ascending=False, method="first")
    return summary
