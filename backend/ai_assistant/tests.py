from decimal import Decimal
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from core.models import Office, User
from parcels.models import Parcel, ParcelStatus

class AiAssistantTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.office_alg = Office.objects.create(
            code='ALGIERS', name_fr='Alger', name_ar='الجزائر',
            wilaya='Alger', address_fr='Alger', address_ar='الجزائر', phone='021000000'
        )
        self.office_eul = Office.objects.create(
            code='EL_EULMA', name_fr='El Eulma', name_ar='العلمة',
            wilaya='Sétif', address_fr='El Eulma', address_ar='العلمة', phone='036000000'
        )
        self.admin = User.objects.create_user(phone_number='0555000001', password='pass', role=User.Role.ADMIN)
        self.moderator = User.objects.create_user(phone_number='0555000002', password='pass', role=User.Role.MODERATOR)
        self.customer = User.objects.create_user(phone_number='0661000001', password='pass', role=User.Role.CUSTOMER)

        self.parcel = Parcel.objects.create(
            tracking_code='KX-ALG-EUL-261012-9999',
            origin_office=self.office_alg,
            destination_office=self.office_eul,
            sender_name='Mourad Cherif',
            sender_phone='0661998877',
            recipient_name='Walid Hamdi',
            recipient_phone='0555887766',
            status=ParcelStatus.DISPATCHED,
            created_by=self.admin
        )

    def test_customer_and_anonymous_cannot_access_ai_assistant(self):
        # Anonymous
        res_anon = self.client.post('/api/ai/assistant/', {'query': 'Donne-moi les stats'})
        self.assertEqual(res_anon.status_code, status.HTTP_401_UNAUTHORIZED)

        # Customer
        self.client.force_authenticate(user=self.customer)
        res_cust = self.client.post('/api/ai/assistant/', {'query': 'Donne-moi les stats'})
        self.assertEqual(res_cust.status_code, status.HTTP_403_FORBIDDEN)

    def test_staff_ai_assistant_returns_summary_and_preserves_records(self):
        self.client.force_authenticate(user=self.moderator)
        parcels_before_count = Parcel.objects.count()
        parcel_updated_at_before = self.parcel.updated_at

        # Ask summary
        res = self.client.post('/api/ai/assistant/', {'query': 'Combien de colis en transit ?'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('response', res.data)
        self.assertIn('summary', res.data)
        self.assertTrue(res.data['read_only'])

        # Search for Walid
        res_search = self.client.post('/api/ai/assistant/', {'query': 'Trouver le colis pour Walid'})
        self.assertEqual(res_search.status_code, status.HTTP_200_OK)
        self.assertIn('matched_parcels', res_search.data)
        matched_codes = [p['tracking_code'] for p in res_search.data['matched_parcels']]
        self.assertIn(self.parcel.tracking_code, matched_codes)

        # Verify database was NOT modified (read-only verification)
        self.assertEqual(Parcel.objects.count(), parcels_before_count)
        self.parcel.refresh_from_db()
        self.assertEqual(self.parcel.updated_at, parcel_updated_at_before)
        self.assertEqual(self.parcel.status, ParcelStatus.DISPATCHED)
