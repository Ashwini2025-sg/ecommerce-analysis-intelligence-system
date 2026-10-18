"""Independent KPI calculation engine for the e-commerce system."""

from __future__ import annotations

import pandas as pd


def calculate_repeat_customer_rate(df: pd.DataFrame) -> float:
    """Return the percentage of customers who placed more than one order."""
    if df is None or df.empty or "Customer_ID" not in df.columns:
        return 0.0
    repeat_customers = df.groupby("Customer_ID").size()
    repeat_count = int((repeat_customers > 1).sum())
    return round((repeat_count / df["Customer_ID"].nunique()) * 100, 2)


def calculate_growth_rate(current_value: float, previous_value: float) -> float:
    """Calculate percentage growth relative to a prior baseline."""
    if previous_value == 0:
        return 0.0 if current_value == 0 else 100.0
    return round(((current_value - previous_value) / previous_value) * 100, 2)


def calculate_kpis(df: pd.DataFrame, previous_period_df: pd.DataFrame | None = None) -> dict[str, float | int]:
    """Compute the main KPIs for a dataset and optional prior-period comparison."""
    if df is None or df.empty:
        return {
            "Total Revenue": 0.0,
            "Total Orders": 0,
            "Total Customers": 0,
            "Total Products": 0,
            "Total Quantity Sold": 0,
            "Average Order Value": 0.0,
            "Average Discount": 0.0,
            "Average Rating": 0.0,
            "Repeat Customer Rate": 0.0,
            "Revenue Growth Rate": 0.0,
            "Order Growth Rate": 0.0,
        }

    revenue_col = "Sales" if "Sales" in df.columns else ("Net_Sales" if "Net_Sales" in df.columns else "Revenue")
    total_revenue = float(df[revenue_col].sum()) if revenue_col in df.columns else 0.0
    total_orders = int(df["Order_ID"].nunique()) if "Order_ID" in df.columns else len(df)
    total_customers = int(df["Customer_ID"].nunique()) if "Customer_ID" in df.columns else 0
    total_products = int(df["Product_ID"].nunique()) if "Product_ID" in df.columns else 0
    total_quantity = int(df["Quantity"].sum()) if "Quantity" in df.columns else 0
    average_order_value = float(total_revenue / total_orders) if total_orders else 0.0
    average_discount = float(df["Discount"].mean()) if "Discount" in df.columns and len(df) else 0.0
    average_rating = float(df["Rating"].mean()) if "Rating" in df.columns and len(df) else 0.0
    repeat_customer_rate = calculate_repeat_customer_rate(df)

    previous_revenue_col = "Net_Sales" if previous_period_df is not None and "Net_Sales" in previous_period_df.columns else "Revenue" if previous_period_df is not None and "Revenue" in previous_period_df.columns else None
    previous_revenue = float(previous_period_df[previous_revenue_col].sum()) if previous_period_df is not None and not previous_period_df.empty and previous_revenue_col is not None else 0.0
    previous_orders = int(previous_period_df["Order_ID"].nunique()) if previous_period_df is not None and not previous_period_df.empty and "Order_ID" in previous_period_df.columns else int(len(previous_period_df)) if previous_period_df is not None and not previous_period_df.empty else 0

    revenue_growth_rate = calculate_growth_rate(total_revenue, previous_revenue)
    order_growth_rate = calculate_growth_rate(total_orders, previous_orders)

    return {
        "Total Revenue": round(total_revenue, 2),
        "Total Orders": total_orders,
        "Total Customers": total_customers,
        "Total Products": total_products,
        "Total Quantity Sold": total_quantity,
        "Average Order Value": round(average_order_value, 2),
        "Average Discount": float(average_discount),
        "Average Rating": float(average_rating),
        "Repeat Customer Rate": round(repeat_customer_rate, 2),
        "Revenue Growth Rate": round(revenue_growth_rate, 2),
        "Order Growth Rate": round(order_growth_rate, 2),
    }
