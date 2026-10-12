from rest_framework import serializers
from core.serializers import OfficeSerializer, UserProfileSerializer
from core.models import Office
from .models import Parcel, ScanEvent, ParcelStatus, PaymentStatus, ScanEventType
from .utils import generate_barcode_base64_png, generate_barcode_svg

class ScanEventSerializer(serializers.ModelSerializer):
    office_detail = OfficeSerializer(source='office', read_only=True)
    scanned_by_detail = UserProfileSerializer(source='scanned_by', read_only=True)

    class Meta:
        model = ScanEvent
        fields = [
            'id', 'parcel', 'event_type', 'office',
            'office_detail', 'scanned_by', 'scanned_by_detail',
            'timestamp', 'notes'
        ]
        read_only_fields = ['id', 'timestamp']

class ParcelSerializer(serializers.ModelSerializer):
    origin_office_detail = OfficeSerializer(source='origin_office', read_only=True)
    destination_office_detail = OfficeSerializer(source='destination_office', read_only=True)
    current_office_detail = OfficeSerializer(source='current_office', read_only=True)
    scan_events = ScanEventSerializer(many=True, read_only=True)
    
    total_paid = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    payment_status = serializers.CharField(read_only=True)
    barcode_png = serializers.SerializerMethodField()
    barcode_svg = serializers.SerializerMethodField()

    class Meta:
        model = Parcel
        fields = [
            'id', 'tracking_code',
            'origin_office', 'origin_office_detail',
            'destination_office', 'destination_office_detail',
            'current_office', 'current_office_detail',
            'sender_customer', 'sender_name', 'sender_phone', 'sender_address',
            'recipient_name', 'recipient_phone', 'recipient_address',
            'preferred_sms_language', 'description', 'weight_kg', 'notes',
            'status', 'fee_amount', 'total_paid', 'payment_status',
            'barcode_png', 'barcode_svg', 'scan_events',
            'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'tracking_code', 'current_office',
            'created_by', 'created_at', 'updated_at',
            'total_paid', 'payment_status', 'barcode_png', 'barcode_svg'
        ]

    def get_barcode_png(self, obj):
        return generate_barcode_base64_png(obj.tracking_code)

    def get_barcode_svg(self, obj):
        return generate_barcode_svg(obj.tracking_code)

    def validate(self, attrs):
        origin = attrs.get('origin_office') or (self.instance.origin_office if self.instance else None)
        dest = attrs.get('destination_office') or (self.instance.destination_office if self.instance else None)
        
        if origin and dest:
            if origin.id == dest.id:
                raise serializers.ValidationError("L'agence de départ et l'agence de destination doivent être distinctes.")
            
            allowed = {'ALGIERS', 'EL_EULMA'}
            if origin.code not in allowed or dest.code not in allowed:
                raise serializers.ValidationError("Les transferts sont uniquement autorisés entre Alger et El Eulma.")
        return attrs


class ParcelCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Parcel
        fields = [
            'id', 'tracking_code', 'status',
            'origin_office', 'destination_office',
            'sender_name', 'sender_phone', 'sender_address',
            'recipient_name', 'recipient_phone', 'recipient_address',
            'preferred_sms_language', 'description', 'weight_kg', 'notes',
            'fee_amount'
        ]
        read_only_fields = ['id', 'tracking_code', 'status']

    def validate(self, attrs):
        origin = attrs.get('origin_office')
        dest = attrs.get('destination_office')
        if origin and dest:
            if origin.id == dest.id:
                raise serializers.ValidationError("L'agence de départ et d'arrivée doivent être différentes.")
            allowed = {'ALGIERS', 'EL_EULMA'}
            if origin.code not in allowed or dest.code not in allowed:
                raise serializers.ValidationError("Les agences autorisées sont uniquement Alger et El Eulma.")
        return attrs


class ScanActionSerializer(serializers.Serializer):
    tracking_code = serializers.CharField(max_length=64)
    event_type = serializers.ChoiceField(choices=ScanEventType.choices)
    office_id = serializers.IntegerField(required=False, allow_null=True)
    notes = serializers.CharField(required=False, allow_blank=True, default="")
