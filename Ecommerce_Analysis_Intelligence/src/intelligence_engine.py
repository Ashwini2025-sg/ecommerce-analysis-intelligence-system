"""Business intelligence engine that explains performance and highlights trends."""

from __future__ import annotations

import numpy as np
import pandas as pd


def _safe_percentage_change(current_value: float, previous_value: float) -> float:
    if previous_value in (None, 0):
        return 0.0 if current_value == 0 else 100.0
    return round(((current_value - previous_value) / previous_value) * 100, 2)


def generate_business_insights(df: pd.DataFrame) -> list[str]:
    """Generate human-readable, data-driven business insights."""
    if df is None or df.empty:
        return ["No data available to generate insights."]

    insights: list[str] = []
    revenue_col = "Net_Sales" if "Net_Sales" in df.columns else "Revenue"
    month_col = "Month_Name" if "Month_Name" in df.columns else ("Order_Date" if "Order_Date" in df.columns else None)
    order_col = "Order_ID" if "Order_ID" in df.columns else ("Orders" if "Orders" in df.columns else "Revenue")
    order_agg = "nunique" if order_col == "Order_ID" else ("sum" if order_col == "Orders" else "count")

    if month_col is not None:
        if month_col == "Month_Name":
            month_summary = (
                df.groupby("Month_Name", as_index=False)
                .agg(Revenue=(revenue_col, "sum"), Orders=(order_col, order_agg))
                .sort_values("Revenue", ascending=False)
            )
        else:
            df2 = df.copy()
            df2["Month_Name"] = pd.to_datetime(df2["Order_Date"], errors="coerce").dt.strftime("%b")
            month_summary = (
                df2.groupby("Month_Name", as_index=False)
                .agg(Revenue=(revenue_col, "sum"), Orders=(order_col, order_agg))
                .sort_values("Revenue", ascending=False)
            )
        if not month_summary.empty:
            highest_month = month_summary.iloc[0]
            insights.append(f"{highest_month['Month_Name']} produced the highest revenue of ₹{highest_month['Revenue']:.2f}.")

    category_summary = (
        df.groupby("Category", as_index=False)
        .agg(Revenue=(revenue_col, "sum"), Orders=(order_col, order_agg))
        .sort_values("Revenue", ascending=False)
    )
    if not category_summary.empty:
        top_category = category_summary.iloc[0]
        insights.append(f"{top_category['Category']} is the top category with revenue of ₹{top_category['Revenue']:.2f}.")

    city_summary = (
        df.groupby("City", as_index=False)
        .agg(Revenue=(revenue_col, "sum"), Orders=(order_col, order_agg))
        .sort_values("Revenue", ascending=False)
    )
    if not city_summary.empty:
        top_city = city_summary.iloc[0]
        insights.append(f"{top_city['City']} generated the highest revenue of ₹{top_city['Revenue']:.2f}.")

    if "Product_Name" in df.columns:
        product_summary = (
            df.groupby("Product_Name", as_index=False)
            .agg(Revenue=(revenue_col, "sum"), Quantity=("Quantity", "sum") if "Quantity" in df.columns else (revenue_col, "count"))
            .sort_values("Revenue", ascending=False)
        )
        if not product_summary.empty:
            best_product = product_summary.iloc[0]
            worst_product = product_summary.iloc[-1]
            insights.append(f"Best-selling product: {best_product['Product_Name']} with revenue of ₹{best_product['Revenue']:.2f}.")
            insights.append(f"Lowest-performing product: {worst_product['Product_Name']} with revenue of ₹{worst_product['Revenue']:.2f}.")

    if "Payment_Mode" in df.columns:
        payment_summary = (
            df.groupby("Payment_Mode", as_index=False)
            .agg(Orders=(order_col, order_agg))
            .sort_values("Orders", ascending=False)
        )
        if not payment_summary.empty:
            top_payment = payment_summary.iloc[0]
            insights.append(f"Most-used payment method: {top_payment['Payment_Mode']} with {top_payment['Orders']} orders.")

    if "Customer_Type" in df.columns:
        customer_segment = df.groupby("Customer_Type").size()
        if not customer_segment.empty:
            dominant_customer_type = customer_segment.idxmax()
            insights.append(f"Customer segment analysis shows {dominant_customer_type} customers are prominent in the sales mix.")

    return insights


