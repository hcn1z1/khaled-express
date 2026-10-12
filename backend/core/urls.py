from django.urls import path
from .views import CustomerRegisterView, LoginView, CurrentUserView, OfficeListView

urlpatterns = [
    path('auth/register/', CustomerRegisterView.as_view(), name='auth-register'),
    path('auth/login/', LoginView.as_view(), name='auth-login'),
    path('auth/me/', CurrentUserView.as_view(), name='auth-me'),
    path('offices/', OfficeListView.as_view(), name='office-list'),
]
