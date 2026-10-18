# ============================================================
# SQLite Database Manager for E-Commerce Analysis Intelligence System
# ============================================================

import sqlite3
import pandas as pd

DB_PATH = "ecommerce.db"

def init_database(df):
    """
    Initialize SQLite database and store orders data into tables
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Create Orders table schema
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS orders (
        Order_ID TEXT PRIMARY KEY,
        Customer_ID INTEGER,
        Product TEXT,
        Category TEXT,
        Country TEXT,
        Gender TEXT,
        Quantity INTEGER,
        UnitPrice REAL,
        Revenue REAL,
        PurchaseDate TEXT
    )
    """)

    # Populate dataset into SQLite database
    df.to_sql("orders", conn, if_exists="replace", index=False)
    conn.commit()
    conn.close()

def query_sales_by_category():
    """
    Query total sales by product category using raw SQL
    """
    conn = sqlite3.connect(DB_PATH)
    query = """
    SELECT Category, COUNT(Order_ID) AS Total_Orders, SUM(Revenue) AS Total_Revenue
    FROM orders
    GROUP BY Category
    ORDER BY Total_Revenue DESC
    """
    result = pd.read_sql_query(query, conn)
    conn.close()
    return result

if __name__ == "__main__":
    print("Initializing SQLite Database...")
