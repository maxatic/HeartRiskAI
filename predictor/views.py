from django.shortcuts import render
from .forms import HeartRiskForm
import joblib
import pandas as pd
import os
from django.conf import settings
from datetime import datetime
from .instantdb_client import save_prediction

# Load model once
MODEL_PATH = os.path.join(settings.BASE_DIR, 'heart_attack_model.pkl')
try:
    model = joblib.load(MODEL_PATH)
except FileNotFoundError:
    print(f"Error: Model not found at {MODEL_PATH}")
    model = None

def landing(request):
    return render(request, 'predictor/landing.html')

def predict(request):
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
            
            context = {
                'form': form,
                'input_data': data
            }

            # Predict
            if model:
                # Get probability of positive class (1)
                prediction_prob = model.predict_proba(df)[0][1]
                risk_score = int(prediction_prob * 100)
                
                # Determine risk level text
                if risk_score >= 70:
                    risk_level = "Very High Risk"
                    risk_class = "critical"
                    recommendation = "Immediate medical attention is recommended. Please consult a cardiologist."
                elif risk_score >= 40:
                    risk_level = "Moderate Risk"
                    risk_class = "warning"
                    recommendation = "Consult with a healthcare provider to discuss preventive measures."
                else:
                    risk_level = "Low Risk"
                    risk_class = "safe"
                    recommendation = "Keep up the healthy lifestyle! Regular checkups are still recommended."

                # Factor Analysis
                factors = []
                
                # Age Analysis
                age = data['Age']
                if age > 60:
                    factors.append({'name': 'Age', 'value': f"{age} years", 'status': 'High Risk', 'score': 25, 'max': 25})
                elif age > 45:
                    factors.append({'name': 'Age', 'value': f"{age} years", 'status': 'Moderate Risk', 'score': 15, 'max': 25})
                else:
                    factors.append({'name': 'Age', 'value': f"{age} years", 'status': 'Low Risk', 'score': 5, 'max': 25})

                # Heart Rate Analysis (Normal 60-100)
                hr = data['Heart rate']
                if hr > 100 or hr < 60:
                     factors.append({'name': 'Heart Rate', 'value': f"{hr} bpm", 'status': 'Abnormal', 'score': 15, 'max': 15})
                else:
                     factors.append({'name': 'Heart Rate', 'value': f"{hr} bpm", 'status': 'Normal', 'score': 0, 'max': 15})

                # Systolic BP Analysis (Normal < 120)
                sys_bp = data['Systolic blood pressure']
                if sys_bp >= 140:
                    factors.append({'name': 'Systolic Blood Pressure', 'value': f"{sys_bp} mmHg", 'status': 'High', 'score': 20, 'max': 20})
                elif sys_bp >= 120:
                    factors.append({'name': 'Systolic Blood Pressure', 'value': f"{sys_bp} mmHg", 'status': 'Elevated', 'score': 10, 'max': 20})
                else:
                    factors.append({'name': 'Systolic Blood Pressure', 'value': f"{sys_bp} mmHg", 'status': 'Normal', 'score': 0, 'max': 20})

                # Diastolic BP Analysis (Normal < 80)
                dia_bp = data['Diastolic blood pressure']
                if dia_bp >= 90:
                    factors.append({'name': 'Diastolic Blood Pressure', 'value': f"{dia_bp} mmHg", 'status': 'High', 'score': 20, 'max': 20})
                elif dia_bp >= 80:
                    factors.append({'name': 'Diastolic Blood Pressure', 'value': f"{dia_bp} mmHg", 'status': 'Elevated', 'score': 10, 'max': 20})
                else:
                    factors.append({'name': 'Diastolic Blood Pressure', 'value': f"{dia_bp} mmHg", 'status': 'Normal', 'score': 0, 'max': 20})

                # Blood Sugar Analysis (Normal < 100)
                sugar = data['Blood sugar']
                if sugar >= 126:
                    factors.append({'name': 'Blood Sugar', 'value': f"{sugar} mg/dL", 'status': 'High (Diabetic range)', 'score': 20, 'max': 20})
                elif sugar >= 100:
                    factors.append({'name': 'Blood Sugar', 'value': f"{sugar} mg/dL", 'status': 'Elevated (Prediabetic)', 'score': 10, 'max': 20})
                else:
                    factors.append({'name': 'Blood Sugar', 'value': f"{sugar} mg/dL", 'status': 'Normal', 'score': 0, 'max': 20})

                context.update({
                    'risk_score': risk_score,
                    'risk_level': risk_level,
                    'risk_class': risk_class,
                    'recommendation': recommendation,
                    'factors': factors,
                    # Data for charts
                    'chart_data': {
                        'age_impact': 31, # Example static distribution for visualization as requested
                        'bp_impact': 25,
                        'sugar_impact': 25,
                        'hr_impact': 19
                    },
                    'previous_score': max(0, risk_score - 10) # Mock previous score
                })
                
                # Save prediction to InstantDB
                prediction_data = {
                    'input_data': data,
                    'risk_score': risk_score,
                    'risk_level': risk_level,
                    'risk_class': risk_class,
                    'recommendation': recommendation,
                    'factors': factors,
                    'timestamp': datetime.now().isoformat()
                }
                save_prediction(prediction_data)
                
                return render(request, 'predictor/result.html', context)
            else:
                return render(request, 'predictor/result.html', {'error': "Model not loaded"})
    else:
        form = HeartRiskForm()
    
    return render(request, 'predictor/predict.html', {'form': form})
