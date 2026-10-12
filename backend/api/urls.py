from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    OfficeViewSet, ParcelViewSet,
    api_register_customer, api_login, api_logout, api_me,
    api_finance_summary, api_finance_payments, api_finance_expenses,
    api_sms_outbox, api_ai_query
)

router = DefaultRouter()
router.register(r'offices', OfficeViewSet, basename='office')
router.register(r'parcels', ParcelViewSet, basename='parcel')

urlpatterns = [
    # Auth
    path('auth/register/', api_register_customer, name='api-register'),
    path('auth/login/', api_login, name='api-login'),
    path('auth/logout/', api_logout, name='api-logout'),
    path('auth/me/', api_me, name='api-me'),

    # Finance (Admin only)
    path('finance/summary/', api_finance_summary, name='api-finance-summary'),
    path('finance/payments/', api_finance_payments, name='api-finance-payments'),
    path('finance/expenses/', api_finance_expenses, name='api-finance-expenses'),

    # Mock Notifications
    path('sms-outbox/', api_sms_outbox, name='api-sms-outbox'),

    # Staff Read-only AI Assistant
    path('ai/query/', api_ai_query, name='api-ai-query'),

    # Router URLs
    path('', include(router.urls)),
]
