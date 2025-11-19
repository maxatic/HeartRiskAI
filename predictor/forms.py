from django import forms

class HeartRiskForm(forms.Form):
    age = forms.IntegerField(label='Age', min_value=0, max_value=120)
    gender = forms.ChoiceField(label='Gender', choices=[(1, 'Male'), (0, 'Female')])
    heart_rate = forms.IntegerField(label='Heart Rate (bpm)', min_value=0)
    systolic_bp = forms.IntegerField(label='Systolic Blood Pressure', min_value=0)
    diastolic_bp = forms.IntegerField(label='Diastolic Blood Pressure', min_value=0)
    blood_sugar = forms.FloatField(label='Blood Sugar', min_value=0)
    ck_mb = forms.FloatField(label='CK-MB', min_value=0)
    troponin = forms.FloatField(label='Troponin', min_value=0)
