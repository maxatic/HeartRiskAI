"""
Test script to verify InstantDB integration
"""
import os
import sys
import django
from datetime import datetime

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'heart_risk_project.settings')
django.setup()

from predictor.instantdb_client import save_prediction, get_instantdb_client

# Test data
test_prediction = {
    'input_data': {
        'Age': 45,
        'Gender': 1,
        'Heart rate': 75,
        'Systolic blood pressure': 130,
        'Diastolic blood pressure': 85,
        'Blood sugar': 110,
        'CK-MB': 2.5,
        'Troponin': 0.5
    },
    'risk_score': 35,
    'risk_level': 'Moderate Risk',
    'risk_class': 'warning',
    'recommendation': 'Consult with a healthcare provider to discuss preventive measures.',
    'factors': [
        {'name': 'Age', 'value': '45 years', 'status': 'Moderate Risk', 'score': 15, 'max': 25},
        {'name': 'Heart Rate', 'value': '75 bpm', 'status': 'Normal', 'score': 0, 'max': 15},
        {'name': 'Systolic Blood Pressure', 'value': '130 mmHg', 'status': 'Elevated', 'score': 10, 'max': 20},
        {'name': 'Diastolic Blood Pressure', 'value': '85 mmHg', 'status': 'Elevated', 'score': 10, 'max': 20},
        {'name': 'Blood Sugar', 'value': '110 mg/dL', 'status': 'Elevated (Prediabetic)', 'score': 10, 'max': 20}
    ],
    'timestamp': datetime.now().isoformat()
}

print("Testing InstantDB Integration...")
print(f"App ID: dedcbf6c-f946-489c-a174-853b24a9b397")
print("\nAttempting to save prediction to InstantDB...")

# Get client
client = get_instantdb_client()
if client:
    print(f"✓ InstantDB client initialized: {type(client)}")
else:
    print("✗ InstantDB client not available")
    sys.exit(1)

# Try to save
result = save_prediction(test_prediction)
if result:
    print("✓ Prediction saved successfully!")
    print(f"Result: {result}")
else:
    print("✗ Failed to save prediction")
    print("Note: This might be expected if InstantDB API endpoint or format is different")
    print("Check the error messages above for details")

print("\nTest completed!")

