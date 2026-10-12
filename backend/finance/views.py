from decimal import Decimal
from django.db.models import Sum
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from core.permissions import IsAdminUserOnly
from parcels.models import Parcel, ParcelStatus
from .models import PaymentEntry, ExpenseEntry
from .serializers import PaymentEntrySerializer, ExpenseEntrySerializer

class PaymentEntryListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdminUserOnly]
    serializer_class = PaymentEntrySerializer
    queryset = PaymentEntry.objects.select_related('parcel', 'recorded_by').all()

    def get_queryset(self):
        qs = super().get_queryset()
        parcel_id = self.request.query_params.get('parcel_id')
        if parcel_id:
            qs = qs.filter(parcel_id=parcel_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)


class PaymentEntryDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminUserOnly]
    serializer_class = PaymentEntrySerializer
    queryset = PaymentEntry.objects.all()


class ExpenseEntryListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdminUserOnly]
    serializer_class = ExpenseEntrySerializer
    queryset = ExpenseEntry.objects.select_related('office', 'recorded_by').all()

    def get_queryset(self):
        qs = super().get_queryset()
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category=category)
        office_id = self.request.query_params.get('office_id')
        if office_id:
            qs = qs.filter(office_id=office_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)


class ExpenseEntryDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminUserOnly]
    serializer_class = ExpenseEntrySerializer
    queryset = ExpenseEntry.objects.all()


class FinanceSummaryView(APIView):
    """
    Computes total received (sum of payments), total spent (sum of expenses),
    and net balance in DZD. Accessible exclusively to Admins.
    """
    permission_classes = [IsAdminUserOnly]

    def get(self, request):
        total_received = PaymentEntry.objects.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        total_spent = ExpenseEntry.objects.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        net_balance = total_received - total_spent

        total_parcels = Parcel.objects.count()
        delivered_count = Parcel.objects.filter(status=ParcelStatus.DELIVERED).count()
        in_transit_count = Parcel.objects.filter(status=ParcelStatus.DISPATCHED).count()

        # Category breakdown for expenses
        expenses_by_cat = (
            ExpenseEntry.objects.values('category')
            .annotate(total=Sum('amount'))
            .order_by('-total')
        )

        return Response({
            'currency': 'DZD',
            'total_received': str(total_received),
            'total_spent': str(total_spent),
            'net_balance': str(net_balance),
            'metrics': {
                'total_parcels': total_parcels,
                'delivered_parcels': delivered_count,
                'in_transit_parcels': in_transit_count,
            },
            'expenses_by_category': list(expenses_by_cat),
        })
