from unittest.mock import patch, MagicMock
from decimal import Decimal
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from core.models import Office, User
from parcels.models import Parcel, ParcelStatus
from notifications.models import MockSmsOutbox, MockSmsStatus, SmsGatewaySettings
from notifications.tasks import queue_pickup_sms, build_pickup_sms_content

class NotificationSmsTests(TestCase):
    def setUp(self):
        self.office_alg = Office.objects.create(
            code='ALGIERS', name_fr='Alger Centre', name_ar='الجزائر الوسطى',
            wilaya='Alger', address_fr='Rue Didouche', address_ar='شارع ديدوش', phone='021734567'
        )
        self.office_eul = Office.objects.create(
            code='EL_EULMA', name_fr='El Eulma', name_ar='العلمة',
            wilaya='Sétif', address_fr='Rue Dubai', address_ar='شارع دبي', phone='036871234'
        )
        self.admin = User.objects.create_user(phone_number='0555000001', password='pass', role=User.Role.ADMIN)
        self.mod = User.objects.create_user(phone_number='0555000002', password='pass', role=User.Role.MODERATOR)
        self.client = APIClient()

        # By default in tests, disable actual external HTTP requests unless mocked
        self.settings = SmsGatewaySettings.get_settings()
        self.settings.is_enabled = False
        self.settings.save()

    def test_arrival_queues_mock_sms_and_retries_do_not_duplicate(self):
        parcel = Parcel.objects.create(
            tracking_code='KX-ALG-EUL-261012-7777',
            origin_office=self.office_alg,
            destination_office=self.office_eul,
            sender_name='Expediteur Test',
            sender_phone='0661000000',
            recipient_name='Destinataire Test',
            recipient_phone='0555998877',
            status=ParcelStatus.RECEIVED_AT_DESTINATION,
            preferred_sms_language='ar',
            created_by=self.admin
        )

        # 1. First queue call
        sms_1 = queue_pickup_sms(parcel)
        self.assertIsNotNone(sms_1)
        self.assertEqual(MockSmsOutbox.objects.filter(parcel=parcel).count(), 1)
        self.assertIn("خالد إكسبريس", sms_1.message_body)
        self.assertIn(self.office_eul.name_ar, sms_1.message_body)
        self.assertIn(parcel.tracking_code, sms_1.message_body)

        # 2. Retry call (simulating scan retry or worker retry)
        sms_2 = queue_pickup_sms(parcel)
        self.assertEqual(sms_1.id, sms_2.id)
        # Total count must remain strictly 1!
        self.assertEqual(MockSmsOutbox.objects.filter(parcel=parcel).count(), 1)

    def test_french_sms_localization(self):
        parcel = Parcel.objects.create(
            tracking_code='KX-EUL-ALG-261012-8888',
            origin_office=self.office_eul,
            destination_office=self.office_alg,
            sender_name='Expediteur Fr',
            sender_phone='0661000000',
            recipient_name='Destinataire Fr',
            recipient_phone='0555112233',
            status=ParcelStatus.RECEIVED_AT_DESTINATION,
            preferred_sms_language='fr',
            created_by=self.admin
        )
        sms = queue_pickup_sms(parcel)
        self.assertIn("Khaled Express : Votre colis", sms.message_body)
        self.assertIn("est disponible au bureau", sms.message_body)

    def test_custom_template_variables(self):
        self.settings.template_fr = "Colis {tracking_code} pour {recipient_name} au bureau {destination_office}. Montant: {fee_amount} DZD ({payment_status})"
        self.settings.save()

        parcel = Parcel.objects.create(
            tracking_code='KX-ALG-EUL-261012-9999',
            origin_office=self.office_alg,
            destination_office=self.office_eul,
            recipient_name='Karim Test',
            recipient_phone='0555223344',
            fee_amount=Decimal('800.00'),
            preferred_sms_language='fr',
            created_by=self.admin
        )
        sms = queue_pickup_sms(parcel)
        self.assertIn("Colis KX-ALG-EUL-261012-9999 pour Karim Test au bureau El Eulma", sms.message_body)
        self.assertIn("Montant: 800.00 DZD (Non payé)", sms.message_body)

    @patch('requests.post')
    def test_android_sms_gateway_dispatch(self, mock_post):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {"id": "gw-msg-12345", "state": "Pending"}
        mock_post.return_value = mock_resp

        self.settings.is_enabled = True
        self.settings.gateway_url = "http://192.168.1.50:8080/message"
        self.settings.username = "smsuser"
        self.settings.password = "smspass"
        self.settings.save()

        parcel = Parcel.objects.create(
            tracking_code='KX-TEST-GW-001',
            origin_office=self.office_alg,
            destination_office=self.office_eul,
            recipient_name='Test Phone',
            recipient_phone='0555123456',
            preferred_sms_language='fr',
            created_by=self.admin
        )
        sms = queue_pickup_sms(parcel)
        
        self.assertTrue(mock_post.called)
        call_args = mock_post.call_args
        self.assertEqual(call_args[0][0], "http://192.168.1.50:8080/message")
        self.assertIn("textMessage", call_args[1]['json'])
        self.assertIn("+213555123456", call_args[1]['json']['phoneNumbers'])

        sms.refresh_from_db()
        self.assertEqual(sms.status, MockSmsStatus.SENT)
        self.assertEqual(sms.delivery_report['provider'], 'AndroidSmsGateway')

    def test_moderator_and_admin_can_update_settings(self):
        # 1. Moderator updates settings
        self.client.force_authenticate(user=self.mod)
        res = self.client.get('/api/notifications/settings/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        update_payload = {
            "gateway_url": "http://192.168.1.88:8080/message",
            "device_name": "Xiaomi Redmi Gateway",
            "template_fr": "Alerte Colis: {tracking_code} disponible."
        }
        res_patch = self.client.patch('/api/notifications/settings/', update_payload)
        self.assertEqual(res_patch.status_code, status.HTTP_200_OK)
        self.assertEqual(res_patch.data['gateway_url'], "http://192.168.1.88:8080/message")
        self.assertEqual(res_patch.data['device_name'], "Xiaomi Redmi Gateway")

        # 2. Reset templates endpoint
        res_reset = self.client.post('/api/notifications/settings/reset-templates/')
        self.assertEqual(res_reset.status_code, status.HTTP_200_OK)
        self.assertIn("Khaled Express : Votre colis", res_reset.data['settings']['template_fr'])