def explain_sales_change(current_df: pd.DataFrame, previous_df: pd.DataFrame | None = None) -> str:
    """Explain the likely reason behind revenue changes between two periods."""
    if current_df is None or current_df.empty:
        return "No current data available for sales change analysis."
    if previous_df is None or previous_df.empty:
        return "The dashboard did not receive a previous period for comparison, so trend attribution is unavailable."

    current_revenue = float(current_df["Net_Sales"].sum())
    previous_revenue = float(previous_df["Net_Sales"].sum())
    revenue_change = _safe_percentage_change(current_revenue, previous_revenue)

    current_orders = int(current_df["Order_ID"].nunique())
    previous_orders = int(previous_df["Order_ID"].nunique())
    order_change = _safe_percentage_change(current_orders, previous_orders)

    current_aov = float(current_df["Net_Sales"].sum() / max(1, current_df["Order_ID"].nunique()))
    previous_aov = float(previous_df["Net_Sales"].sum() / max(1, previous_df["Order_ID"].nunique()))
    aov_change = _safe_percentage_change(current_aov, previous_aov)

    category_current = current_df.groupby("Category")["Net_Sales"].sum().sort_values(ascending=False)
    category_previous = previous_df.groupby("Category")["Net_Sales"].sum().sort_values(ascending=False)
    category_name = category_current.index[0] if not category_current.empty else "the primary category"
    if category_name in category_previous.index:
        category_delta = _safe_percentage_change(category_current.get(category_name, 0.0), category_previous.get(category_name, 0.0))
        category_sentence = f" {category_name} changed by {category_delta}%"
    else:
        category_sentence = " category mix shifted"

    city_current = current_df.groupby("City")["Net_Sales"].sum().sort_values(ascending=False)
    city_previous = previous_df.groupby("City")["Net_Sales"].sum().sort_values(ascending=False)
    city_name = city_current.index[0] if not city_current.empty else "top city"
    if city_name in city_previous.index:
        city_delta = _safe_percentage_change(city_current.get(city_name, 0.0), city_previous.get(city_name, 0.0))
        city_sentence = f" in {city_name}"
    else:
        city_sentence = " across the key markets"

    if revenue_change >= 0:
        return (
            f"Revenue increased by {abs(revenue_change)}% mainly because order volume changed by {abs(order_change)}% and "
            f"average order value changed by {abs(aov_change)}%. {category_name}{category_sentence} and demand in {city_name} also contributed{city_sentence}."
        )
    return (
        f"Revenue decreased mainly because order volume fell by {abs(order_change)}% and average order value changed by {abs(aov_change)}%. "
        f"The largest pressure came from {category_name}{category_sentence} in {city_name}."
    )


def detect_anomalies(df: pd.DataFrame, period: str = "daily") -> pd.DataFrame:
    """Use a simple z-score approach to identify unusual revenue spikes or dips."""
    if df is None or df.empty:
        return pd.DataFrame(columns=["Date", "Actual_Sales", "Expected_Sales", "Deviation", "Severity"])

    if period == "daily":
        grouped = df.groupby("Order_Date", as_index=False).agg(Actual_Sales=("Net_Sales", "sum"))
        grouped = grouped.rename(columns={"Order_Date": "Date"})
    else:
        grouped = df.groupby(["Year", "Month"], as_index=False).agg(Actual_Sales=("Net_Sales", "sum"))
        grouped["Date"] = grouped["Year"].astype(str) + "-" + grouped["Month"].astype(str)

    if len(grouped) < 3:
        grouped["Expected_Sales"] = grouped["Actual_Sales"]
        grouped["Deviation"] = 0.0
        grouped["Severity"] = "Normal"
        return grouped[["Date", "Actual_Sales", "Expected_Sales", "Deviation", "Severity"]]

    mean_value = grouped["Actual_Sales"].mean()
    std_value = grouped["Actual_Sales"].std(ddof=0)
    std_value = std_value if std_value != 0 else 1.0
    grouped["Expected_Sales"] = mean_value
    grouped["Deviation"] = grouped["Actual_Sales"] - grouped["Expected_Sales"]
    grouped["Z_Score"] = (grouped["Actual_Sales"] - mean_value) / std_value
    grouped["Severity"] = np.where(np.abs(grouped["Z_Score"]) >= 2.5, "Critical", np.where(np.abs(grouped["Z_Score"]) >= 1.5, "Warning", "Normal"))
    return grouped[["Date", "Actual_Sales", "Expected_Sales", "Deviation", "Severity"]]
