from django.urls import path
from .views import ParcelListCreateView, ParcelDetailView, ScanExecuteView, PublicTrackView

urlpatterns = [
    path('', ParcelListCreateView.as_view(), name='parcel-list-create'),
    path('<int:id>/', ParcelDetailView.as_view(), name='parcel-detail'),
    path('scan/', ScanExecuteView.as_view(), name='parcel-scan'),
    path('track/', PublicTrackView.as_view(), name='parcel-track'),
]
