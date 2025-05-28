from django.urls import path
from .views import ProfileView, PasswordResetView, PasswordResetConfirmView

urlpatterns = [
    path('profile/', ProfileView.as_view(), name='user-profile'),
    path('password-reset/', PasswordResetView.as_view(), name='password-reset'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
]
