from django import forms

class HeartRiskForm(forms.Form):
    age = forms.IntegerField(
        label='Age', 
        min_value=0, 
        max_value=120,
        help_text="Years",
        widget=forms.NumberInput(attrs={'placeholder': '45'})
    )
    gender = forms.ChoiceField(
        label='Gender', 
        choices=[(1, 'Male'), (0, 'Female')],
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    heart_rate = forms.IntegerField(
        label='Heart Rate', 
        min_value=0,
        help_text="Beats per minute (Normal: 60-100 bpm)",
        widget=forms.NumberInput(attrs={'placeholder': '72'})
    )
    systolic_bp = forms.IntegerField(
        label='Systolic Blood Pressure', 
        min_value=0,
        help_text="Top number (Normal: under 120 mmHg)",
        widget=forms.NumberInput(attrs={'placeholder': '120'})
    )
    diastolic_bp = forms.IntegerField(
        label='Diastolic Blood Pressure', 
        min_value=0,
        help_text="Bottom number (Normal: under 80 mmHg)",
        widget=forms.NumberInput(attrs={'placeholder': '80'})
    )
    blood_sugar = forms.FloatField(
        label='Blood Sugar', 
        min_value=0,
        help_text="Fasting glucose (Normal: 70-100 mg/dL)",
        widget=forms.NumberInput(attrs={'placeholder': '95'})
    )
    ck_mb = forms.FloatField(
        label='CK-MB', 
        min_value=0,
        help_text="Creatine Kinase-MB levels",
        widget=forms.NumberInput(attrs={'placeholder': '0.0'})
    )
    troponin = forms.FloatField(
        label='Troponin', 
        min_value=0,
        help_text="Troponin levels",
        widget=forms.NumberInput(attrs={'placeholder': '0.0'})
    )
