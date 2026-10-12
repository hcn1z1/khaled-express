import uuid
from django.db import models
from django.utils import timezone

class MockSmsStatus(models.TextChoices):
    QUEUED = 'QUEUED', 'En attente'
    SENT = 'SENT', 'Envoyé'
    FAILED = 'FAILED', 'Échec'

class SmsGatewaySettings(models.Model):
    """
    Configuration for Android SMS Gateway (capcom6/android-sms-gateway).
    Allows moderators and admins to connect their Android phone to the admin panel
    and customize message templates with dynamic placeholders.
    """
    DEFAULT_TEMPLATE_FR = (
        "Khaled Express : Votre colis {tracking_code} est disponible au bureau {destination_office} ({destination_address}). "
        "Vous pouvez venir le retirer. Tél: {destination_phone}"
    )
    DEFAULT_TEMPLATE_AR = (
        "خالد إكسبريس: طردكم رقم {tracking_code} قد وصل إلى {destination_office} ({destination_address}). "
        "يمكنكم استلامه الآن. هاتف المكتب: {destination_phone}"
    )

    is_enabled = models.BooleanField(
        default=True,
        help_text="Activer la passerelle Android SMS Gateway"
    )
    gateway_url = models.CharField(
        max_length=500,
        default="http://192.168.1.100:8080/message",
        help_text="URL de l'API de l'application Android (ex: http://192.168.1.50:8080/message ou https://api.sms-gate.app/3rdparty/v1/message)"
    )
    username = models.CharField(
        max_length=100,
        blank=True,
        default="sms",
        help_text="Identifiant HTTP Basic de l'application Android (laisser vide si Bearer Token)"
    )
    password = models.TextField(
        blank=True,
        default="",
        help_text="Mot de passe HTTP Basic ou Token JWT / Bearer de l'application Android"
    )
    device_name = models.CharField(
        max_length=100,
        blank=True,
        default="Mon Téléphone Android (Gateway)",
        help_text="Nom d'identification du téléphone"
    )
    template_fr = models.TextField(
        default=DEFAULT_TEMPLATE_FR,
        help_text="Modèle SMS en Français. Variables disponibles: {tracking_code}, {destination_office}, {destination_address}, {destination_phone}, {recipient_name}, {fee_amount}, {payment_status}"
    )
    template_ar = models.TextField(
        default=DEFAULT_TEMPLATE_AR,
        help_text="Modèle SMS en Arabe. Variables disponibles: {tracking_code}, {destination_office}, {destination_address}, {destination_phone}, {recipient_name}, {fee_amount}, {payment_status}"
    )
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        'core.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='updated_sms_settings'
    )

    class Meta:
        verbose_name = "Configuration Passerelle SMS"
        verbose_name_plural = "Configurations Passerelle SMS"

    @classmethod
    def get_settings(cls):
        settings, _ = cls.objects.get_or_create(id=1)
        return settings

    def render_template(self, parcel, language: str) -> str:
        template = self.template_ar if language == 'ar' else self.template_fr
        if not template:
            template = self.DEFAULT_TEMPLATE_AR if language == 'ar' else self.DEFAULT_TEMPLATE_FR

        dest = getattr(parcel, 'destination_office', None)
        dest_name = (dest.name_ar if language == 'ar' else dest.name_fr) if dest else ''
        dest_address = (dest.address_ar if language == 'ar' else dest.address_fr) if dest else ''
        dest_phone = dest.phone if dest else ''
        
        is_paid = getattr(parcel, 'payment_status', '') == 'PAID'
        payment_text = (
            ("مدفوع" if is_paid else "غير مدفوع")
            if language == 'ar'
            else ("Payé" if is_paid else "Non payé")
        )

        replacements = {
            '{tracking_code}': getattr(parcel, 'tracking_code', '') or '',
            '{destination_office}': dest_name,
            '{destination_address}': dest_address,
            '{destination_phone}': dest_phone,
            '{recipient_name}': getattr(parcel, 'recipient_name', '') or '',
            '{fee_amount}': str(getattr(parcel, 'fee_amount', '') or '0'),
            '{payment_status}': payment_text,
        }

        rendered = template
        for key, val in replacements.items():
            rendered = rendered.replace(key, val)
        return rendered

    def __str__(self):
        status_str = "Activée" if self.is_enabled else "Désactivée"
        return f"Passerelle SMS ({status_str}) - {self.gateway_url}"


class MockSmsOutbox(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    parcel = models.ForeignKey(
        'parcels.Parcel',
        on_delete=models.CASCADE,
        related_name='sms_outbox_entries'
    )
    recipient_phone = models.CharField(max_length=30)
    language = models.CharField(max_length=5, default='fr')
    message_body = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=MockSmsStatus.choices,
        default=MockSmsStatus.QUEUED
    )
    idempotency_key = models.CharField(
        max_length=100,
        unique=True,
        db_index=True,
        help_text="Clé d'idempotence pour éviter les SMS en double lors des réessais"
    )
    queued_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    delivery_report = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-queued_at']

    def mark_sent(self, provider="MockSmsAdapter", report_data=None):
        self.status = MockSmsStatus.SENT
        self.sent_at = timezone.now()
        report = {"provider": provider, "code": "OK_200", "delivered": True}
        if report_data:
            report.update(report_data)
        self.delivery_report = report
        self.save(update_fields=['status', 'sent_at', 'delivery_report'])

    def mark_failed(self, provider="AndroidSmsGateway", error="Erreur d'envoi"):
        self.status = MockSmsStatus.FAILED
        self.delivery_report = {"provider": provider, "error": error, "delivered": False}
        self.save(update_fields=['status', 'delivery_report'])

    def __str__(self):
        return f"SMS to {self.recipient_phone} ({self.status}) - {self.parcel.tracking_code}"
