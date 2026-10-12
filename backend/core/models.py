from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _

class OfficeChoices(models.TextChoices):
    ALGIERS = 'ALGIERS', _('Alger (Algiers)')
    EL_EULMA = 'EL_EULMA', _('El Eulma (Sétif)')

class Office(models.Model):
    code = models.CharField(
        max_length=20,
        choices=OfficeChoices.choices,
        unique=True,
        help_text="Code unique de l'agence (ALGIERS ou EL_EULMA)"
    )
    name_fr = models.CharField(max_length=100)
    name_ar = models.CharField(max_length=100)
    wilaya = models.CharField(max_length=50)
    address_fr = models.CharField(max_length=255)
    address_ar = models.CharField(max_length=255)
    phone = models.CharField(max_length=30)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name_fr} ({self.code})"


class UserManager(BaseUserManager):
    def create_user(self, phone_number, password=None, **extra_fields):
        if not phone_number:
            raise ValueError(_('Le numéro de téléphone est obligatoire.'))
        phone_number = phone_number.strip().replace(' ', '')
        extra_fields.setdefault('username', phone_number)
        user = self.model(phone_number=phone_number, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone_number, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', User.Role.ADMIN)
        return self.create_user(phone_number, password, **extra_fields)


class User(AbstractUser):
    class Role(models.TextChoices):
        CUSTOMER = 'CUSTOMER', _('Client')
        MODERATOR = 'MODERATOR', _('Opérateur / Modérateur')
        ADMIN = 'ADMIN', _('Administrateur')

    class Language(models.TextChoices):
        FR = 'fr', _('Français')
        AR = 'ar', _('العربية')

    phone_number = models.CharField(
        max_length=30,
        unique=True,
        help_text="Numéro de téléphone algérien (ex: 0550123456, 0661123456, 0770123456)"
    )
    full_name = models.CharField(max_length=150, blank=True)
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.CUSTOMER
    )
    assigned_office = models.ForeignKey(
        Office,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='staff_members',
        help_text="Agence de rattachement pour les opérateurs"
    )
    preferred_language = models.CharField(
        max_length=5,
        choices=Language.choices,
        default=Language.FR
    )

    USERNAME_FIELD = 'phone_number'
    REQUIRED_FIELDS = ['full_name']

    objects = UserManager()

    def __str__(self):
        role_label = self.get_role_display()
        return f"{self.full_name or self.phone_number} [{role_label}]"
