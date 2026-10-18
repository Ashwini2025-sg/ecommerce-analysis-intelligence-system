import pandas as pd

from src.data_cleaning import clean_ecommerce_data


def test_clean_ecommerce_data_adds_derived_fields():
    df = pd.DataFrame(
        [
            {
                "Order_ID": "A-1001",
                "Order_Date": "2024-01-10",
                "Customer_ID": "C-1",
                "Customer_Name": "Asha",
                "Product_ID": "P-1",
                "Product_Name": "Laptop",
                "Category": "Electronics",
                "Quantity": 2,
                "Unit_Price": 35000,
                "Discount": 500,
                "City": "Bengaluru",
                "State": "Karnataka",
                "Payment_Mode": "UPI",
                "Customer_Type": "Returning",
                "Rating": 4.8,
            },
            {
                "Order_ID": "A-1001",
                "Order_Date": "2024-01-10",
                "Customer_ID": "C-1",
                "Customer_Name": "Asha",
                "Product_ID": "P-1",
                "Product_Name": "Laptop",
                "Category": "Electronics",
                "Quantity": 2,
                "Unit_Price": 35000,
                "Discount": 500,
                "City": "Bengaluru",
                "State": "Karnataka",
                "Payment_Mode": "UPI",
                "Customer_Type": "Returning",
                "Rating": 4.8,
            },
            {
                "Order_ID": "A-1002",
                "Order_Date": "2024-02-15",
                "Customer_ID": "C-2",
                "Customer_Name": "Rahul",
                "Product_ID": "P-2",
                "Product_Name": "Headphones",
                "Category": "Electronics",
                "Quantity": -1,
                "Unit_Price": 2000,
                "Discount": 0,
                "City": "Delhi",
                "State": "Delhi",
                "Payment_Mode": "Card",
                "Customer_Type": "New",
                "Rating": 3.5,
            },
        ]
    )

    cleaned, report = clean_ecommerce_data(df)

    assert "Sales" in cleaned.columns
    assert "Net_Sales" in cleaned.columns
    assert "Year" in cleaned.columns
    assert "Month" in cleaned.columns
    assert "Month_Name" in cleaned.columns
    assert "Quarter" in cleaned.columns
    assert report["duplicate_rows"] == 1
    assert cleaned["Quantity"].ge(0).all()
    assert cleaned["Category"].notna().all()
