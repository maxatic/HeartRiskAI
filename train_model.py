import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import LabelEncoder
import joblib
import os
import argparse
import sys
import django

# 1. Setup Argument Parser
parser = argparse.ArgumentParser(description='Train Heart Attack Risk Model')
parser.add_argument('--file', type=str, help='Path to local CSV dataset (optional)')
parser.add_argument('--source', type=str, choices=['local', 'db'], default='db', help='Data source: local (file) or db (database)')
args = parser.parse_args()

# 2. Load Data
df = None

if args.source == 'db':
    print("Loading data from Database (SQLite)...")
    sys.path.append(os.getcwd())
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'heart_risk_project.settings')
    django.setup()
    
    from predictor.models import HeartRiskRecord
    records = HeartRiskRecord.objects.all().values()
    
    if not records:
        raise ValueError("No records found in database! Please run import_data first.")
        
    df = pd.DataFrame(list(records))
    
    # Rename DB fields (lowercase) to Model fields (Title Case)
    df.rename(columns={
        'age': 'Age', 'gender': 'Gender', 'heart_rate': 'Heart rate',
        'systolic_bp': 'Systolic blood pressure', 'diastolic_bp': 'Diastolic blood pressure',
        'blood_sugar': 'Blood sugar', 'ck_mb': 'CK-MB', 'troponin': 'Troponin',
        'result': 'Result'
    }, inplace=True)
    
    # Drop database-specific fields that are not features
    if 'id' in df.columns:
        df.drop('id', axis=1, inplace=True)
    if 'created_at' in df.columns:
        df.drop('created_at', axis=1, inplace=True)

elif args.file or args.source == 'local':
    target_file = args.file
    if not target_file:
        raise ValueError("--file argument required for local source")
    print(f"Using local file: {target_file}")
    if os.path.exists(target_file):
        df = pd.read_csv(target_file)
    else:
        raise FileNotFoundError(f"File not found: {target_file}")

if df is None:
    raise FileNotFoundError("Could not load data from selected source")

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
