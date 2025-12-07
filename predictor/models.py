from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator


class User(AbstractUser):
    """Custom user model with role selection"""
    ROLE_CHOICES = [
        ('patient', 'Patient'),
        ('doctor', 'Doctor'),
    ]
    
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='patient')
    full_name = models.CharField(max_length=255, blank=True)
    
    def __str__(self):
        return f"{self.email} ({self.role})"


class DoctorProfile(models.Model):
    """Extended profile for doctors"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='doctor_profile')
    license_number = models.CharField(max_length=50, blank=True)
    specialization = models.CharField(max_length=100, blank=True, default='Cardiology')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Dr. {self.user.full_name}"


class PatientProfile(models.Model):
    """Extended profile for patients"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='patient_profile')
    assigned_doctor = models.ForeignKey(
        DoctorProfile, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='patients'
    )
    doctor_id_code = models.CharField(max_length=50, blank=True, help_text="Optional doctor ID to link with a doctor")
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Patient: {self.user.full_name}"


class HeartRiskRecord(models.Model):
    """Model to store heart attack risk dataset records"""
    age = models.IntegerField()
    gender = models.IntegerField(choices=[(1, 'Male'), (0, 'Female')])
    heart_rate = models.IntegerField()
    systolic_bp = models.IntegerField()
    diastolic_bp = models.IntegerField()
    blood_sugar = models.FloatField()
    ck_mb = models.FloatField()
    troponin = models.FloatField()
    result = models.CharField(max_length=20)  # positive/negative
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Record {self.id} - {self.result}"
