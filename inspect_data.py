import kagglehub
import pandas as pd
import os

# Download latest version
path = kagglehub.dataset_download("fatemehmohammadinia/heart-attack-dataset-tarik-a-rashid")

print("Path to dataset files:", path)

# Find the csv file in the downloaded path
csv_file = None
for root, dirs, files in os.walk(path):
    for file in files:
        if file.endswith(".csv"):
            csv_file = os.path.join(root, file)
            break

if csv_file:
    print(f"Found CSV file: {csv_file}")
    df = pd.read_csv(csv_file)
    print("\nFirst 5 rows:")
    print(df.head())
    print("\nColumns:")
    print(df.columns.tolist())
    print("\nInfo:")
    print(df.info())
else:
    print("No CSV file found in the dataset path.")
