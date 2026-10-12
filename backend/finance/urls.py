from django.urls import path
from .views import (
    PaymentEntryListCreateView,
    PaymentEntryDetailView,
    ExpenseEntryListCreateView,
    ExpenseEntryDetailView,
    FinanceSummaryView
)

urlpatterns = [
    path('payments/', PaymentEntryListCreateView.as_view(), name='finance-payments'),
    path('payments/<int:pk>/', PaymentEntryDetailView.as_view(), name='finance-payment-detail'),
    path('expenses/', ExpenseEntryListCreateView.as_view(), name='finance-expenses'),
    path('expenses/<int:pk>/', ExpenseEntryDetailView.as_view(), name='finance-expense-detail'),
    path('summary/', FinanceSummaryView.as_view(), name='finance-summary'),
]
