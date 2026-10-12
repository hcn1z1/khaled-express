from rest_framework import serializers
from .models import MockSmsOutbox, SmsGatewaySettings

class MockSmsOutboxSerializer(serializers.ModelSerializer):
    tracking_code = serializers.CharField(source='parcel.tracking_code', read_only=True)

    class Meta:
        model = MockSmsOutbox
        fields = [
            'id', 'tracking_code', 'recipient_phone',
            'language', 'message_body', 'status',
            'idempotency_key', 'queued_at', 'sent_at', 'delivery_report'
        ]

class SmsGatewaySettingsSerializer(serializers.ModelSerializer):
    default_template_fr = serializers.CharField(source='DEFAULT_TEMPLATE_FR', read_only=True)
    default_template_ar = serializers.CharField(source='DEFAULT_TEMPLATE_AR', read_only=True)
    updated_by_name = serializers.CharField(source='updated_by.full_name', read_only=True, default=None)

    class Meta:
        model = SmsGatewaySettings
        fields = [
            'id',
            'is_enabled',
            'gateway_url',
            'username',
            'password',
            'device_name',
            'template_fr',
            'template_ar',
            'default_template_fr',
            'default_template_ar',
            'updated_at',
            'updated_by_name'
        ]

class SmsTestSendSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=30, required=True)
    message = serializers.CharField(max_length=500, required=False, allow_blank=True)
