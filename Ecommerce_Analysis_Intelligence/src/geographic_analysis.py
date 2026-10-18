"""City and state analysis for geographic sales performance."""

from __future__ import annotations

import pandas as pd


def revenue_by_city(df: pd.DataFrame) -> pd.DataFrame:
    if df is None or df.empty:
        return pd.DataFrame(columns=["City", "Revenue", "Orders", "Customers"])
    result = (
        df.groupby("City", as_index=False)
        .agg(Revenue=("Net_Sales", "sum"), Orders=("Order_ID", "nunique"), Customers=("Customer_ID", "nunique"))
        .sort_values("Revenue", ascending=False)
        .reset_index(drop=True)
    )
    return result


def revenue_by_state(df: pd.DataFrame) -> pd.DataFrame:
    if df is None or df.empty:
        return pd.DataFrame(columns=["State", "Revenue", "Orders", "Customers"])
    result = (
        df.groupby("State", as_index=False)
        .agg(Revenue=("Net_Sales", "sum"), Orders=("Order_ID", "nunique"), Customers=("Customer_ID", "nunique"))
        .sort_values("Revenue", ascending=False)
        .reset_index(drop=True)
    )
    return result


def top_locations(df: pd.DataFrame, limit: int = 5) -> dict[str, list[str | float | int]]:
    city_summary = revenue_by_city(df)
    state_summary = revenue_by_state(df)
    return {
        "Top Cities": city_summary.head(limit).to_dict(orient="records"),
        "Top States": state_summary.head(limit).to_dict(orient="records"),
    }
