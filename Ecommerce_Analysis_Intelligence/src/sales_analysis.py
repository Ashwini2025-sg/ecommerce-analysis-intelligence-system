"""Sales aggregation and performance analysis."""

from __future__ import annotations

import pandas as pd


def daily_sales(df: pd.DataFrame) -> pd.DataFrame:
    if df is None or df.empty:
        return pd.DataFrame(columns=["Order_Date", "Revenue", "Orders"])
    return (
        df.groupby("Order_Date", as_index=False)
        .agg(Revenue=("Net_Sales", "sum"), Orders=("Order_ID", "nunique"))
        .sort_values("Order_Date")
        .reset_index(drop=True)
    )


def monthly_sales(df: pd.DataFrame) -> pd.DataFrame:
    if df is None or df.empty:
        return pd.DataFrame(columns=["Year", "Month", "Month_Name", "Revenue", "Orders"])
    grouped = (
        df.groupby(["Year", "Month", "Month_Name"], as_index=False)
        .agg(Revenue=("Net_Sales", "sum"), Orders=("Order_ID", "nunique"))
        .sort_values(["Year", "Month"])
        .reset_index(drop=True)
    )
    return grouped


def quarterly_sales(df: pd.DataFrame) -> pd.DataFrame:
    if df is None or df.empty:
        return pd.DataFrame(columns=["Year", "Quarter", "Revenue", "Orders"])
    return (
        df.groupby(["Year", "Quarter"], as_index=False)
        .agg(Revenue=("Net_Sales", "sum"), Orders=("Order_ID", "nunique"))
        .sort_values(["Year", "Quarter"])
        .reset_index(drop=True)
    )


def yearly_sales(df: pd.DataFrame) -> pd.DataFrame:
    if df is None or df.empty:
        return pd.DataFrame(columns=["Year", "Revenue", "Orders"])
    return (
        df.groupby("Year", as_index=False)
        .agg(Revenue=("Net_Sales", "sum"), Orders=("Order_ID", "nunique"))
        .sort_values("Year")
        .reset_index(drop=True)
    )


def sales_by_category(df: pd.DataFrame) -> pd.DataFrame:
    if df is None or df.empty:
        return pd.DataFrame(columns=["Category", "Revenue", "Orders"]) 
    return (
        df.groupby("Category", as_index=False)
        .agg(Revenue=("Net_Sales", "sum"), Orders=("Order_ID", "nunique"))
        .sort_values("Revenue", ascending=False)
        .reset_index(drop=True)
    )


def sales_by_city(df: pd.DataFrame) -> pd.DataFrame:
    if df is None or df.empty:
        return pd.DataFrame(columns=["City", "Revenue", "Orders"])
    return (
        df.groupby("City", as_index=False)
        .agg(Revenue=("Net_Sales", "sum"), Orders=("Order_ID", "nunique"))
        .sort_values("Revenue", ascending=False)
        .reset_index(drop=True)
    )


def sales_by_state(df: pd.DataFrame) -> pd.DataFrame:
    if df is None or df.empty:
        return pd.DataFrame(columns=["State", "Revenue", "Orders"])
    return (
        df.groupby("State", as_index=False)
        .agg(Revenue=("Net_Sales", "sum"), Orders=("Order_ID", "nunique"))
        .sort_values("Revenue", ascending=False)
        .reset_index(drop=True)
    )


def sales_by_payment_mode(df: pd.DataFrame) -> pd.DataFrame:
    if df is None or df.empty:
        return pd.DataFrame(columns=["Payment_Mode", "Revenue", "Orders"]) 
    return (
        df.groupby("Payment_Mode", as_index=False)
        .agg(Revenue=("Net_Sales", "sum"), Orders=("Order_ID", "nunique"))
        .sort_values("Revenue", ascending=False)
        .reset_index(drop=True)
    )


def identify_best_and_worst(df: pd.DataFrame) -> dict[str, str | float | int]:
    monthly = monthly_sales(df)
    category = sales_by_category(df)
    city = sales_by_city(df)
    best_month = monthly.loc[monthly["Revenue"].idxmax()] if not monthly.empty else None
    worst_month = monthly.loc[monthly["Revenue"].idxmin()] if not monthly.empty else None
    best_category = category.loc[category["Revenue"].idxmax()] if not category.empty else None
    lowest_category = category.loc[category["Revenue"].idxmin()] if not category.empty else None
    best_city = city.loc[city["Revenue"].idxmax()] if not city.empty else None

    return {
        "Best Month": best_month["Month_Name"] if best_month is not None else "N/A",
        "Worst Month": worst_month["Month_Name"] if worst_month is not None else "N/A",
        "Best Category": best_category["Category"] if best_category is not None else "N/A",
        "Lowest Category": lowest_category["Category"] if lowest_category is not None else "N/A",
        "Best City": best_city["City"] if best_city is not None else "N/A",
        "Highest Revenue Period": best_month["Month_Name"] if best_month is not None else "N/A",
    }
