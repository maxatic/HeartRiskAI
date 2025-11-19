from django.shortcuts import render
from .forms import HeartRiskForm
import joblib
import pandas as pd
import os
from django.conf import settings

# Load model once
MODEL_PATH = os.path.join(settings.BASE_DIR, 'heart_attack_model.pkl')
try:
    model = joblib.load(MODEL_PATH)
except FileNotFoundError:
    print(f"Error: Model not found at {MODEL_PATH}")
    model = None

def home(request):
    if request.method == 'POST':
        form = HeartRiskForm(request.POST)
        if form.is_valid():
            # Extract data
            data = {
                'Age': form.cleaned_data['age'],
                'Gender': int(form.cleaned_data['gender']),
                'Heart rate': form.cleaned_data['heart_rate'],
                'Systolic blood pressure': form.cleaned_data['systolic_bp'],
                'Diastolic blood pressure': form.cleaned_data['diastolic_bp'],
                'Blood sugar': form.cleaned_data['blood_sugar'],
                'CK-MB': form.cleaned_data['ck_mb'],
                'Troponin': form.cleaned_data['troponin']
            }
            
            # Create DataFrame for model
            df = pd.DataFrame([data])
            
            # Predict
            if model:
                prediction = model.predict(df)[0]
                result = "High Risk (Positive)" if prediction == 1 else "Low Risk (Negative)"
            else:
                result = "Error: Model not loaded"
            
            return render(request, 'predictor/result.html', {'result': result})
    else:
        form = HeartRiskForm()
    
    return render(request, 'predictor/home.html', {'form': form})
