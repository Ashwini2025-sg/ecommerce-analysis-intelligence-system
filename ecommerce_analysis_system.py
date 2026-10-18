# ============================================================
# E-COMMERCE ANALYSIS INTELLIGENCE SYSTEM
# Python Pipeline: Pandas, Scikit-Learn, Plotly, RFM & K-Means
# ============================================================

import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go

from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans

import warnings
warnings.filterwarnings("ignore")

# ============================================================
# 2. CREATE E-COMMERCE DATASET
# ============================================================
np.random.seed(42)
n_transactions = 10000

customer_ids = np.random.randint(1001, 2001, n_transactions)

products = [
    "Laptop", "Smartphone", "Headphones", "Smartwatch", "Tablet",
    "Keyboard", "Mouse", "Monitor", "Camera", "Speaker"
]

categories = {
    "Laptop": "Electronics",
    "Smartphone": "Electronics",
    "Headphones": "Accessories",
    "Smartwatch": "Wearables",
    "Tablet": "Electronics",
    "Keyboard": "Accessories",
    "Mouse": "Accessories",
    "Monitor": "Electronics",
    "Camera": "Electronics",
    "Speaker": "Audio"
}

countries = ["India", "USA", "UK", "Germany", "Canada", "Australia"]

product_data = np.random.choice(products, n_transactions)
quantity_data = np.random.randint(1, 6, n_transactions)
price_data = np.random.uniform(20, 1500, n_transactions)
date_data = pd.date_range(start="2025-01-01", end="2025-12-31", periods=n_transactions)

df = pd.DataFrame({
    "Customer_ID": customer_ids,
    "Product": product_data,
    "Category": [categories[p] for p in product_data],
    "Country": np.random.choice(countries, n_transactions),
    "Quantity": quantity_data,
    "UnitPrice": price_data,
    "PurchaseDate": date_data
})

# ============================================================
# 3. CREATE REVENUE & GENDER
# ============================================================
df["Revenue"] = df["Quantity"] * df["UnitPrice"]

customer_gender = {}
for customer in df["Customer_ID"].unique():
    customer_gender[customer] = np.random.choice(["Male", "Female"], p=[0.55, 0.45])

df["Gender"] = df["Customer_ID"].map(customer_gender)

# Clean
df = df.drop_duplicates()
df = df[(df["Quantity"] > 0) & (df["UnitPrice"] > 0)]

# Date features
df["Year"] = df["PurchaseDate"].dt.year
df["Month"] = df["PurchaseDate"].dt.month
df["MonthName"] = df["PurchaseDate"].dt.strftime("%B")
df["Day"] = df["PurchaseDate"].dt.day
df["Weekday"] = df["PurchaseDate"].dt.day_name()

# ============================================================
# BUSINESS KPIs
# ============================================================
total_revenue = df["Revenue"].sum()
total_customers = df["Customer_ID"].nunique()
total_transactions = len(df)
total_units = df["Quantity"].sum()
average_transaction_value = df["Revenue"].mean()

print("=" * 60)
print("E-COMMERCE ANALYSIS INTELLIGENCE SYSTEM KPIs")
print("=" * 60)
print(f"Total Revenue              : ${total_revenue:,.2f}")
print(f"Total Customers            : {total_customers:,}")
print(f"Total Transactions         : {total_transactions:,}")
print(f"Total Units Sold           : {total_units:,}")
print(f"Average Transaction Value  : ${average_transaction_value:,.2f}")

# ============================================================
# RFM ANALYSIS
# ============================================================
reference_date = df["PurchaseDate"].max() + pd.Timedelta(days=1)

rfm = df.groupby("Customer_ID").agg({
    "PurchaseDate": lambda x: (reference_date - x.max()).days,
    "Customer_ID": "count",
    "Revenue": "sum"
})

rfm.columns = ["Recency", "Frequency", "Monetary"]
rfm = rfm.reset_index()

rfm["R_Score"] = pd.qcut(rfm["Recency"].rank(method="first"), 5, labels=[5, 4, 3, 2, 1]).astype(int)
rfm["F_Score"] = pd.qcut(rfm["Frequency"].rank(method="first"), 5, labels=[1, 2, 3, 4, 5]).astype(int)
rfm["M_Score"] = pd.qcut(rfm["Monetary"].rank(method="first"), 5, labels=[1, 2, 3, 4, 5]).astype(int)
rfm["RFM_Score"] = rfm["R_Score"].astype(str) + rfm["F_Score"].astype(str) + rfm["M_Score"].astype(str)

def assign_segment(row):
    if row["R_Score"] >= 4 and row["F_Score"] >= 4 and row["M_Score"] >= 4:
        return "Champions"
    elif row["R_Score"] >= 4 and row["F_Score"] >= 3:
        return "Loyal Customers"
    elif row["R_Score"] >= 4 and row["M_Score"] >= 3:
        return "Potential Loyalists"
    elif row["R_Score"] <= 2 and row["F_Score"] >= 3:
        return "At Risk"
    elif row["R_Score"] <= 2 and row["M_Score"] >= 3:
        return "High Value At Risk"
    elif row["R_Score"] <= 2 and row["F_Score"] <= 2:
        return "Lost Customers"
    else:
        return "Regular Customers"

rfm["Segment"] = rfm.apply(assign_segment, axis=1)

# ============================================================
# K-MEANS CLUSTERING
# ============================================================
scaler = StandardScaler()
scaled_features = scaler.fit_transform(rfm[["Recency", "Frequency", "Monetary"]])
kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
rfm["Cluster"] = kmeans.fit_predict(scaled_features)

print("\n" + "=" * 60)
print("AUTOMATIC BUSINESS INSIGHTS")
print("=" * 60)
best_product = df.groupby("Product")["Revenue"].sum().idxmax()
best_country = df.groupby("Country")["Revenue"].sum().idxmax()
best_category = df.groupby("Category")["Revenue"].sum().idxmax()
largest_segment = rfm["Segment"].value_counts().idxmax()

print(f"Best Product    : {best_product}")
print(f"Best Country    : {best_country}")
print(f"Best Category   : {best_category}")
print(f"Largest Segment : {largest_segment}")
print("=" * 60)
