from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import authenticate
from datetime import datetime
import joblib
import pandas as pd
import os
from django.conf import settings

from .models import User, DoctorProfile, PatientProfile
from .authentication import generate_jwt_token
from .instantdb_client import (
    save_prediction,
    save_user,
    save_doctor_profile,
    save_patient_profile
)

# Load model once
MODEL_PATH = os.path.join(settings.BASE_DIR, 'heart_attack_model.pkl')
try:
    model = joblib.load(MODEL_PATH)
except FileNotFoundError:
    print(f"Error: Model not found at {MODEL_PATH}")
    model = None


@api_view(['POST'])
@permission_classes([AllowAny])
def api_signup(request):
    """Handle user registration via API."""
    data = request.data
    
    full_name = data.get('full_name', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')
    confirm_password = data.get('confirm_password', '')
    role = data.get('role', 'patient')
    doctor_id = data.get('doctor_id', '').strip()
    
    # Validation
    if not full_name or not email or not password:
        return Response(
            {'error': 'Please fill in all required fields.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if password != confirm_password:
        return Response(
            {'error': 'Passwords do not match.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if len(password) < 6:
        return Response(
            {'error': 'Password must be at least 6 characters.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if user exists
    if User.objects.filter(email=email).exists():
        return Response(
            {'error': 'An account with this email already exists.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Create user
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            full_name=full_name,
            role=role
        )
        
        # Save user to InstantDB
        save_user({
            'id': user.id,
            'email': user.email,
            'full_name': user.full_name,
            'role': user.role,
            'created_at': datetime.now().isoformat()
        })
        
        # Create profile based on role
        if role == 'doctor':
            doctor_profile = DoctorProfile.objects.create(user=user)
            save_doctor_profile({
                'id': doctor_profile.id,
                'user_id': user.id,
                'license_number': '',
                'specialization': 'Cardiology',
                'created_at': datetime.now().isoformat()
            })
        else:
            patient_profile = PatientProfile.objects.create(
                user=user,
                doctor_id_code=doctor_id
            )
            save_patient_profile({
                'id': patient_profile.id,
                'user_id': user.id,
                'doctor_id_code': doctor_id,
                'assigned_doctor_id': None,
                'created_at': datetime.now().isoformat()
            })
            # Try to link with doctor if doctor_id provided
            if doctor_id:
                try:
                    doctor_profile = DoctorProfile.objects.get(license_number=doctor_id)
                    patient_profile.assigned_doctor = doctor_profile
                    patient_profile.save()
                except DoctorProfile.DoesNotExist:
                    pass
        
        # Generate JWT token
        token = generate_jwt_token(user)
        
        return Response({
            'message': 'Account created successfully',
            'token': token,
            'user': {
                'id': user.id,
                'email': user.email,
                'full_name': user.full_name,
                'role': user.role,
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': f'An error occurred: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def api_login(request):
    """Handle user login via API."""
    data = request.data
    
    email = data.get('email', '').strip()
    password = data.get('password', '')
    role = data.get('role', 'patient')
    
    if not email or not password:
        return Response(
            {'error': 'Please enter email and password.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Authenticate user
    user = authenticate(request, username=email, password=password)
    
    if user is not None:
        # Check if role matches
        if user.role != role:
            return Response(
                {'error': f'This account is registered as a {user.role.capitalize()}, not a {role.capitalize()}.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate JWT token
        token = generate_jwt_token(user)
        
        return Response({
            'message': 'Login successful',
            'token': token,
            'user': {
                'id': user.id,
                'email': user.email,
                'full_name': user.full_name,
                'role': user.role,
            }
        })
    else:
        return Response(
            {'error': 'Invalid email or password.'},
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_me(request):
    """Get current user info."""
    user = request.user
    return Response({
        'id': user.id,
        'email': user.email,
        'full_name': user.full_name,
        'role': user.role,
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def api_predict(request):
    """Handle heart risk prediction via API."""
    data = request.data
    
    # Validate required fields
    required_fields = ['age', 'gender', 'heart_rate', 'systolic_bp', 'diastolic_bp', 'blood_sugar', 'ck_mb', 'troponin']
    for field in required_fields:
        if field not in data:
            return Response(
                {'error': f'Missing required field: {field}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    try:
        # Extract data
        input_data = {
            'Age': int(data['age']),
            'Gender': int(data['gender']),
            'Heart rate': int(data['heart_rate']),
            'Systolic blood pressure': int(data['systolic_bp']),
            'Diastolic blood pressure': int(data['diastolic_bp']),
            'Blood sugar': float(data['blood_sugar']),
            'CK-MB': float(data['ck_mb']),
            'Troponin': float(data['troponin'])
        }
        
        if model is None:
            return Response(
                {'error': 'Model not loaded'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Create DataFrame for model
        df = pd.DataFrame([input_data])
        
        # Predict
        prediction_prob = model.predict_proba(df)[0][1]
        risk_score = int(prediction_prob * 100)
        
        # Determine risk level
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
        age = input_data['Age']
        if age > 60:
            factors.append({'name': 'Age', 'value': f"{age} years", 'status': 'High Risk', 'score': 25, 'max': 25})
        elif age > 45:
            factors.append({'name': 'Age', 'value': f"{age} years", 'status': 'Moderate Risk', 'score': 15, 'max': 25})
        else:
            factors.append({'name': 'Age', 'value': f"{age} years", 'status': 'Low Risk', 'score': 5, 'max': 25})
        
        # Heart Rate Analysis
        hr = input_data['Heart rate']
        if hr > 100 or hr < 60:
            factors.append({'name': 'Heart Rate', 'value': f"{hr} bpm", 'status': 'Abnormal', 'score': 15, 'max': 15})
        else:
            factors.append({'name': 'Heart Rate', 'value': f"{hr} bpm", 'status': 'Normal', 'score': 0, 'max': 15})
        
        # Systolic BP Analysis
        sys_bp = input_data['Systolic blood pressure']
        if sys_bp >= 140:
            factors.append({'name': 'Systolic Blood Pressure', 'value': f"{sys_bp} mmHg", 'status': 'High', 'score': 20, 'max': 20})
        elif sys_bp >= 120:
            factors.append({'name': 'Systolic Blood Pressure', 'value': f"{sys_bp} mmHg", 'status': 'Elevated', 'score': 10, 'max': 20})
        else:
            factors.append({'name': 'Systolic Blood Pressure', 'value': f"{sys_bp} mmHg", 'status': 'Normal', 'score': 0, 'max': 20})
        
        # Diastolic BP Analysis
        dia_bp = input_data['Diastolic blood pressure']
        if dia_bp >= 90:
            factors.append({'name': 'Diastolic Blood Pressure', 'value': f"{dia_bp} mmHg", 'status': 'High', 'score': 20, 'max': 20})
        elif dia_bp >= 80:
            factors.append({'name': 'Diastolic Blood Pressure', 'value': f"{dia_bp} mmHg", 'status': 'Elevated', 'score': 10, 'max': 20})
        else:
            factors.append({'name': 'Diastolic Blood Pressure', 'value': f"{dia_bp} mmHg", 'status': 'Normal', 'score': 0, 'max': 20})
        
        # Blood Sugar Analysis
        sugar = input_data['Blood sugar']
        if sugar >= 126:
            factors.append({'name': 'Blood Sugar', 'value': f"{sugar} mg/dL", 'status': 'High (Diabetic range)', 'score': 20, 'max': 20})
        elif sugar >= 100:
            factors.append({'name': 'Blood Sugar', 'value': f"{sugar} mg/dL", 'status': 'Elevated (Prediabetic)', 'score': 10, 'max': 20})
        else:
            factors.append({'name': 'Blood Sugar', 'value': f"{sugar} mg/dL", 'status': 'Normal', 'score': 0, 'max': 20})
        
        result = {
            'risk_score': risk_score,
            'risk_level': risk_level,
            'risk_class': risk_class,
            'recommendation': recommendation,
            'factors': factors,
            'input_data': input_data,
            'chart_data': {
                'age_impact': 31,
                'bp_impact': 25,
                'sugar_impact': 25,
                'hr_impact': 19
            }
        }
        
        # Save prediction to InstantDB
        prediction_data = {
            'input_data': input_data,
            'risk_score': risk_score,
            'risk_level': risk_level,
            'risk_class': risk_class,
            'recommendation': recommendation,
            'factors': factors,
            'timestamp': datetime.now().isoformat(),
            'user_id': request.user.id if request.user.is_authenticated else None
        }
        save_prediction(prediction_data)
        
        return Response(result)
        
    except ValueError as e:
        return Response(
            {'error': f'Invalid data format: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': f'Prediction failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

