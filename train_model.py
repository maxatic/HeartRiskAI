import pandas as pd
import numpy as np
import os
import sqlite3
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import LabelEncoder

# Configuration
DB_PATH = 'db.sqlite3'
MODEL_PATH = 'heart_attack_model.pkl'

# Required features in correct order for the model
FEATURES = [
    'Age', 'Gender', 'Heart rate', 'Systolic blood pressure', 
    'Diastolic blood pressure', 'Blood sugar', 'CK-MB', 'Troponin'
]

def load_data():

    # Database
    if os.path.exists(DB_PATH):
        conn = sqlite3.connect(DB_PATH)
        try:
            df = pd.read_sql_query("SELECT * FROM predictor_heartriskrecord", conn)
        except Exception as e:
            return None
        finally:
            conn.close()
            
        if not df.empty:
            # Rename columns to match Expected Features
            column_mapping = {
                'age': 'Age', 
                'gender': 'Gender', 
                'heart_rate': 'Heart rate',
                'systolic_bp': 'Systolic blood pressure', 
                'diastolic_bp': 'Diastolic blood pressure',
                'blood_sugar': 'Blood sugar', 
                'ck_mb': 'CK-MB', 
                'troponin': 'Troponin',
                'result': 'Result'
            }
            df.rename(columns=column_mapping, inplace=True)
            return df
            
    return None

def train():
    # Load Data
    df = load_data()
    if df is None:
        return

    # Prepare X and y
    X = df[FEATURES]
    y_raw = df['Result']

    # Encode Target (positive/negative -> 1/0)
    le = LabelEncoder()
    y = le.fit_transform(y_raw)

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model Accuracy: {accuracy:.4f}")
    

    #Save Model
    joblib.dump(model, MODEL_PATH)

if __name__ == "__main__":
    train()
