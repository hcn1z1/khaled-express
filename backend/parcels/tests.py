from decimal import Decimal
from django.test import TestCase
from django.core.exceptions import ValidationError
from rest_framework.test import APIClient
from rest_framework import status
from core.models import Office, User
from parcels.models import Parcel, ScanEvent, ParcelStatus, ScanEventType
from parcels.utils import generate_tracking_code, generate_barcode_svg, generate_barcode_base64_png

class ParcelWorkflowTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Offices
        self.office_alg = Office.objects.create(
            code='ALGIERS', name_fr='Alger', name_ar='الجزائر',
            wilaya='Alger', address_fr='Alger Centre', address_ar='الجزائر الوسطى', phone='021000000'
        )
        self.office_eul = Office.objects.create(
            code='EL_EULMA', name_fr='El Eulma', name_ar='العلمة',
            wilaya='Sétif', address_fr='El Eulma Centre', address_ar='العلمة', phone='036000000'
        )

        # Users
        self.admin = User.objects.create_user(
            phone_number='0555000001', password='pass', role=User.Role.ADMIN, full_name='Admin Test'
        )
        self.moderator_alg = User.objects.create_user(
            phone_number='0555000002', password='pass', role=User.Role.MODERATOR,
            assigned_office=self.office_alg, full_name='Mod Alger'
        )
        self.customer_1 = User.objects.create_user(
            phone_number='0661000001', password='pass', role=User.Role.CUSTOMER, full_name='Client 1'
        )
        self.customer_2 = User.objects.create_user(
            phone_number='0661000002', password='pass', role=User.Role.CUSTOMER, full_name='Client 2'
        )

    def test_customer_and_staff_created_requests_share_same_workflow(self):
        # 1. Customer creates request online
        self.client.force_authenticate(user=self.customer_1)
        res_cust = self.client.post('/api/parcels/', {
            'origin_office': self.office_alg.id,
            'destination_office': self.office_eul.id,
            'sender_name': 'Client 1',
            'sender_phone': '0661000001',
            'recipient_name': 'Destinataire A',
            'recipient_phone': '0555112233',
            'description': 'Colis test client',
            'weight_kg': '1.50'
        }, format='json')
        self.assertEqual(res_cust.status_code, status.HTTP_201_CREATED)
        cust_parcel_id = res_cust.data['id']
        cust_parcel = Parcel.objects.get(id=cust_parcel_id)
        self.assertEqual(cust_parcel.status, ParcelStatus.REQUESTED)

        # 2. Staff creates request on behalf of customer
        self.client.force_authenticate(user=self.moderator_alg)
        res_staff = self.client.post('/api/parcels/', {
            'origin_office': self.office_alg.id,
            'destination_office': self.office_eul.id,
            'sender_name': 'Expéditeur Guichet',
            'sender_phone': '0661998877',
            'recipient_name': 'Destinataire B',
            'recipient_phone': '0555443322',
            'description': 'Colis guichet',
            'weight_kg': '2.00'
        }, format='json')
        self.assertEqual(res_staff.status_code, status.HTTP_201_CREATED)
        staff_parcel = Parcel.objects.get(id=res_staff.data['id'])
        self.assertEqual(staff_parcel.status, ParcelStatus.REQUESTED)

        # Both can proceed to intake
        res_scan_cust = self.client.post('/api/parcels/scan/', {
            'tracking_code': cust_parcel.tracking_code,
            'event_type': ScanEventType.INTAKE,
            'office_id': self.office_alg.id
        })
        self.assertEqual(res_scan_cust.status_code, status.HTTP_200_OK)
        cust_parcel.refresh_from_db()
        self.assertEqual(cust_parcel.status, ParcelStatus.RECEIVED_AT_ORIGIN)

    def test_customer_accounts_only_see_their_own_parcels(self):
        # Create parcel for customer 1
        p1 = Parcel.objects.create(
            tracking_code=generate_tracking_code(self.office_alg.code, self.office_eul.code),
            origin_office=self.office_alg, destination_office=self.office_eul,
            sender_customer=self.customer_1, sender_name='Client 1', sender_phone='0661000001',
            recipient_name='Dest 1', recipient_phone='0550000001',
            created_by=self.customer_1
        )
        # Create parcel for customer 2
        p2 = Parcel.objects.create(
            tracking_code=generate_tracking_code(self.office_alg.code, self.office_eul.code),
            origin_office=self.office_alg, destination_office=self.office_eul,
            sender_customer=self.customer_2, sender_name='Client 2', sender_phone='0661000002',
            recipient_name='Dest 2', recipient_phone='0550000002',
            created_by=self.customer_2
        )

        # Customer 1 lists parcels
        self.client.force_authenticate(user=self.customer_1)
        res1 = self.client.get('/api/parcels/')
        self.assertEqual(res1.status_code, status.HTTP_200_OK)
        results1 = [p['id'] for p in res1.data['results']] if 'results' in res1.data else [p['id'] for p in res1.data]
        self.assertIn(p1.id, results1)
        self.assertNotIn(p2.id, results1)

        # Customer 2 lists parcels
        self.client.force_authenticate(user=self.customer_2)
        res2 = self.client.get('/api/parcels/')
        results2 = [p['id'] for p in res2.data['results']] if 'results' in res2.data else [p['id'] for p in res2.data]
        self.assertIn(p2.id, results2)
        self.assertNotIn(p1.id, results2)

    def test_transfers_cannot_use_locations_outside_two_offices(self):
        # Create third office outside the two allowed
        office_oran = Office.objects.create(
            code='ORAN', name_fr='Oran', name_ar='وهران', wilaya='Oran',
            address_fr='Oran', address_ar='وهران', phone='041000000'
        )
        self.client.force_authenticate(user=self.moderator_alg)
        res = self.client.post('/api/parcels/', {
            'origin_office': self.office_alg.id,
            'destination_office': office_oran.id,
            'sender_name': 'Test',
            'sender_phone': '0661000000',
            'recipient_name': 'Test Dest',
            'recipient_phone': '0550000000',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_barcode_generation_and_ticket_availability(self):
        p = Parcel.objects.create(
            tracking_code=generate_tracking_code(self.office_alg.code, self.office_eul.code),
            origin_office=self.office_alg, destination_office=self.office_eul,
            sender_name='Client Test', sender_phone='0661000000',
            recipient_name='Dest Test', recipient_phone='0550000000',
            created_by=self.admin
        )
        self.client.force_authenticate(user=self.moderator_alg)
        res = self.client.get(f'/api/parcels/{p.id}/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data['barcode_png'].startswith('data:image/png;base64,'))
        self.assertIn('<svg', res.data['barcode_svg'])

    def test_custody_steps_and_invalid_or_duplicate_scan_prevention(self):
        p = Parcel.objects.create(
            tracking_code=generate_tracking_code(self.office_alg.code, self.office_eul.code),
            origin_office=self.office_alg, destination_office=self.office_eul,
            sender_name='Client Test', sender_phone='0661000000',
            recipient_name='Dest Test', recipient_phone='0550000000',
            status=ParcelStatus.REQUESTED,
            created_by=self.customer_1
        )
        self.client.force_authenticate(user=self.moderator_alg)

        # 1. Cannot dispatch directly while in REQUESTED status
        res_bad_disp = self.client.post('/api/parcels/scan/', {
            'tracking_code': p.tracking_code,
            'event_type': ScanEventType.DISPATCH,
            'office_id': self.office_alg.id
        })
        self.assertEqual(res_bad_disp.status_code, status.HTTP_400_BAD_REQUEST)

        # 2. Cannot arrive before dispatch
        res_bad_arr = self.client.post('/api/parcels/scan/', {
            'tracking_code': p.tracking_code,
            'event_type': ScanEventType.ARRIVAL,
            'office_id': self.office_eul.id
        })
        self.assertEqual(res_bad_arr.status_code, status.HTTP_400_BAD_REQUEST)

        # 3. Valid intake at origin
        res_intake = self.client.post('/api/parcels/scan/', {
            'tracking_code': p.tracking_code,
            'event_type': ScanEventType.INTAKE,
            'office_id': self.office_alg.id
        })
        self.assertEqual(res_intake.status_code, status.HTTP_200_OK)
        p.refresh_from_db()
        self.assertEqual(p.status, ParcelStatus.RECEIVED_AT_ORIGIN)

        # Duplicate intake is rejected
        res_dup_intake = self.client.post('/api/parcels/scan/', {
            'tracking_code': p.tracking_code,
            'event_type': ScanEventType.INTAKE,
            'office_id': self.office_alg.id
        })
        self.assertEqual(res_dup_intake.status_code, status.HTTP_400_BAD_REQUEST)

        # 4. Valid dispatch
        res_disp = self.client.post('/api/parcels/scan/', {
            'tracking_code': p.tracking_code,
            'event_type': ScanEventType.DISPATCH,
            'office_id': self.office_alg.id
        })
        self.assertEqual(res_disp.status_code, status.HTTP_200_OK)
        p.refresh_from_db()
        self.assertEqual(p.status, ParcelStatus.DISPATCHED)

        # 5. Arrival at wrong office is rejected
        res_arr_wrong = self.client.post('/api/parcels/scan/', {
            'tracking_code': p.tracking_code,
            'event_type': ScanEventType.ARRIVAL,
            'office_id': self.office_alg.id  # Destination is EL_EULMA, not ALGIERS
        })
        self.assertEqual(res_arr_wrong.status_code, status.HTTP_400_BAD_REQUEST)

        # Valid arrival at destination office
        res_arr = self.client.post('/api/parcels/scan/', {
            'tracking_code': p.tracking_code,
            'event_type': ScanEventType.ARRIVAL,
            'office_id': self.office_eul.id
        })
        self.assertEqual(res_arr.status_code, status.HTTP_200_OK)
        p.refresh_from_db()
        self.assertEqual(p.status, ParcelStatus.RECEIVED_AT_DESTINATION)

        # Duplicate arrival scan rejected
        res_dup_arr = self.client.post('/api/parcels/scan/', {
            'tracking_code': p.tracking_code,
            'event_type': ScanEventType.ARRIVAL,
            'office_id': self.office_eul.id
        })
        self.assertEqual(res_dup_arr.status_code, status.HTTP_400_BAD_REQUEST)

        # 6. Handoff/Pickup allowed even if fee unpaid!
        self.assertEqual(p.payment_status, 'UNPAID')
        res_pickup = self.client.post('/api/parcels/scan/', {
            'tracking_code': p.tracking_code,
            'event_type': ScanEventType.PICKUP,
            'office_id': self.office_eul.id
        })
        self.assertEqual(res_pickup.status_code, status.HTTP_200_OK)
        p.refresh_from_db()
        self.assertEqual(p.status, ParcelStatus.DELIVERED)

        # Duplicate pickup rejected
        res_dup_pickup = self.client.post('/api/parcels/scan/', {
            'tracking_code': p.tracking_code,
            'event_type': ScanEventType.PICKUP,
            'office_id': self.office_eul.id
        })
        self.assertEqual(res_dup_pickup.status_code, status.HTTP_400_BAD_REQUEST)
