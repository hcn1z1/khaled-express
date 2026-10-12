import random
import string
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.utils import timezone


class Office(models.Model):
    CODE_ALGIERS = 'ALG'
    CODE_EL_EULMA = 'EUL'
    OFFICE_CHOICES = [
        (CODE_ALGIERS, 'Alger (Algiers)'),
        (CODE_EL_EULMA, 'El Eulma (Sétif)'),
    ]

    code = models.CharField(max_length=10, primary_key=True, choices=OFFICE_CHOICES)
    name_fr = models.CharField(max_length=100)
    name_ar = models.CharField(max_length=100)
    address_fr = models.CharField(max_length=255)
    address_ar = models.CharField(max_length=255)
    phone = models.CharField(max_length=30)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.code} - {self.name_fr} / {self.name_ar}"


class User(AbstractUser):
    ROLE_ADMIN = 'ADMIN'
    ROLE_MODERATOR = 'MODERATOR'
    ROLE_CUSTOMER = 'CUSTOMER'

    ROLE_CHOICES = [
        (ROLE_ADMIN, 'Admin (Finance & Operations)'),
        (ROLE_MODERATOR, 'Moderator (Operations Only)'),
        (ROLE_CUSTOMER, 'Customer (Self-service)'),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_CUSTOMER)
    phone = models.CharField(max_length=30, unique=True, null=True, blank=True)
    preferred_language = models.CharField(max_length=5, choices=[('fr', 'Français'), ('ar', 'العربية')], default='fr')
    assigned_office = models.ForeignKey(Office, on_delete=models.SET_NULL, null=True, blank=True, related_name='staff_members')

    @property
    def is_staff_member(self):
        return self.role in [self.ROLE_ADMIN, self.ROLE_MODERATOR] or self.is_superuser

    @property
    def can_access_finance(self):
        return self.role == self.ROLE_ADMIN or self.is_superuser


def generate_tracking_number(origin_code, destination_code):
    digits = ''.join(random.choices(string.digits, k=6))
    return f"KE-{origin_code}-{destination_code}-{digits}"


class Parcel(models.Model):
    STATUS_PENDING_DROPOFF = 'PENDING_DROPOFF'
    STATUS_INTAKE = 'INTAKE'
    STATUS_DISPATCHED = 'DISPATCHED'
    STATUS_ARRIVED = 'ARRIVED'
    STATUS_DELIVERED = 'DELIVERED'
    STATUS_CANCELLED = 'CANCELLED'

    STATUS_CHOICES = [
        (STATUS_PENDING_DROPOFF, 'En attente de dépôt / في انتظار التسليم'),
        (STATUS_INTAKE, 'Enregistré en agence / تم التسجيل في المكتب'),
        (STATUS_DISPATCHED, 'En transit / في الطريق'),
        (STATUS_ARRIVED, 'Arrivé - Prêt pour retrait / وصل - جاهز للاستلام'),
        (STATUS_DELIVERED, 'Livré au destinataire / تم التسليم'),
        (STATUS_CANCELLED, 'Annulé / ملغى'),
    ]

    tracking_number = models.CharField(max_length=32, unique=True, db_index=True)
    barcode_data = models.CharField(max_length=64, blank=True)

    # Fixed two offices rule: only ALG or EUL
    origin_office = models.ForeignKey(Office, on_delete=models.PROTECT, related_name='origin_parcels')
    destination_office = models.ForeignKey(Office, on_delete=models.PROTECT, related_name='destination_parcels')
    current_office = models.ForeignKey(Office, on_delete=models.SET_NULL, null=True, blank=True, related_name='held_parcels')

    # Sender info
    sender_name = models.CharField(max_length=120)
    sender_phone = models.CharField(max_length=30)
    sender_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='sent_parcels')

    # Recipient info
    recipient_name = models.CharField(max_length=120)
    recipient_phone = models.CharField(max_length=30)
    recipient_notes = models.TextField(blank=True, default='')

    # Parcel details
    description = models.CharField(max_length=255, default='Colis standard')
    weight_kg = models.DecimalField(max_digits=6, decimal_places=2, default=1.0)
    
    # Financials (Amounts in DZD)
    fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.0, help_text="Montant en Dinar Algérien (DZD)")
    
    status = models.CharField(max_length=25, choices=STATUS_CHOICES, default=STATUS_PENDING_DROPOFF, db_index=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_parcels')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        super().clean()
        valid_offices = [Office.CODE_ALGIERS, Office.CODE_EL_EULMA]
        if self.origin_office_id not in valid_offices:
            raise ValidationError(f"Origine non autorisée: {self.origin_office_id}. Seuls Alger et El Eulma sont supportés.")
        if self.destination_office_id not in valid_offices:
            raise ValidationError(f"Destination non autorisée: {self.destination_office_id}. Seuls Alger et El Eulma sont supportés.")
        if self.origin_office_id == self.destination_office_id:
            raise ValidationError("L'origine et la destination doivent être différentes (Alger <-> El Eulma).")

    def save(self, *args, **kwargs):
        if not self.tracking_number:
            self.tracking_number = generate_tracking_number(
                self.origin_office_id or 'ALG',
                self.destination_office_id or 'EUL'
            )
        if not self.barcode_data:
            self.barcode_data = self.tracking_number
        if not self.current_office and self.status == self.STATUS_INTAKE:
            self.current_office = self.origin_office
        self.full_clean()
        super().save(*args, **kwargs)

    @property
    def total_paid(self):
        payments = self.payments.all()
        return sum(p.amount for p in payments)

    @property
    def is_paid(self):
        return self.total_paid >= self.fee and self.fee > 0

    def __str__(self):
        return f"{self.tracking_number} ({self.origin_office_id} -> {self.destination_office_id}): {self.status}"


class ScanEvent(models.Model):
    EVENT_DROPOFF_REQUEST = 'DROPOFF_REQUEST'
    EVENT_INTAKE = 'INTAKE_SCAN'
    EVENT_DISPATCH = 'DISPATCH_SCAN'
    EVENT_ARRIVAL = 'ARRIVAL_SCAN'
    EVENT_PICKUP = 'PICKUP_SCAN'

    EVENT_CHOICES = [
        (EVENT_DROPOFF_REQUEST, 'Création demande de dépôt / طلب إيداع'),
        (EVENT_INTAKE, 'Enregistrement & Dépôt physique / مسح الاستلام بالمكتب'),
        (EVENT_DISPATCH, 'Scan Expédition / مسح الإرسال والتوجيه'),
        (EVENT_ARRIVAL, 'Scan Arrivée / مسح الوصول'),
        (EVENT_PICKUP, 'Remise au destinataire / تسليم للزبون'),
    ]

    parcel = models.ForeignKey(Parcel, on_delete=models.CASCADE, related_name='scan_events')
    event_type = models.CharField(max_length=30, choices=EVENT_CHOICES)
    office = models.ForeignKey(Office, on_delete=models.PROTECT)
    performed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    timestamp = models.DateTimeField(default=timezone.now)
    notes = models.CharField(max_length=255, blank=True, default='')

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.event_type} on {self.parcel.tracking_number} at {self.office_id} ({self.timestamp:%Y-%m-%d %H:%M})"


