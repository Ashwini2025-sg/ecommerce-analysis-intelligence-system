import pandas as pd

from src.kpi_engine import calculate_kpis


def test_calculate_kpis_for_sample_data():
    df = pd.DataFrame(
        [
            {
                "Order_ID": "A-1",
                "Customer_ID": "C-1",
                "Sales": 1000,
                "Net_Sales": 950,
                "Quantity": 2,
                "Discount": 50,
                "Rating": 4.8,
            },
            {
                "Order_ID": "A-2",
                "Customer_ID": "C-1",
                "Sales": 500,
                "Net_Sales": 480,
                "Quantity": 1,
                "Discount": 20,
                "Rating": 4.5,
            },
            {
                "Order_ID": "A-3",
                "Customer_ID": "C-2",
                "Sales": 300,
                "Net_Sales": 290,
                "Quantity": 1,
                "Discount": 10,
                "Rating": 3.8,
            },
        ]
    )

    result = calculate_kpis(df)

    assert result["Total Revenue"] == 1800
    assert result["Total Orders"] == 3
    assert result["Total Customers"] == 2
    assert result["Average Order Value"] == 600
    assert result["Average Discount"] == 26.666666666666668
