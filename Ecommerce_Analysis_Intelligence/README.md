# E-commerce Analysis Intelligence System

## Project Overview

The E-commerce Analysis Intelligence System is an explainable business intelligence application designed to help students and analysts understand sales performance, customer value, product quality, and operational risk in a simple but professional way. The system uses a real business-style workflow: dataset loading, data cleaning, KPI calculation, segmentation, dashboard reporting, anomaly detection, and recommendation generation.

## Problem Statement

Most businesses do not need only charts; they need meaningful explanations. Traditional dashboards often show metrics but do not tell why performance changed or what should be done next. This project addresses that gap by combining analytics with a lightweight intelligence layer that explains results and proposes business actions.

## Objectives

- Load and validate e-commerce transaction data
- Clean and structure raw records for analysis
- Measure sales and customer KPIs
- Identify top-performing products and categories
- Segment customers by value
- Highlight geographical opportunities
- Detect unusual sales patterns
- Explain why performance changed
- Recommend actions based on evidence
- Display everything as a professional Streamlit dashboard

## Unique Features

1. Automatic business insight generation
2. Why-Did-Sales-Change explanation engine
3. Product performance matrix
4. Customer value segmentation
5. Explainable anomaly detection
6. Business recommendations based on actual metrics
7. Data quality scoring
8. CSV/XLSX upload support

## Technology Stack

- Python 3.11+
- Pandas
- NumPy
- Plotly
- Streamlit
- SQLite
- SQL
- Scikit-learn
- OpenPyXL
- Pytest

## System Architecture

The project is modularized into a clean pipeline:

1. Data generation and loading
2. Data validation and cleaning
3. KPI calculation
4. Sales and customer analysis
5. Product and geography analysis
6. Intelligence engine and recommendation generation
7. SQLite data storage
8. Streamlit dashboard presentation

## Folder Structure

```text
Ecommerce_Analysis_Intelligence/
├── app.py
├── requirements.txt
├── README.md
├── data/
│   └── ecommerce_data.csv
├── database/
│   └── ecommerce.db
├── src/
│   ├── __init__.py
│   ├── data_loader.py
│   ├── data_cleaning.py
│   ├── kpi_engine.py
│   ├── sales_analysis.py
│   ├── customer_analysis.py
│   ├── product_analysis.py
│   ├── geographic_analysis.py
│   ├── intelligence_engine.py
│   ├── recommendation_engine.py
│   └── database.py
├── tests/
│   ├── test_cleaning.py
│   ├── test_kpis.py
│   └── test_analysis.py
└── venv/
```

## Installation

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

## How to Run

```bash
streamlit run app.py
```

## Sample Screenshots

Placeholders for final presentation screenshots:

- Executive dashboard overview
- Sales trend analysis
- Product performance matrix
- Customer segmentation chart
- Geographic analysis section
- Anomaly detection panel

## KPI Formulas

- Sales = Quantity × Unit_Price
- Net Sales = Sales - Discount
- Average Order Value = Total Revenue / Total Orders
- Repeat Customer Rate = Returning Customers / Total Customers × 100
- Revenue Growth Rate = (Current Revenue - Previous Revenue) / Previous Revenue × 100
- Order Growth Rate = (Current Orders - Previous Orders) / Previous Orders × 100

## Data Quality Score

The quality score is calculated from a simple rule-based approach based on:

- missing values
- duplicate rows
- invalid negative quantities
- invalid zero or negative prices
- invalid dates
- unknown categories

The score starts at 100 and subtracts small penalties for each type of problem found in the dataset.

## Dashboard Features

- Executive Overview
- Sales Intelligence
- Product Intelligence
- Customer Intelligence
- Geographic Analysis
- Payment Analysis
- Anomaly Detection
- Why Did Sales Change?
- Business Recommendations
- CSV/XLSX upload support
- Data export buttons

## Future Enhancements

- forecast sales with time-series models
- sentiment-based product review analytics
- customer churn prediction
- live database integration with a cloud service
- smarter recommendation engine using ML
- deployment to Streamlit Cloud or Heroku

## License

This project is intended for educational and mini-project use only.
