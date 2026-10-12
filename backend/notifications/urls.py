from django.urls import path
from .views import (
    MockSmsOutboxListView,
    SmsGatewaySettingsView,
    SmsTestSendView,
    SmsResetTemplatesView
)

urlpatterns = [
    path('outbox/', MockSmsOutboxListView.as_view(), name='sms-outbox-list'),
    path('settings/', SmsGatewaySettingsView.as_view(), name='sms-settings'),
    path('settings/test-sms/', SmsTestSendView.as_view(), name='sms-test-send'),
    path('settings/reset-templates/', SmsResetTemplatesView.as_view(), name='sms-reset-templates'),
]
