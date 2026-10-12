from rest_framework import serializers
from core.serializers import UserProfileSerializer, OfficeSerializer
from .models import PaymentEntry, ExpenseEntry

class PaymentEntrySerializer(serializers.ModelSerializer):
    recorded_by_detail = UserProfileSerializer(source='recorded_by', read_only=True)
    tracking_code = serializers.CharField(source='parcel.tracking_code', read_only=True)

    class Meta:
        model = PaymentEntry
        fields = [
            'id', 'parcel', 'tracking_code', 'amount',
            'payment_method', 'recorded_by', 'recorded_by_detail',
            'recorded_at', 'reference', 'notes'
        ]
        read_only_fields = ['id', 'recorded_by', 'recorded_at']

class ExpenseEntrySerializer(serializers.ModelSerializer):
    recorded_by_detail = UserProfileSerializer(source='recorded_by', read_only=True)
    office_detail = OfficeSerializer(source='office', read_only=True)

    class Meta:
        model = ExpenseEntry
        fields = [
            'id', 'amount', 'category', 'office',
            'office_detail', 'description', 'recorded_by',
            'recorded_by_detail', 'date', 'created_at'
        ]
        read_only_fields = ['id', 'recorded_by', 'created_at']
