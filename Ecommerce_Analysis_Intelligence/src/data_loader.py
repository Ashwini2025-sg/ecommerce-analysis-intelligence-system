"""Utilities for generating and loading the sample e-commerce dataset."""

from __future__ import annotations

from pathlib import Path
from typing import Iterable

import numpy as np
import pandas as pd

ROOT_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT_DIR / "data"
CSV_PATH = DATA_DIR / "ecommerce_data.csv"

CITY_TO_STATE = {
    "Bengaluru": "Karnataka",
    "Mumbai": "Maharashtra",
    "Delhi": "Delhi",
    "Hyderabad": "Telangana",
    "Chennai": "Tamil Nadu",
    "Kolkata": "West Bengal",
    "Pune": "Maharashtra",
    "Ahmedabad": "Gujarat",
    "Jaipur": "Rajasthan",
    "Lucknow": "Uttar Pradesh",
    "Patna": "Bihar",
}

PRODUCT_CATALOG = {
    "Electronics": [
        ("Noise Buds Pro", 4999),
        ("Smart Watch X", 8999),
        ("Laptop Pro 14", 62499),
        ("4K Monitor", 24999),
        ("USB-C Hub", 2499),
        ("Wireless Mouse", 1499),
    ],
    "Fashion": [
        ("Cotton T-Shirt", 799),
        ("Denim Jacket", 2599),
        ("Running Shoes", 1899),
        ("Leather Sling Bag", 3499),
        ("Formal Shirt", 1499),
        ("Ladies Kurta", 1999),
    ],
    "Home & Kitchen": [
        ("Air Fryer", 6999),
        ("Bamboo Storage Box", 1299),
        ("Blender Premium", 3999),
        ("Rice Cooker", 2999),
        ("Dining Set", 6599),
        ("Vacuum Flask", 1299),
    ],
    "Beauty": [
        ("Skin Serum", 1599),
        ("Face Cream", 899),
        ("Hair Dryer", 2499),
        ("Makeup Kit", 2199),
        ("Lipstick Set", 1199),
        ("Sunscreen SPF 50", 999),
    ],
    "Sports": [
        ("Yoga Mat", 1299),
        ("Dumbbell Set", 3999),
        ("Cycling Helmet", 2599),
        ("Treadmill", 31999),
        ("Fitness Band", 2999),
        ("Cricket Kit", 5899),
    ],
    "Books": [
        ("Python for Beginners", 699),
        ("Startup Playbook", 799),
        ("Business Strategy", 999),
        ("Data Science Essentials", 1099),
        ("Motivational Leadership", 899),
        ("Young Investor Guide", 699),
    ],
}

PAYMENT_MODES = [
    "UPI",
    "Credit Card",
    "Debit Card",
    "Cash on Delivery",
    "Net Banking",
]

CUSTOMER_NAMES = [
    "Asha", "Rahul", "Neha", "Vikram", "Priya", "Manish", "Ananya", "Sanjay",
    "Kavya", "Siddharth", "Meera", "Rohan", "Ishita", "Nitin", "Pooja", "Arjun",
    "Divya", "Yash", "Tanvi", "Harsh", "Deepa", "Saurabh", "Ritika", "Puneet", "Shreya"
]


def _flatten_catalog() -> list[tuple[str, str, float, str]]:
    catalog: list[tuple[str, str, float, str]] = []
    for category, items in PRODUCT_CATALOG.items():
        for item_name, price in items:
            catalog.append((item_name, category, float(price), item_name.lower().replace(" ", "-")[:10]))
    return catalog


def generate_sample_data(file_path: str | Path = CSV_PATH, rows: int = 1500) -> pd.DataFrame:
    """Generate a realistic sample e-commerce dataset and save it as CSV."""
    path = Path(file_path)
    path.parent.mkdir(parents=True, exist_ok=True)

    rng = np.random.default_rng(42)
    catalogue = _flatten_catalog()
    cities = list(CITY_TO_STATE.keys())
    customer_ids = [f"CUST-{idx:04d}" for idx in range(1, 451)]
    name_map = {customer_id: CUSTOMER_NAMES[(idx - 1) % len(CUSTOMER_NAMES)] for idx, customer_id in enumerate(customer_ids, start=1)}

    records: list[dict[str, object]] = []
    for order_index in range(1, rows + 1):
        customer_id = customer_ids[(order_index - 1) % len(customer_ids)]
        customer_name = name_map[customer_id]
        city = cities[(order_index * 7) % len(cities)]
        state = CITY_TO_STATE[city]
        product_name, category, base_price, _ = catalogue[(order_index * 5) % len(catalogue)]
        quantity = int(rng.integers(1, 6))
        unit_price = round(float(base_price * (0.9 + rng.random() * 0.5)), 2)
        discount = round(float(rng.integers(0, max(1, int(unit_price * 0.2)) + 1)), 2)
        rating = round(float(np.clip(rng.normal(4.2, 0.7), 2.5, 5.0)), 1)
        day_offset = int(rng.integers(0, 730))
        order_date = pd.Timestamp("2024-01-01") + pd.Timedelta(days=day_offset)
        payment_mode = PAYMENT_MODES[(order_index * 2) % len(PAYMENT_MODES)]
        customer_type = "Returning" if order_index % 5 == 0 else "New"

        record = {
            "Order_ID": f"ORD-{order_index:05d}",
            "Order_Date": order_date.strftime("%Y-%m-%d"),
            "Customer_ID": customer_id,
            "Customer_Name": customer_name,
            "Product_ID": f"PROD-{(order_index * 13) % 999 + 1:04d}",
            "Product_Name": product_name,
            "Category": category,
            "Quantity": quantity,
            "Unit_Price": unit_price,
            "Discount": discount,
            "City": city,
            "State": state,
            "Payment_Mode": payment_mode,
            "Customer_Type": customer_type,
            "Rating": rating,
        }
        records.append(record)

    df = pd.DataFrame(records)
    df.to_csv(path, index=False)
    return df


def ensure_dataset_exists(file_path: str | Path = CSV_PATH) -> Path:
    """Create the CSV if it does not already exist."""
    target = Path(file_path)
    if not target.exists():
        generate_sample_data(target)
    return target


def load_ecommerce_data(file_path: str | Path | None = None) -> pd.DataFrame:
    """Load the dataset from disk and return a DataFrame."""
    target = Path(file_path) if file_path else CSV_PATH
    ensure_dataset_exists(target)
    return pd.read_csv(target)


def validate_required_columns(df: pd.DataFrame, required_columns: Iterable[str] | None = None) -> list[str]:
    """Return any missing required columns."""
    columns = list(required_columns) if required_columns else [
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
    return [column for column in columns if column not in df.columns]
