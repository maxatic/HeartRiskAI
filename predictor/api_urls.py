from django.urls import path
from . import api_views

urlpatterns = [
    path('auth/signup/', api_views.api_signup, name='api_signup'),
    path('auth/login/', api_views.api_login, name='api_login'),
    path('auth/me/', api_views.api_me, name='api_me'),
    path('predict/', api_views.api_predict, name='api_predict'),
]

