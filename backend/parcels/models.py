import uuid
from decimal import Decimal
from django.db import models
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from core.models import User, Office

class ParcelStatus(models.TextChoices):
    REQUESTED = 'REQUESTED', _('Demande créée (En attente de dépôt)')
    RECEIVED_AT_ORIGIN = 'RECEIVED_AT_ORIGIN', _('Enregistré à l’agence départ')
    DISPATCHED = 'DISPATCHED', _('En transit / Expédié')
    RECEIVED_AT_DESTINATION = 'RECEIVED_AT_DESTINATION', _('Arrivé / Prêt pour retrait')
    DELIVERED = 'DELIVERED', _('Remis au destinataire')
    CANCELLED = 'CANCELLED', _('Annulé')

class PaymentStatus(models.TextChoices):
    UNPAID = 'UNPAID', _('Non payé')
    PARTIALLY_PAID = 'PARTIALLY_PAID', _('Partiellement payé')
    PAID = 'PAID', _('Payé')

class ScanEventType(models.TextChoices):
    INTAKE = 'INTAKE', _('Dépôt / Réception Agence Départ')
    DISPATCH = 'DISPATCH', _('Départ / Envoi vers Destination')
    ARRIVAL = 'ARRIVAL', _('Arrivée à l’Agence Destination')
    PICKUP = 'PICKUP', _('Remise au Destinataire')

class Parcel(models.Model):
    tracking_code = models.CharField(
        max_length=32,
        unique=True,
        db_index=True,
        help_text="Code de suivi unique Code 128 (ex: KX-ALG-EUL-123456)"
    )
    
    # Origin and Destination - Strictly the 2 fixed offices
    origin_office = models.ForeignKey(
        Office,
        on_delete=models.PROTECT,
        related_name='outgoing_parcels'
    )
    destination_office = models.ForeignKey(
        Office,
        on_delete=models.PROTECT,
        related_name='incoming_parcels'
    )

    # Sender info
    sender_customer = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sent_parcels'
    )
    sender_name = models.CharField(max_length=150)
    sender_phone = models.CharField(max_length=30)
    sender_address = models.CharField(max_length=255, blank=True)

    # Recipient info
    recipient_name = models.CharField(max_length=150)
    recipient_phone = models.CharField(max_length=30)
    recipient_address = models.CharField(max_length=255, blank=True)
    preferred_sms_language = models.CharField(
        max_length=5,
        choices=[('fr', 'Français'), ('ar', 'العربية')],
        default='fr'
    )

    # Package details
    description = models.CharField(max_length=255, default="Colis standard")
    weight_kg = models.DecimalField(max_digits=6, decimal_places=2, default=Decimal('1.00'))
    notes = models.TextField(blank=True)

    # Status & Custody
    status = models.CharField(
        max_length=30,
        choices=ParcelStatus.choices,
        default=ParcelStatus.REQUESTED,
        db_index=True
    )
    current_office = models.ForeignKey(
        Office,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='custody_parcels',
        help_text="Bureau actuel où se trouve physiquement le colis (None si en transit)"
    )

    # Finances
    fee_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('500.00'),
        help_text="Frais de transport en Dinar Algérien (DZD)"
    )
    
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='created_parcels'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def clean(self):
        super().clean()
        if self.origin_office_id and self.destination_office_id:
            if self.origin_office_id == self.destination_office_id:
                raise ValidationError(_("L'agence de départ et l'agence d'arrivée doivent être différentes."))
            
            allowed_codes = {'ALGIERS', 'EL_EULMA'}
            if self.origin_office.code not in allowed_codes or self.destination_office.code not in allowed_codes:
                raise ValidationError(_("Les transferts ne peuvent utiliser que les bureaux d'Alger et El Eulma."))

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    @property
    def total_paid(self) -> Decimal:
        """Sum of all recorded payment entries."""
        payments = self.payment_entries.all()
        return sum((p.amount for p in payments), Decimal('0.00'))

    @property
    def payment_status(self) -> str:
        paid = self.total_paid
        fee = self.fee_amount or Decimal('0.00')
        if paid >= fee and fee > Decimal('0.00'):
            return PaymentStatus.PAID
        elif paid > Decimal('0.00'):
            return PaymentStatus.PARTIALLY_PAID
        else:
            return PaymentStatus.UNPAID

    def __str__(self):
        return f"[{self.tracking_code}] {self.sender_name} -> {self.recipient_name} ({self.get_status_display()})"


class ScanEvent(models.Model):
    parcel = models.ForeignKey(
        Parcel,
        on_delete=models.CASCADE,
        related_name='scan_events'
    )
    event_type = models.CharField(
        max_length=20,
        choices=ScanEventType.choices
    )
    office = models.ForeignKey(
        Office,
        on_delete=models.PROTECT,
        related_name='scan_events'
    )
    scanned_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='scan_events'
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.event_type} on {self.parcel.tracking_code} at {self.office.code} by {self.scanned_by.full_name or self.scanned_by.phone_number}"