class PaymentEntry(models.Model):
    METHOD_CASH = 'CASH'
    METHOD_BARIDIMOB = 'BARIDIMOB'
    METHOD_CARD = 'CARD'

    METHOD_CHOICES = [
        (METHOD_CASH, 'Espèces (Cash) / نقداً'),
        (METHOD_BARIDIMOB, 'BaridiMob / بريدي موب'),
        (METHOD_CARD, 'Carte Edahabia / CIB / بطاقة'),
    ]

    parcel = models.ForeignKey(Parcel, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2, help_text="Montant en DZD")
    payment_method = models.CharField(max_length=20, choices=METHOD_CHOICES, default=METHOD_CASH)
    recorded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    notes = models.CharField(max_length=255, blank=True, default='')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.amount} DZD for {self.parcel.tracking_number} ({self.payment_method})"


class ExpenseEntry(models.Model):
    CATEGORY_FUEL = 'FUEL'
    CATEGORY_PACKAGING = 'PACKAGING'
    CATEGORY_RENT = 'RENT'
    CATEGORY_SALARY = 'SALARY'
    CATEGORY_MAINTENANCE = 'MAINTENANCE'
    CATEGORY_OTHER = 'OTHER'

    CATEGORY_CHOICES = [
        (CATEGORY_FUEL, 'Carburant & Transport / وقود ونقل'),
        (CATEGORY_PACKAGING, 'Emballage & Étiquettes / تغليف وملصقات'),
        (CATEGORY_RENT, 'Loyer & Charges / كراء ومصاريف'),
        (CATEGORY_SALARY, 'Salaires / أجور'),
        (CATEGORY_MAINTENANCE, 'Maintenance / صيانة'),
        (CATEGORY_OTHER, 'Autre dépense / مصاريف أخرى'),
    ]

    office = models.ForeignKey(Office, on_delete=models.PROTECT, related_name='expenses')
    amount = models.DecimalField(max_digits=10, decimal_places=2, help_text="Montant en DZD")
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default=CATEGORY_OTHER)
    description = models.CharField(max_length=255)
    recorded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Expense: {self.amount} DZD at {self.office_id} ({self.category})"


class SmsOutbox(models.Model):
    STATUS_QUEUED = 'QUEUED'
    STATUS_SENT = 'SENT'
    STATUS_FAILED = 'FAILED'

    STATUS_CHOICES = [
        (STATUS_QUEUED, 'En file d\'attente / في الانتظار'),
        (STATUS_SENT, 'Envoyé / تم الإرسال'),
        (STATUS_FAILED, 'Échec / فشل'),
    ]

    parcel = models.ForeignKey(Parcel, on_delete=models.CASCADE, related_name='sms_notifications')
    recipient_phone = models.CharField(max_length=30)
    language = models.CharField(max_length=5, default='fr')
    message_body = models.TextField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default=STATUS_QUEUED)
    idempotency_key = models.CharField(max_length=100, unique=True, db_index=True)
    created_at = models.DateTimeField(default=timezone.now)
    sent_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"SMS to {self.recipient_phone} ({self.status}) for {self.parcel.tracking_number}"
