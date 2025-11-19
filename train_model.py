import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import LabelEncoder
import joblib
import kagglehub
import os

# 1. Load Data
print("Downloading/Loading dataset...")
path = kagglehub.dataset_download("fatemehmohammadinia/heart-attack-dataset-tarik-a-rashid")
csv_file = None
for root, dirs, files in os.walk(path):
    for file in files:
        if file.endswith(".csv"):
            csv_file = os.path.join(root, file)
            break

if not csv_file:
    raise FileNotFoundError("CSV file not found in dataset path")

df = pd.read_csv(csv_file)

# 2. Preprocessing
print("Preprocessing data...")
# Encode target variable 'Result' (positive -> 1, negative -> 0)
le = LabelEncoder()
df['Result'] = le.fit_transform(df['Result'])
print(f"Classes: {le.classes_}")

X = df.drop('Result', axis=1)
y = df['Result']

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 3. Train Model
print("Training Random Forest model...")
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# 4. Evaluate
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Model Accuracy: {accuracy:.4f}")
print("\nClassification Report:")
print(classification_report(y_test, y_pred))

# 5. Save Model
print("Saving model...")
joblib.dump(model, 'heart_attack_model.pkl')
print("Model saved to 'heart_attack_model.pkl'")
