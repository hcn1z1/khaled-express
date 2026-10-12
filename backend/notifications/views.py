from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from core.permissions import IsStaffUser
from .models import MockSmsOutbox, SmsGatewaySettings
from .serializers import (
    MockSmsOutboxSerializer,
    SmsGatewaySettingsSerializer,
    SmsTestSendSerializer
)
from .gateway import dispatch_sms_via_android_gateway

class MockSmsOutboxListView(generics.ListAPIView):
    permission_classes = [IsStaffUser]
    serializer_class = MockSmsOutboxSerializer
    queryset = MockSmsOutbox.objects.all().order_by('-queued_at')

    def get_queryset(self):
        qs = super().get_queryset()
        parcel_id = self.request.query_params.get('parcel_id')
        if parcel_id:
            qs = qs.filter(parcel_id=parcel_id)
        return qs


class SmsGatewaySettingsView(generics.RetrieveUpdateAPIView):
    """
    Retrieve and update SMS Gateway settings and templates.
    Accessible to both MODERATOR and ADMIN users.
    """
    permission_classes = [IsStaffUser]
    serializer_class = SmsGatewaySettingsSerializer

    def get_object(self):
        return SmsGatewaySettings.get_settings()

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)


class SmsTestSendView(APIView):
    """
    Sends a test SMS to verify connection with the Android phone gateway.
    Accessible to both MODERATOR and ADMIN users.
    """
    permission_classes = [IsStaffUser]

    def post(self, request):
        serializer = SmsTestSendSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone = serializer.validated_data['phone_number']
        custom_message = serializer.validated_data.get('message', '').strip()

        settings = SmsGatewaySettings.get_settings()

        if not custom_message:
            custom_message = (
                "Khaled Express : Test de connexion réussi avec votre passerelle Android SMS Gateway ! "
                "Le terminal est désormais opérationnel pour l'envoi de SMS réels."
            )

        result = dispatch_sms_via_android_gateway(
            phone_number=phone,
            text_message=custom_message,
            settings=settings
        )

        http_status = status.HTTP_200_OK if result.get("success") else status.HTTP_400_BAD_REQUEST
        return Response({
            "success": result.get("success", False),
            "error": result.get("error") if not result.get("success") else None,
            "report": result
        }, status=http_status)


class SmsResetTemplatesView(APIView):
    """
    Resets French and Arabic templates back to their factory defaults.
    """
    permission_classes = [IsStaffUser]

    def post(self, request):
        settings = SmsGatewaySettings.get_settings()
        settings.template_fr = settings.DEFAULT_TEMPLATE_FR
        settings.template_ar = settings.DEFAULT_TEMPLATE_AR
        settings.updated_by = request.user
        settings.save(update_fields=['template_fr', 'template_ar', 'updated_by', 'updated_at'])

        serializer = SmsGatewaySettingsSerializer(settings)
        return Response({
            "message": "Modèles réinitialisés avec succès.",
            "settings": serializer.data
        }, status=status.HTTP_200_OK)
