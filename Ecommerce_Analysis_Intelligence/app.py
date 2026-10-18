"""Streamlit dashboard for the E-commerce Analysis Intelligence System."""

from __future__ import annotations

import io
from pathlib import Path

import pandas as pd
import plotly.express as px
import streamlit as st

from src.data_cleaning import clean_ecommerce_data
from src.data_loader import load_ecommerce_data, validate_required_columns
from src.database import DEFAULT_DB_PATH, seed_database_from_dataframe
from src.geographic_analysis import revenue_by_city, revenue_by_state
from src.intelligence_engine import detect_anomalies, explain_sales_change, generate_business_insights
from src.kpi_engine import calculate_kpis
from src.product_analysis import classify_products, top_products
from src.recommendation_engine import generate_recommendations
from src.sales_analysis import sales_by_category, sales_by_city, sales_by_payment_mode, monthly_sales
from src.customer_analysis import segment_customers

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


@st.cache_data
def get_default_dataframe() -> pd.DataFrame:
    """Load the default sample dataset."""
    dataframe = load_ecommerce_data()
    cleaned, _ = clean_ecommerce_data(dataframe)
    return cleaned


def apply_filters(df: pd.DataFrame) -> pd.DataFrame:
    """Apply the sidebar filters to the DataFrame."""
    if df.empty:
        return df

    minimum_date = pd.to_datetime(df["Order_Date"]).min().date()
    maximum_date = pd.to_datetime(df["Order_Date"]).max().date()
    start_date, end_date = st.sidebar.date_input("Date range", value=(minimum_date, maximum_date))

    filtered = df.copy()
    filtered["Order_Date"] = pd.to_datetime(filtered["Order_Date"])
    filtered = filtered[(filtered["Order_Date"].dt.date >= start_date) & (filtered["Order_Date"].dt.date <= end_date)]

    if "Category" in filtered.columns:
        category = st.sidebar.selectbox("Category", ["All"] + sorted(filtered["Category"].dropna().unique().tolist()))
        if category != "All":
            filtered = filtered[filtered["Category"] == category]

    if "State" in filtered.columns:
        state = st.sidebar.selectbox("State", ["All"] + sorted(filtered["State"].dropna().unique().tolist()))
        if state != "All":
            filtered = filtered[filtered["State"] == state]

    if "City" in filtered.columns:
        city = st.sidebar.selectbox("City", ["All"] + sorted(filtered["City"].dropna().unique().tolist()))
        if city != "All":
            filtered = filtered[filtered["City"] == city]

    if "Payment_Mode" in filtered.columns:
        payment_mode = st.sidebar.selectbox("Payment Mode", ["All"] + sorted(filtered["Payment_Mode"].dropna().unique().tolist()))
        if payment_mode != "All":
            filtered = filtered[filtered["Payment_Mode"] == payment_mode]

    if "Customer_Type" in filtered.columns:
        customer_type = st.sidebar.selectbox("Customer Type", ["All"] + sorted(filtered["Customer_Type"].dropna().unique().tolist()))
        if customer_type != "All":
            filtered = filtered[filtered["Customer_Type"] == customer_type]

    return filtered.reset_index(drop=True)


def build_previous_period(df: pd.DataFrame) -> pd.DataFrame:
    """Return an approximate previous-period comparison window."""
    if df.empty:
        return df.copy()
    ordered = df.copy()
    ordered["Order_Date"] = pd.to_datetime(ordered["Order_Date"])
    if ordered["Order_Date"].min() is pd.NaT:
        return ordered.iloc[0:0].copy()
    start = ordered["Order_Date"].min() - pd.DateOffset(months=1)
    end = ordered["Order_Date"].max() - pd.DateOffset(months=1)
    previous = ordered[(ordered["Order_Date"] >= start) & (ordered["Order_Date"] <= end)].copy()
    return previous.reset_index(drop=True)


