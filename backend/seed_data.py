import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'khaled_express.settings')
django.setup()

from decimal import Decimal
from django.utils import timezone
from api.models import Office, User, Parcel, ScanEvent, PaymentEntry, ExpenseEntry
from api.sms_service import queue_arrival_pickup_sms

def seed():
    print("=== Seeding Khaled Express Database ===")

    # 1. Fixed Offices (Algiers and El Eulma strictly)
    alg, _ = Office.objects.get_or_create(
        code=Office.CODE_ALGIERS,
        defaults={
            'name_fr': 'Alger (Centre-Ville)',
            'name_ar': 'الجزائر العاصمة (وسط المدينة)',
            'address_fr': '14 Rue Didouche Mourad, Alger',
            'address_ar': '14 نهج ديدوش مراد، الجزائر العاصمة',
            'phone': '021 73 45 67',
            'is_active': True
        }
    )

    eul, _ = Office.objects.get_or_create(
        code=Office.CODE_EL_EULMA,
        defaults={
            'name_fr': 'El Eulma (Sétif)',
            'name_ar': 'العلمة (ولاية سطيف)',
            'address_fr': 'Boulevard Commercial de Dubaï, El Eulma',
            'address_ar': 'شارع دبي التجاري، العلمة، سطيف',
            'phone': '036 87 22 11',
            'is_active': True
        }
    )
    print(f"Offices verified: {alg.code}, {eul.code}")

    # 2. Users and Roles
    admin, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'first_name': 'Ahmed',
            'last_name': 'Khaled',
            'email': 'admin@khaled-express.dz',
            'role': User.ROLE_ADMIN,
            'phone': '0550111111',
            'assigned_office': alg,
            'preferred_language': 'fr'
        }
    )
    if created:
        admin.set_password('admin123')
        admin.is_superuser = True
        admin.is_staff = True
        admin.save()

    moderator, created = User.objects.get_or_create(
        username='moderator',
        defaults={
            'first_name': 'Amine',
            'last_name': 'Mansouri',
            'email': 'amine@khaled-express.dz',
            'role': User.ROLE_MODERATOR,
            'phone': '0550222222',
            'assigned_office': eul,
            'preferred_language': 'ar'
        }
    )
    if created:
        moderator.set_password('mod123')
        moderator.save()

    customer, created = User.objects.get_or_create(
        username='karim',
        defaults={
            'first_name': 'Karim',
            'last_name': 'Benali',
            'email': 'karim@gmail.com',
            'role': User.ROLE_CUSTOMER,
            'phone': '0661123456',
            'preferred_language': 'fr'
        }
    )
    if created:
        customer.set_password('karim123')
        customer.save()

    customer2, created = User.objects.get_or_create(
        username='samir',
        defaults={
            'first_name': 'Samir',
            'last_name': 'Kaddour',
            'email': 'samir@gmail.com',
            'role': User.ROLE_CUSTOMER,
            'phone': '0770987654',
            'preferred_language': 'ar'
        }
    )
    if created:
        customer2.set_password('samir123')
        customer2.save()

    print("Users verified: admin (Ahmed), moderator (Amine), customer (Karim), customer (Samir)")

    # 3. Sample Parcels across lifecycle
    # P1: Pending Dropoff
    p1, _ = Parcel.objects.get_or_create(
        tracking_number='KE-ALG-EUL-100201',
        defaults={
            'origin_office': alg,
            'destination_office': eul,
            'current_office': None,
            'sender_name': 'Karim Benali',
            'sender_phone': '0661123456',
            'sender_user': customer,
            'recipient_name': 'Yacine Belkacem',
            'recipient_phone': '0555987654',
            'description': 'Documents juridiques et catalogue',
            'weight_kg': Decimal('0.8'),
            'fee': Decimal('600.00'),
            'status': Parcel.STATUS_PENDING_DROPOFF,
            'created_by': customer
        }
    )
    ScanEvent.objects.get_or_create(
        parcel=p1,
        event_type=ScanEvent.EVENT_DROPOFF_REQUEST,
        defaults={'office': alg, 'performed_by': customer, 'notes': 'Demande créée en ligne'}
    )

    # P2: Intake at Algiers
    p2, _ = Parcel.objects.get_or_create(
        tracking_number='KE-ALG-EUL-100202',
        defaults={
            'origin_office': alg,
            'destination_office': eul,
            'current_office': alg,
            'sender_name': 'Karim Benali',
            'sender_phone': '0661123456',
            'sender_user': customer,
            'recipient_name': 'Hichem Sétifi',
            'recipient_phone': '0660443322',
            'description': 'Pièces détachées électroniques',
            'weight_kg': Decimal('3.5'),
            'fee': Decimal('1200.00'),
            'status': Parcel.STATUS_INTAKE,
            'created_by': admin
        }
    )
    ScanEvent.objects.get_or_create(
        parcel=p2,
        event_type=ScanEvent.EVENT_INTAKE,
        defaults={'office': alg, 'performed_by': admin, 'notes': 'Dépôt physique et étiquetage 80mm'}
    )

    # P3: Dispatched (In Transit)
    p3, _ = Parcel.objects.get_or_create(
        tracking_number='KE-ALG-EUL-100203',
        defaults={
            'origin_office': alg,
            'destination_office': eul,
            'current_office': None,
            'sender_name': 'Sarl Agro Alger',
            'sender_phone': '021665544',
            'recipient_name': 'Boutique Dubaï Mall',
            'recipient_phone': '0662334455',
            'description': 'Échantillons textiles',
            'weight_kg': Decimal('5.0'),
            'fee': Decimal('1500.00'),
            'status': Parcel.STATUS_DISPATCHED,
            'created_by': admin
        }
    )
    ScanEvent.objects.get_or_create(
        parcel=p3,
        event_type=ScanEvent.EVENT_DISPATCH,
        defaults={'office': alg, 'performed_by': admin, 'notes': 'Départ navette Alger -> El Eulma'}
    )

    # P4: Arrived at El Eulma (Ready for pickup with mock SMS)
    p4, _ = Parcel.objects.get_or_create(
        tracking_number='KE-ALG-EUL-100204',
        defaults={
            'origin_office': alg,
            'destination_office': eul,
            'current_office': eul,
            'sender_name': 'Nadia Merad',
            'sender_phone': '0551223344',
            'recipient_name': 'Mourad Bouzid',
            'recipient_phone': '0669112233',
            'description': 'Colis vêtements',
            'weight_kg': Decimal('2.0'),
            'fee': Decimal('900.00'),
            'status': Parcel.STATUS_ARRIVED,
            'created_by': admin
        }
    )
    ScanEvent.objects.get_or_create(
        parcel=p4,
        event_type=ScanEvent.EVENT_ARRIVAL,
        defaults={'office': eul, 'performed_by': moderator, 'notes': 'Réception agence El Eulma'}
    )
    queue_arrival_pickup_sms(p4, language='ar')

    # P5: Delivered Unpaid (Handoff without payment - critical test case)
    p5, _ = Parcel.objects.get_or_create(
        tracking_number='KE-EUL-ALG-200301',
        defaults={
            'origin_office': eul,
            'destination_office': alg,
            'current_office': alg,
            'sender_name': 'Samir Kaddour',
            'sender_phone': '0770987654',
            'sender_user': customer2,
            'recipient_name': 'Farid Algiers Tech',
            'recipient_phone': '0555123123',
            'description': 'Matériel informatique',
            'weight_kg': Decimal('4.2'),
            'fee': Decimal('1400.00'),
            'status': Parcel.STATUS_DELIVERED,
            'created_by': moderator
        }
    )
    ScanEvent.objects.get_or_create(
        parcel=p5,
        event_type=ScanEvent.EVENT_PICKUP,
        defaults={'office': alg, 'performed_by': admin, 'notes': 'Remis au client - En attente règlement'}
    )

    # P6: Delivered and Paid
    p6, _ = Parcel.objects.get_or_create(
        tracking_number='KE-EUL-ALG-200302',
        defaults={
            'origin_office': eul,
            'destination_office': alg,
            'current_office': alg,
            'sender_name': 'Comptoir El Eulma',
            'sender_phone': '036879988',
            'recipient_name': 'Rachid Belhadj',
            'recipient_phone': '0554998877',
            'description': 'Accessoires automobiles',
            'weight_kg': Decimal('6.0'),
            'fee': Decimal('1800.00'),
            'status': Parcel.STATUS_DELIVERED,
            'created_by': moderator
        }
    )
    ScanEvent.objects.get_or_create(
        parcel=p6,
        event_type=ScanEvent.EVENT_PICKUP,
        defaults={'office': alg, 'performed_by': admin, 'notes': 'Livré et acquitté'}
    )
    PaymentEntry.objects.get_or_create(
        parcel=p6,
        defaults={
            'amount': Decimal('1800.00'),
            'payment_method': PaymentEntry.METHOD_CASH,
            'recorded_by': admin,
            'notes': 'Règlement espèces au retrait'
        }
    )

    # 4. Financial Entries
    ExpenseEntry.objects.get_or_create(
        description='Carburant navette Alger - El Eulma',
        defaults={
            'office': alg,
            'amount': Decimal('4500.00'),
            'category': ExpenseEntry.CATEGORY_FUEL,
            'recorded_by': admin
        }
    )
    ExpenseEntry.objects.get_or_create(
        description='Rouleaux étiquettes 80mm thermiques',
        defaults={
            'office': eul,
            'amount': Decimal('2200.00'),
            'category': ExpenseEntry.CATEGORY_PACKAGING,
            'recorded_by': admin
        }
    )

    print("Seed complete! Sample parcels, scan events, mock SMS, and financial records created.")

if __name__ == '__main__':
    seed()
