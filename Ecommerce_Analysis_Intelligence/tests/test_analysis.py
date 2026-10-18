import pandas as pd

from src.customer_analysis import segment_customers
from src.product_analysis import classify_products
from src.intelligence_engine import generate_business_insights


def test_segment_customers():
    df = pd.DataFrame(
        {
            "Customer_ID": ["C1", "C2", "C3"],
            "Revenue": [1200, 500, 100],
            "Orders": [10, 3, 1],
        }
    )

    segments = segment_customers(df, revenue_threshold=500, order_threshold=5)
    assert set(segments["Segment"].unique()) == {"High Value", "Medium Value", "Low Value"}


def test_classify_products():
    df = pd.DataFrame(
        {
            "Product_ID": ["P1", "P2", "P3", "P4"],
            "Product_Name": ["Laptop", "Yoga Mat", "Notebook", "Bluetooth Speaker"],
            "Category": ["Electronics", "Sports", "Books", "Electronics"],
            "Revenue": [9000, 700, 200, 1500],
            "Quantity": [60, 50, 10, 20],
            "Rating": [4.8, 3.9, 2.5, 4.2],
        }
    )

    classified = classify_products(df, revenue_threshold=1000, quantity_threshold=30, rating_threshold=4.5)
    assert set(classified["Category"].unique()) == {"Star Product", "Volume Product", "Premium Product", "Needs Attention"}


def test_generate_business_insights_returns_list():
    df = pd.DataFrame(
        [
            {"Month_Name": "Jan", "Revenue": 1000, "Category": "Electronics", "City": "Bengaluru", "Payment_Mode": "UPI"},
            {"Month_Name": "Feb", "Revenue": 2000, "Category": "Fashion", "City": "Delhi", "Payment_Mode": "Card"},
        ]
    )

    insights = generate_business_insights(df)
    assert isinstance(insights, list)
    assert len(insights) >= 1
