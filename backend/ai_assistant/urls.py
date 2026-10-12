from django.urls import path
from .views import StaffAiAssistantView

urlpatterns = [
    path('assistant/', StaffAiAssistantView.as_view(), name='ai-assistant'),
]
