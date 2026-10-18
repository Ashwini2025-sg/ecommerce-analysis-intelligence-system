"""SQLite database utilities for the e-commerce analytics system."""

from __future__ import annotations

import sqlite3
from pathlib import Path
from typing import Any, Iterable

import pandas as pd

DATABASE_DIR = Path(__file__).resolve().parent.parent / "database"
DEFAULT_DB_PATH = DATABASE_DIR / "ecommerce.db"


def create_database(db_path: str | Path = DEFAULT_DB_PATH) -> Path:
    """Create the SQLite database and required tables if they do not exist."""
    path = Path(db_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(path)
    cursor = connection.cursor()

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS customers (
            customer_id TEXT PRIMARY KEY,
            customer_name TEXT,
            city TEXT,
            state TEXT,
            customer_type TEXT
        )
        """
    )
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS products (
            product_id TEXT PRIMARY KEY,
            product_name TEXT,
            category TEXT,
            unit_price REAL,
            rating REAL
        )
        """
    )
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS orders (
            order_id TEXT PRIMARY KEY,
            order_date TEXT,
            customer_id TEXT,
            payment_mode TEXT,
            net_sales REAL,
            FOREIGN KEY(customer_id) REFERENCES customers(customer_id)
        )
        """
    )
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS order_items (
            order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id TEXT,
            product_id TEXT,
            quantity INTEGER,
            unit_price REAL,
            discount REAL,
            FOREIGN KEY(order_id) REFERENCES orders(order_id),
            FOREIGN KEY(product_id) REFERENCES products(product_id)
        )
        """
    )

    connection.commit()
    connection.close()
    return path


def insert_dataframe(df: pd.DataFrame, table_name: str, db_path: str | Path = DEFAULT_DB_PATH) -> None:
    """Insert a DataFrame into a SQLite table, replacing invalid values with None."""
    if df.empty:
        return
    connection = sqlite3.connect(db_path)
    df.to_sql(table_name, connection, if_exists="append", index=False)
    connection.commit()
    connection.close()


def read_table(table_name: str, db_path: str | Path = DEFAULT_DB_PATH) -> pd.DataFrame:
    """Read a full SQLite table into a DataFrame."""
    connection = sqlite3.connect(db_path)
    query = f"SELECT * FROM {table_name}"
    result = pd.read_sql_query(query, connection)
    connection.close()
    return result


def run_sql_query(query: str, params: Iterable[Any] = (), db_path: str | Path = DEFAULT_DB_PATH) -> pd.DataFrame:
    """Run a parameterized SQL query and return the result as a DataFrame."""
    connection = sqlite3.connect(db_path)
    result = pd.read_sql_query(query, connection, params=tuple(params))
    connection.close()
    return result


def seed_database_from_dataframe(df: pd.DataFrame, db_path: str | Path = DEFAULT_DB_PATH) -> None:
    """Populate the database tables from a cleaned e-commerce DataFrame."""
    if df is None or df.empty:
        return
    create_database(db_path)

    customers = (
        df[["Customer_ID", "Customer_Name", "City", "State", "Customer_Type"]]
        .drop_duplicates(subset=["Customer_ID"])
        .rename(columns={"Customer_ID": "customer_id", "Customer_Name": "customer_name", "City": "city", "State": "state", "Customer_Type": "customer_type"})
    )
    products = (
        df[["Product_ID", "Product_Name", "Category", "Unit_Price", "Rating"]]
        .drop_duplicates(subset=["Product_ID"])
        .rename(columns={"Product_ID": "product_id", "Product_Name": "product_name", "Category": "category", "Unit_Price": "unit_price", "Rating": "rating"})
    )
    orders = (
        df[["Order_ID", "Order_Date", "Customer_ID", "Payment_Mode", "Net_Sales"]]
        .drop_duplicates(subset=["Order_ID"])
        .rename(columns={"Order_ID": "order_id", "Order_Date": "order_date", "Customer_ID": "customer_id", "Payment_Mode": "payment_mode", "Net_Sales": "net_sales"})
    )
    order_items = (
        df[["Order_ID", "Product_ID", "Quantity", "Unit_Price", "Discount"]]
        .rename(columns={"Order_ID": "order_id", "Product_ID": "product_id", "Quantity": "quantity", "Unit_Price": "unit_price", "Discount": "discount"})
    )

    insert_dataframe(customers, "customers", db_path)
    insert_dataframe(products, "products", db_path)
    insert_dataframe(orders, "orders", db_path)
    insert_dataframe(order_items, "order_items", db_path)
