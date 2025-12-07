from django.contrib import admin
from .models import User, DoctorProfile, PatientProfile, HeartRiskRecord

@admin.register(HeartRiskRecord)
class HeartRiskRecordAdmin(admin.ModelAdmin):
    list_display = ('id', 'age', 'gender', 'result', 'created_at')
    list_filter = ('result', 'gender')
    search_fields = ('result',)

admin.site.register(User)
admin.site.register(DoctorProfile)
admin.site.register(PatientProfile)
