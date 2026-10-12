from decimal import Decimal
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from core.models import User, Office
from parcels.models import Parcel

class PaymentMethod(models.TextChoices):
    CASH = 'CASH', _('Espèces (Cash DZD)')
    BARIDIMOB = 'BARIDIMOB', _('BaridiMob / CCP')
    CHECK = 'CHECK', _('Chèque')
    OTHER = 'OTHER', _('Autre')

class ExpenseCategory(models.TextChoices):
    TRANSPORT_FUEL = 'FUEL', _('Carburant & Transport')
    OFFICE_RENT = 'RENT', _('Loyer Agence')
    VEHICLE_MAINTENANCE = 'MAINTENANCE', _('Entretien Véhicule')
    SALARY = 'SALARY', _('Salaires & Primes')
    SUPPLIES = 'SUPPLIES', _('Fournitures & Emballages')
    OTHER = 'OTHER', _('Autres Dépenses')

class PaymentEntry(models.Model):
    parcel = models.ForeignKey(
        Parcel,
        on_delete=models.CASCADE,
        related_name='payment_entries',
        help_text="Colis associé à l'encaissement"
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Montant reçu en DZD"
    )
    payment_method = models.CharField(
        max_length=20,
        choices=PaymentMethod.choices,
        default=PaymentMethod.CASH
    )
    recorded_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='recorded_payments',
        help_text="Administrateur ayant enregistré le paiement"
    )
    recorded_at = models.DateTimeField(default=timezone.now)
    reference = models.CharField(max_length=100, blank=True, help_text="Numéro de reçu ou référence BaridiMob")
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-recorded_at']

    def __str__(self):
        return f"Payment {self.amount} DZD for {self.parcel.tracking_code} ({self.payment_method})"


class ExpenseEntry(models.Model):
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Montant dépensé en DZD"
    )
    category = models.CharField(
        max_length=20,
        choices=ExpenseCategory.choices,
        default=ExpenseCategory.OTHER
    )
    office = models.ForeignKey(
        Office,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='expenses',
        help_text="Agence concernée par la dépense (optionnel)"
    )
    description = models.CharField(max_length=255)
    recorded_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='recorded_expenses',
        help_text="Administrateur ayant enregistré la dépense"
    )
    date = models.DateField(default=timezone.localdate)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"Expense {self.amount} DZD ({self.get_category_display()}): {self.description}"