def render_export_buttons(cleaned_df: pd.DataFrame, kpis: dict, insights: list[str], recommendation_list: list[str]) -> None:
    """Render download buttons for the data and reports."""
    csv_buffer = io.StringIO()
    cleaned_df.to_csv(csv_buffer, index=False)
    st.download_button("Download cleaned data", csv_buffer.getvalue(), file_name="cleaned_ecommerce_data.csv", mime="text/csv")

    kpi_buffer = io.StringIO()
    pd.DataFrame([kpis]).to_csv(kpi_buffer, index=False)
    st.download_button("Download KPI summary", kpi_buffer.getvalue(), file_name="ecommerce_kpis.csv", mime="text/csv")

    insights_buffer = io.StringIO()
    insights_buffer.write("\n".join(insights))
    st.download_button("Download business insights", insights_buffer.getvalue(), file_name="business_insights.txt", mime="text/plain")

    recommendations_buffer = io.StringIO()
    recommendations_buffer.write("\n".join(recommendation_list))
    st.download_button("Download recommendations", recommendations_buffer.getvalue(), file_name="recommendations.txt", mime="text/plain")


def main() -> None:
    """Display the Streamlit application."""
    st.set_page_config(page_title="E-commerce Analysis Intelligence System", layout="wide")
    st.title("E-commerce Analysis Intelligence System")
    st.caption("An explainable e-commerce decision-support system for sales, customers, products, and business intelligence.")

    uploaded_file = st.sidebar.file_uploader("Upload CSV or XLSX", type=["csv", "xlsx"])
    if uploaded_file is not None:
        try:
            extension = Path(uploaded_file.name).suffix.lower()
            if extension == ".csv":
                uploaded_df = pd.read_csv(uploaded_file)
            else:
                uploaded_df = pd.read_excel(uploaded_file)

            missing_columns = validate_required_columns(uploaded_df, REQUIRED_COLUMNS)
            if missing_columns:
                st.error(f"Missing required columns: {missing_columns}")
                st.stop()

            cleaned_df, report = clean_ecommerce_data(uploaded_df)
            st.session_state["dataset"] = cleaned_df
            st.success("Data uploaded and cleaned successfully.")
            st.write(f"Rows loaded: {len(cleaned_df)} | Quality score: {report.get('data_quality_score', 0)}")
        except Exception as exc:  # pragma: no cover - UI safety net
            st.error(f"Unable to process uploaded file: {exc}")
            st.stop()

    dataset = st.session_state.get("dataset", get_default_dataframe())
    filtered_df = apply_filters(dataset)
    previous_df = build_previous_period(filtered_df)

    if filtered_df.empty:
        st.warning("No rows match the current filters. Please adjust the filter selections.")
        return

    kpis = calculate_kpis(filtered_df, previous_df)
    insights = generate_business_insights(filtered_df)
    recommendations = generate_recommendations(filtered_df, previous_df)

    st.subheader("Executive Overview")
    metric_cols = st.columns(5)
    metric_cols[0].metric("Total Revenue", f"₹{kpis['Total Revenue']:,.2f}")
    metric_cols[1].metric("Total Orders", f"{kpis['Total Orders']}")
    metric_cols[2].metric("Total Customers", f"{kpis['Total Customers']}")
    metric_cols[3].metric("Average Order Value", f"₹{kpis['Average Order Value']:,.2f}")
    metric_cols[4].metric("Revenue Growth", f"{kpis['Revenue Growth Rate']:.2f}%")

    st.markdown("---")
    st.subheader("Key Business Insights")
    insights_cols = st.columns(2)
    for i, insight in enumerate(insights[:6]):
        with insights_cols[i % 2]:
            st.info(insight)

    st.markdown("---")
    sales_tab, product_tab, customer_tab, geo_tab, payment_tab = st.tabs([
        "Sales Intelligence",
        "Product Intelligence",
        "Customer Intelligence",
        "Geographic Analysis",
        "Payment Analysis",
    ])

    with sales_tab:
        monthly = monthly_sales(filtered_df)
        if not monthly.empty:
            fig_month = px.line(monthly, x="Month_Name", y="Revenue", markers=True, title="Monthly Revenue Trend")
            st.plotly_chart(fig_month, use_container_width=True)

        category_data = sales_by_category(filtered_df)
        if not category_data.empty:
            fig_category = px.bar(category_data, x="Category", y="Revenue", title="Revenue by Category")
            st.plotly_chart(fig_category, use_container_width=True)

    with product_tab:
        top_product_df = top_products(filtered_df, by="Revenue", limit=10)
        if not top_product_df.empty:
            fig_products = px.bar(top_product_df, x="Revenue", y="Product_Name", orientation="h", title="Top Products by Revenue")
            st.plotly_chart(fig_products, use_container_width=True)

        classified = classify_products(filtered_df)
        if not classified.empty:
            class_counts = classified["Category"].value_counts().reset_index()
            class_counts.columns = ["Category", "Count"]
            fig_class = px.bar(class_counts, x="Category", y="Count", title="Product Performance Matrix")
            st.plotly_chart(fig_class, use_container_width=True)

    with customer_tab:
        customer_segments = segment_customers(filtered_df)
        if not customer_segments.empty:
            segment_counts = customer_segments["Segment"].value_counts().reset_index()
            segment_counts.columns = ["Segment", "Count"]
            fig_segments = px.pie(segment_counts, values="Count", names="Segment", title="Customer Segmentation")
            st.plotly_chart(fig_segments, use_container_width=True)

    with geo_tab:
        city_summary = revenue_by_city(filtered_df)
        if not city_summary.empty:
            fig_city = px.bar(city_summary.head(10), x="City", y="Revenue", title="Revenue by City")
            st.plotly_chart(fig_city, use_container_width=True)

        state_summary = revenue_by_state(filtered_df)
        if not state_summary.empty:
            fig_state = px.bar(state_summary.head(10), x="State", y="Revenue", title="Revenue by State")
            st.plotly_chart(fig_state, use_container_width=True)

    with payment_tab:
        payment_summary = sales_by_payment_mode(filtered_df)
        if not payment_summary.empty:
            fig_payment = px.pie(payment_summary, values="Revenue", names="Payment_Mode", title="Revenue Share by Payment Method")
            st.plotly_chart(fig_payment, use_container_width=True)

    st.markdown("---")
    st.subheader("Data Quality")
    if "data_quality_score" in dataset.columns:
        dataset_quality = dataset.copy()
    else:
        dataset_quality = dataset
    quality_report = clean_ecommerce_data(dataset)[1]
    quality_cols = st.columns(6)
    quality_cols[0].metric("Rows", len(dataset_quality))
    quality_cols[1].metric("Columns", dataset_quality.shape[1])
    quality_cols[2].metric("Missing Values", int(dataset_quality.isna().sum().sum()))
    quality_cols[3].metric("Duplicate Records", int(dataset_quality.duplicated().sum()))
    quality_cols[4].metric("Invalid Values", int((dataset_quality.isna().sum().sum() + dataset_quality.duplicated().sum())))
    quality_cols[5].metric("Quality Score", f"{quality_report.get('data_quality_score', 0):.2f}/100")

    anomaly_df = detect_anomalies(filtered_df)
    if not anomaly_df.empty:
        st.subheader("Anomaly Detection")
        st.dataframe(anomaly_df, use_container_width=True)

    st.subheader("Why Did Sales Change?")
    st.write(explain_sales_change(filtered_df, previous_df))

    st.subheader("Recommended Actions")
    for index, recommendation in enumerate(recommendations[:5], start=1):
        st.markdown(f"{index}. {recommendation}")

    st.markdown("---")
    st.subheader("Export")
    render_export_buttons(filtered_df, kpis, insights, recommendations)

    try:
        seed_database_from_dataframe(filtered_df, DEFAULT_DB_PATH)
    except Exception as exc:  # pragma: no cover - UI safety net
        st.warning(f"Database sync skipped: {exc}")


if __name__ == "__main__":
    main()
