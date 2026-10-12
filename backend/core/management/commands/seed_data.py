from decimal import Decimal
from django.core.management.base import BaseCommand
from rest_framework.authtoken.models import Token
from core.models import Office, User
from parcels.models import Parcel, ScanEvent, ParcelStatus, ScanEventType
from parcels.utils import generate_tracking_code
from finance.models import PaymentEntry, ExpenseEntry, PaymentMethod, ExpenseCategory
from notifications.models import MockSmsOutbox, MockSmsStatus

class Command(BaseCommand):
    help = 'Seeds initial offices, staff, customer accounts and sample parcels for Khaled Express'

    def handle(self, *args, **options):
        self.stdout.write("Seeding Khaled Express database...")

        # 1. Fixed Offices
        office_algiers, _ = Office.objects.get_or_create(
            code='ALGIERS',
            defaults={
                'name_fr': 'Agence Alger Centre',
                'name_ar': 'وكالة الجزائر الوسطى',
                'wilaya': '16 - Alger',
                'address_fr': '04 Rue Didouche Mourad, Alger Centre',
                'address_ar': '04 شارع ديدوش مراد، الجزائر الوسطى',
                'phone': '021 73 45 67',
            }
        )

        office_eulma, _ = Office.objects.get_or_create(
            code='EL_EULMA',
            defaults={
                'name_fr': 'Agence El Eulma (Sétif)',
                'name_ar': 'وكالة العلمة (سطيف)',
                'wilaya': '19 - Sétif',
                'address_fr': 'Boulevard de la République (Secteur Commercial), El Eulma',
                'address_ar': 'شارع الجمهورية (المنطقة التجارية)، العلمة',
                'phone': '036 87 12 34',
            }
        )
        self.stdout.write(self.style.SUCCESS(f"Offices verified: {office_algiers.code}, {office_eulma.code}"))

        # 2. Users
        # Admin
        admin_user, created_admin = User.objects.get_or_create(
            phone_number='0555000001',
            defaults={
                'username': '0555000001',
                'full_name': 'Khaled Admin Principal',
                'role': User.Role.ADMIN,
                'is_staff': True,
                'is_superuser': True,
                'preferred_language': 'fr',
            }
        )
        if created_admin:
            admin_user.set_password('admin1234')
            admin_user.save()

        # Moderator (Staff Algiers)
        mod_user, created_mod = User.objects.get_or_create(
            phone_number='0555000002',
            defaults={
                'username': '0555000002',
                'full_name': 'Karim Opérateur Alger',
                'role': User.Role.MODERATOR,
                'is_staff': True,
                'assigned_office': office_algiers,
                'preferred_language': 'fr',
            }
        )
        if created_mod:
            mod_user.set_password('staff1234')
            mod_user.save()

        # Moderator (Staff El Eulma)
        mod_eulma, created_mod_eul = User.objects.get_or_create(
            phone_number='0555000003',
            defaults={
                'username': '0555000003',
                'full_name': 'Yacine Opérateur El Eulma',
                'role': User.Role.MODERATOR,
                'is_staff': True,
                'assigned_office': office_eulma,
                'preferred_language': 'ar',
            }
        )
        if created_mod_eul:
            mod_eulma.set_password('staff1234')
            mod_eulma.save()

        # Customer 1
        customer_1, created_c1 = User.objects.get_or_create(
            phone_number='0661123456',
            defaults={
                'username': '0661123456',
                'full_name': 'Amine Bouzid',
                'role': User.Role.CUSTOMER,
                'preferred_language': 'fr',
            }
        )
        if created_c1:
            customer_1.set_password('client1234')
            customer_1.save()

        # Customer 2
        customer_2, created_c2 = User.objects.get_or_create(
            phone_number='0770987654',
            defaults={
                'username': '0770987654',
                'full_name': 'Fatima Zohra Mansouri',
                'role': User.Role.CUSTOMER,
                'preferred_language': 'ar',
            }
        )
        if created_c2:
            customer_2.set_password('client1234')
            customer_2.save()

        self.stdout.write(self.style.SUCCESS("Users seeded: Admin, Moderators, Customers."))

        for u in [admin_user, mod_user, mod_eulma, customer_1, customer_2]:
            Token.objects.get_or_create(user=u)

        # 3. Sample Parcels across the workflow
        # Parcel 1: REQUESTED (Online customer request waiting dropoff)
        if not Parcel.objects.filter(sender_customer=customer_1).exists():
            p1 = Parcel.objects.create(
                tracking_code=generate_tracking_code(office_algiers.code, office_eulma.code),
                origin_office=office_algiers,
                destination_office=office_eulma,
                sender_customer=customer_1,
                sender_name=customer_1.full_name,
                sender_phone=customer_1.phone_number,
                sender_address="Bab El Oued, Alger",
                recipient_name="Sofiane Khelil",
                recipient_phone="0551234567",
                recipient_address="Cité 500 logts, El Eulma",
                description="Pièces de rechange auto",
                weight_kg=Decimal('3.50'),
                fee_amount=Decimal('800.00'),
                status=ParcelStatus.REQUESTED,
                created_by=customer_1,
                preferred_sms_language='fr'
            )

            # Parcel 2: RECEIVED_AT_ORIGIN (Intake completed)
            p2 = Parcel.objects.create(
                tracking_code=generate_tracking_code(office_algiers.code, office_eulma.code),
                origin_office=office_algiers,
                destination_office=office_eulma,
                sender_customer=customer_1,
                sender_name=customer_1.full_name,
                sender_phone=customer_1.phone_number,
                sender_address="Hydra, Alger",
                recipient_name="Samir Berrached",
                recipient_phone="0662345678",
                recipient_address="Centre-ville El Eulma",
                description="Dossier commercial urgent",
                weight_kg=Decimal('0.50'),
                fee_amount=Decimal('500.00'),
                status=ParcelStatus.RECEIVED_AT_ORIGIN,
                current_office=office_algiers,
                created_by=mod_user,
                preferred_sms_language='fr'
            )
            ScanEvent.objects.create(
                parcel=p2,
                event_type=ScanEventType.INTAKE,
                office=office_algiers,
                scanned_by=mod_user,
                notes="Dépôt au comptoir Alger Centre"
            )

            # Parcel 3: DISPATCHED (In transit from El Eulma to Algiers)
            p3 = Parcel.objects.create(
                tracking_code=generate_tracking_code(office_eulma.code, office_algiers.code),
                origin_office=office_eulma,
                destination_office=office_algiers,
                sender_customer=customer_2,
                sender_name=customer_2.full_name,
                sender_phone=customer_2.phone_number,
                sender_address="Zone commerciale El Eulma",
                recipient_name="Nadia Merabet",
                recipient_phone="0771239876",
                recipient_address="El Biar, Alger",
                description="Électronique & Accessoires",
                weight_kg=Decimal('2.20'),
                fee_amount=Decimal('750.00'),
                status=ParcelStatus.DISPATCHED,
                current_office=None,
                created_by=mod_eulma,
                preferred_sms_language='ar'
            )
            ScanEvent.objects.create(
                parcel=p3,
                event_type=ScanEventType.INTAKE,
                office=office_eulma,
                scanned_by=mod_eulma,
                notes="Dépôt comptoir El Eulma"
            )
            ScanEvent.objects.create(
                parcel=p3,
                event_type=ScanEventType.DISPATCH,
                office=office_eulma,
                scanned_by=mod_eulma,
                notes="Départ navette quotidienne Sétif -> Alger"
            )

            # Parcel 4: RECEIVED_AT_DESTINATION (Ready for pickup, with Mock SMS outbox entry)
            p4 = Parcel.objects.create(
                tracking_code=generate_tracking_code(office_algiers.code, office_eulma.code),
                origin_office=office_algiers,
                destination_office=office_eulma,
                sender_name="Mohamed Larbi",
                sender_phone="0550112233",
                sender_address="Belouizdad, Alger",
                recipient_name="Bilal Chennoufi",
                recipient_phone="0660445566",
                recipient_address="El Eulma",
                description="Colis textile",
                weight_kg=Decimal('4.00'),
                fee_amount=Decimal('900.00'),
                status=ParcelStatus.RECEIVED_AT_DESTINATION,
                current_office=office_eulma,
                created_by=admin_user,
                preferred_sms_language='ar'
            )
            ScanEvent.objects.create(
                parcel=p4,
                event_type=ScanEventType.INTAKE,
                office=office_algiers,
                scanned_by=mod_user,
            )
            ScanEvent.objects.create(
                parcel=p4,
                event_type=ScanEventType.DISPATCH,
                office=office_algiers,
                scanned_by=mod_user,
            )
            ScanEvent.objects.create(
                parcel=p4,
                event_type=ScanEventType.ARRIVAL,
                office=office_eulma,
                scanned_by=mod_eulma,
                notes="Colis réceptionné et rangé en casier A-12"
            )
            MockSmsOutbox.objects.create(
                parcel=p4,
                recipient_phone=p4.recipient_phone,
                language='ar',
                message_body=(
                    f"خالد إكسبريس: طردكم رقم {p4.tracking_code} قد وصل إلى {office_eulma.name_ar}. "
                    f"يمكنكم استلامه الآن. هاتف المكتب: {office_eulma.phone}"
                ),
                status=MockSmsStatus.SENT,
                idempotency_key=f"arrival_pickup_sms_{p4.id}"
            )

            # Parcel 5: DELIVERED (Handed over, paid)
            p5 = Parcel.objects.create(
                tracking_code=generate_tracking_code(office_eulma.code, office_algiers.code),
                origin_office=office_eulma,
                destination_office=office_algiers,
                sender_name="Sarl Export Eulma",
                sender_phone="036879900",
                recipient_name="Eurl Quincaillerie Alger",
                recipient_phone="021731122",
                description="Outillage professionnel",
                weight_kg=Decimal('8.50'),
                fee_amount=Decimal('1500.00'),
                status=ParcelStatus.DELIVERED,
                current_office=office_algiers,
                created_by=admin_user,
                preferred_sms_language='fr'
            )
            ScanEvent.objects.create(parcel=p5, event_type=ScanEventType.INTAKE, office=office_eulma, scanned_by=mod_eulma)
            ScanEvent.objects.create(parcel=p5, event_type=ScanEventType.DISPATCH, office=office_eulma, scanned_by=mod_eulma)
            ScanEvent.objects.create(parcel=p5, event_type=ScanEventType.ARRIVAL, office=office_algiers, scanned_by=mod_user)
            ScanEvent.objects.create(parcel=p5, event_type=ScanEventType.PICKUP, office=office_algiers, scanned_by=mod_user, notes="Remis en main propre")

            # Finance sample data
            PaymentEntry.objects.create(
                parcel=p5,
                amount=Decimal('1500.00'),
                payment_method=PaymentMethod.CASH,
                recorded_by=admin_user,
                reference="REC-2026-001",
                notes="Paiement en espèces lors du retrait"
            )

            ExpenseEntry.objects.create(
                amount=Decimal('4200.00'),
                category=ExpenseCategory.TRANSPORT_FUEL,
                office=office_algiers,
                description="Carburant navette Alger - El Eulma (Naftal)",
                recorded_by=admin_user
            )

            ExpenseEntry.objects.create(
                amount=Decimal('1500.00'),
                category=ExpenseCategory.SUPPLIES,
                office=office_eulma,
                description="Rouleaux d'étiquettes thermiques 80mm Code 128",
                recorded_by=admin_user
            )

            self.stdout.write(self.style.SUCCESS("Sample parcels and initial finance entries successfully seeded!"))
