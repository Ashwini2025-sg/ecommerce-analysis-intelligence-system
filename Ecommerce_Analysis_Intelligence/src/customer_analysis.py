"""Customer analytics and segmentation utilities."""

from __future__ import annotations

import pandas as pd


def build_customer_summary(df: pd.DataFrame) -> pd.DataFrame:
    """Create a per-customer summary table with revenue and order counts."""
    if df is None or df.empty:
        return pd.DataFrame(columns=["Customer_ID", "Orders", "Revenue", "Avg_Order_Value", "Segment"])

    if {"Customer_ID", "Revenue", "Orders"}.issubset(df.columns):
        summary = df[["Customer_ID", "Revenue", "Orders"]].copy()
        summary["Avg_Order_Value"] = summary["Revenue"] / summary["Orders"].replace(0, 1)
        return summary.sort_values("Revenue", ascending=False).reset_index(drop=True)

    revenue_col = "Net_Sales" if "Net_Sales" in df.columns else "Revenue"
    order_col = "Order_ID" if "Order_ID" in df.columns else "Orders"
    if order_col == "Order_ID":
        grouped = (
            df.groupby("Customer_ID", as_index=False)
            .agg(Orders=("Order_ID", "nunique"), Revenue=(revenue_col, "sum"))
        )
    elif order_col == "Orders":
        grouped = df.groupby("Customer_ID", as_index=False).agg(Orders=("Orders", "sum"), Revenue=(revenue_col, "sum"))
    else:
        grouped = df.groupby("Customer_ID", as_index=False).agg(Orders=("Customer_ID", "count"), Revenue=(revenue_col, "sum"))

    grouped["Avg_Order_Value"] = grouped["Revenue"] / grouped["Orders"].replace(0, 1)
    return grouped.sort_values("Revenue", ascending=False).reset_index(drop=True)


def segment_customers(
    df: pd.DataFrame,
    revenue_threshold: float = 10000,
    order_threshold: int = 5,
) -> pd.DataFrame:
    """Classify customers into High Value, Medium Value, and Low Value.

    Thresholds are configurable and documented in the project README.
    """
    summary = build_customer_summary(df)
    if summary.empty:
        return summary.assign(Segment=pd.Series(dtype="object"))

    def classify(row: pd.Series) -> str:
        if row["Revenue"] >= revenue_threshold and row["Orders"] >= order_threshold:
            return "High Value"
        if row["Revenue"] >= revenue_threshold / 2 or row["Orders"] >= max(1, order_threshold // 2):
            return "Medium Value"
        return "Low Value"

    summary["Segment"] = summary.apply(classify, axis=1)
    return summary


def calculate_customer_metrics(df: pd.DataFrame) -> dict[str, float | int]:
    """Compute customer-level KPIs including orders per customer and revenue per customer."""
    if df is None or df.empty:
        return {
            "Unique Customers": 0,
            "Orders Per Customer": 0.0,
            "Revenue Per Customer": 0.0,
            "Average Customer Spending": 0.0,
        }

    unique_customers = df["Customer_ID"].nunique()
    total_orders = df["Order_ID"].nunique()
    total_revenue = df["Net_Sales"].sum()

    return {
        "Unique Customers": unique_customers,
        "Orders Per Customer": round(total_orders / unique_customers, 2) if unique_customers else 0.0,
        "Revenue Per Customer": round(total_revenue / unique_customers, 2) if unique_customers else 0.0,
        "Average Customer Spending": round(total_revenue / unique_customers, 2) if unique_customers else 0.0,
    }


def new_vs_returning_customers(df: pd.DataFrame) -> dict[str, int]:
    """Return counts for new and returning customers."""
    if df is None or df.empty:
        return {"New": 0, "Returning": 0}

    order_counts = df.groupby("Customer_ID")["Order_ID"].nunique()
    returning = int((order_counts > 1).sum())
    new = int((order_counts == 1).sum())
    return {"New": new, "Returning": returning}
