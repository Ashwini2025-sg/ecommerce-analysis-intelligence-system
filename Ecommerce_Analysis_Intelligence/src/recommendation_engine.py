"""Action-oriented recommendation engine based on real performance trends."""

from __future__ import annotations

import pandas as pd


def generate_recommendations(df: pd.DataFrame, previous_df: pd.DataFrame | None = None) -> list[str]:
    """Generate 3-5 recommendations backed by actual metrics from the data."""
    if df is None or df.empty:
        return ["Upload data to generate recommendations."]

    recommendations: list[str] = []

    category_summary = (
        df.groupby("Category", as_index=False)
        .agg(Revenue=("Net_Sales", "sum"), Orders=("Order_ID", "nunique"))
        .sort_values("Revenue", ascending=False)
    )
    if not category_summary.empty:
        top_category = category_summary.iloc[0]
        recommendations.append(f"Increase inventory planning for {top_category['Category']} because it generated the highest revenue.")

        if len(category_summary) > 1:
            lowest_category = category_summary.iloc[-1]
            recommendations.append(f"Investigate the sales performance of {lowest_category['Category']} and run a focused promotion to reverse the decline.")

    product_summary = (
        df.groupby("Product_Name", as_index=False)
        .agg(Revenue=("Net_Sales", "sum"), Quantity=("Quantity", "sum"))
        .sort_values("Quantity", ascending=False)
    )
    if not product_summary.empty:
        high_volume_low_revenue = product_summary.loc[
            product_summary["Revenue"] / product_summary["Quantity"] < product_summary["Revenue"].mean() / max(1, product_summary["Quantity"].mean())
        ]
        if not high_volume_low_revenue.empty:
            product_name = high_volume_low_revenue.iloc[0]["Product_Name"]
            recommendations.append(f"Review pricing and promotional strategy for {product_name} because it has strong volume but relatively low revenue efficiency.")

    city_summary = (
        df.groupby("City", as_index=False)
        .agg(Revenue=("Net_Sales", "sum"), Orders=("Order_ID", "nunique"))
        .sort_values("Revenue", ascending=False)
    )
    if not city_summary.empty:
        top_city = city_summary.iloc[0]
        recommendations.append(f"Increase local marketing activity in {top_city['City']} to capitalize on strong demand and sales momentum.")

    customer_summary = (
        df.groupby("Customer_ID", as_index=False)
        .agg(Revenue=("Net_Sales", "sum"), Orders=("Order_ID", "nunique"))
    )
    if not customer_summary.empty:
        high_value = customer_summary["Revenue"].quantile(0.75)
        recommendations.append("Target high-value customers with personalized offers and loyalty benefits to improve repeat purchases.")

    if previous_df is not None and not previous_df.empty:
        current_revenue = float(df["Net_Sales"].sum())
        previous_revenue = float(previous_df["Net_Sales"].sum())
        if current_revenue < previous_revenue:
            recommendations.append("Review discount depth and inventory allocation in underperforming segments before planning the next sales cycle.")

    return recommendations[:5]
