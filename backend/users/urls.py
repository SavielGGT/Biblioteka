from django.urls import path
from .views import ProfileView, PasswordResetView, PasswordResetConfirmView, CustomTokenView, RegisterView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),                   # ✅ нова реєстрація
    path('profile/', ProfileView.as_view(), name='user-profile'),
    path('password-reset/', PasswordResetView.as_view(), name='password-reset'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/', CustomTokenView.as_view(), name='custom_token_obtain_pair'),
]
