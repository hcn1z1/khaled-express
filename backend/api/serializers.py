from rest_framework import serializers
from .models import Office, User, Parcel, ScanEvent, PaymentEntry, ExpenseEntry, SmsOutbox
from .barcode_utils import generate_barcode_svg


class OfficeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Office
        fields = ['code', 'name_fr', 'name_ar', 'address_fr', 'address_ar', 'phone', 'is_active']


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'role', 'phone', 'preferred_language', 'assigned_office', 'can_access_finance', 'is_staff_member']
        read_only_fields = ['id', 'can_access_finance', 'is_staff_member']


class RegisterCustomerSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=4)

    class Meta:
        model = User
        fields = ['username', 'phone', 'password', 'first_name', 'last_name', 'preferred_language']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create(
            role=User.ROLE_CUSTOMER,
            **validated_data
        )
        user.set_password(password)
        user.save()
        return user


class ScanEventSerializer(serializers.ModelSerializer):
    performed_by_name = serializers.ReadOnlyField(source='performed_by.username')
    office_name_fr = serializers.ReadOnlyField(source='office.name_fr')
    office_name_ar = serializers.ReadOnlyField(source='office.name_ar')

    class Meta:
        model = ScanEvent
        fields = [
            'id', 'parcel', 'event_type', 'office', 'office_name_fr', 'office_name_ar',
            'performed_by', 'performed_by_name', 'timestamp', 'notes'
        ]
        read_only_fields = ['id', 'timestamp']


class PaymentEntrySerializer(serializers.ModelSerializer):
    recorded_by_name = serializers.ReadOnlyField(source='recorded_by.username')
    tracking_number = serializers.ReadOnlyField(source='parcel.tracking_number')

    class Meta:
        model = PaymentEntry
        fields = ['id', 'parcel', 'tracking_number', 'amount', 'payment_method', 'recorded_by', 'recorded_by_name', 'created_at', 'notes']
        read_only_fields = ['id', 'created_at', 'recorded_by']


class ExpenseEntrySerializer(serializers.ModelSerializer):
    recorded_by_name = serializers.ReadOnlyField(source='recorded_by.username')
    office_name_fr = serializers.ReadOnlyField(source='office.name_fr')

    class Meta:
        model = ExpenseEntry
        fields = ['id', 'office', 'office_name_fr', 'amount', 'category', 'description', 'recorded_by', 'recorded_by_name', 'created_at']
        read_only_fields = ['id', 'created_at', 'recorded_by']


class SmsOutboxSerializer(serializers.ModelSerializer):
    tracking_number = serializers.ReadOnlyField(source='parcel.tracking_number')

    class Meta:
        model = SmsOutbox
        fields = ['id', 'parcel', 'tracking_number', 'recipient_phone', 'language', 'message_body', 'status', 'created_at', 'sent_at']


class ParcelSerializer(serializers.ModelSerializer):
    origin_name_fr = serializers.ReadOnlyField(source='origin_office.name_fr')
    origin_name_ar = serializers.ReadOnlyField(source='origin_office.name_ar')
    destination_name_fr = serializers.ReadOnlyField(source='destination_office.name_fr')
    destination_name_ar = serializers.ReadOnlyField(source='destination_office.name_ar')
    current_name_fr = serializers.ReadOnlyField(source='current_office.name_fr')
    current_name_ar = serializers.ReadOnlyField(source='current_office.name_ar')
    total_paid = serializers.ReadOnlyField()
    is_paid = serializers.ReadOnlyField()
    scan_events = ScanEventSerializer(many=True, read_only=True)
    barcode_svg = serializers.SerializerMethodField()

    class Meta:
        model = Parcel
        fields = [
            'id', 'tracking_number', 'barcode_data', 'origin_office', 'origin_name_fr', 'origin_name_ar',
            'destination_office', 'destination_name_fr', 'destination_name_ar',
            'current_office', 'current_name_fr', 'current_name_ar',
            'sender_name', 'sender_phone', 'sender_user',
            'recipient_name', 'recipient_phone', 'recipient_notes',
            'description', 'weight_kg', 'fee', 'status', 'is_paid', 'total_paid',
            'created_by', 'created_at', 'updated_at', 'scan_events', 'barcode_svg'
        ]
        read_only_fields = ['id', 'tracking_number', 'barcode_data', 'created_at', 'updated_at', 'is_paid', 'total_paid']

    def get_barcode_svg(self, obj):
        return generate_barcode_svg(obj.tracking_number, width=280, height=70, show_text=True)

    def validate(self, attrs):
        origin = attrs.get('origin_office') or (self.instance and self.instance.origin_office)
        dest = attrs.get('destination_office') or (self.instance and self.instance.destination_office)
        
        valid = [Office.CODE_ALGIERS, Office.CODE_EL_EULMA]
        if origin and origin.code not in valid:
            raise serializers.ValidationError({"origin_office": "Seuls Alger (ALG) et El Eulma (EUL) sont supportés."})
        if dest and dest.code not in valid:
            raise serializers.ValidationError({"destination_office": "Seuls Alger (ALG) et El Eulma (EUL) sont supportés."})
        if origin and dest and origin.code == dest.code:
            raise serializers.ValidationError("L'origine et la destination ne peuvent pas être identiques.")
        return attrs
