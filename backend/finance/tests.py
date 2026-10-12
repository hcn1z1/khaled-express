from decimal import Decimal
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from core.models import Office, User
from parcels.models import Parcel, ParcelStatus
from finance.models import PaymentEntry, ExpenseEntry, PaymentMethod, ExpenseCategory

class FinanceAccessAndLedgerTests(TestCase):
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

        self.admin = User.objects.create_user(
            phone_number='0555000001', password='pass', role=User.Role.ADMIN, full_name='Admin User'
        )
        self.moderator = User.objects.create_user(
            phone_number='0555000002', password='pass', role=User.Role.MODERATOR, full_name='Moderator User'
        )
        self.customer = User.objects.create_user(
            phone_number='0661000001', password='pass', role=User.Role.CUSTOMER, full_name='Customer User'
        )

        self.parcel = Parcel.objects.create(
            tracking_code='KX-ALG-EUL-261012-0001',
            origin_office=self.office_alg,
            destination_office=self.office_eul,
            sender_name='Expediteur',
            sender_phone='0661000000',
            recipient_name='Destinataire',
            recipient_phone='0550000000',
            fee_amount=Decimal('800.00'),
            status=ParcelStatus.DELIVERED,
            created_by=self.admin
        )

    def test_moderator_cannot_access_finance_screens_or_alter_money_records(self):
        self.client.force_authenticate(user=self.moderator)

        # 1. Moderator cannot view finance summary
        res_sum = self.client.get('/api/finance/summary/')
        self.assertEqual(res_sum.status_code, status.HTTP_403_FORBIDDEN)

        # 2. Moderator cannot view or create payment entries
        res_pay_list = self.client.get('/api/finance/payments/')
        self.assertEqual(res_pay_list.status_code, status.HTTP_403_FORBIDDEN)
        res_pay_create = self.client.post('/api/finance/payments/', {
            'parcel': self.parcel.id,
            'amount': '800.00',
            'payment_method': PaymentMethod.CASH
        })
        self.assertEqual(res_pay_create.status_code, status.HTTP_403_FORBIDDEN)

        # 3. Moderator cannot view or create expenses
        res_exp_list = self.client.get('/api/finance/expenses/')
        self.assertEqual(res_exp_list.status_code, status.HTTP_403_FORBIDDEN)
        res_exp_create = self.client.post('/api/finance/expenses/', {
            'amount': '1500.00',
            'description': 'Fournitures bureau',
            'category': ExpenseCategory.SUPPLIES
        })
        self.assertEqual(res_exp_create.status_code, status.HTTP_403_FORBIDDEN)

        # 4. Moderator cannot alter fee amount on existing parcel
        res_edit_fee = self.client.patch(f'/api/parcels/{self.parcel.id}/', {
            'fee_amount': '1200.00'
        })
        self.assertEqual(res_edit_fee.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_payment_and_expense_entries_update_totals(self):
        self.client.force_authenticate(user=self.admin)

        # Before entries: summary is 0
        res_init = self.client.get('/api/finance/summary/')
        self.assertEqual(res_init.status_code, status.HTTP_200_OK)
        self.assertEqual(Decimal(res_init.data['total_received']), Decimal('0.00'))
        self.assertEqual(Decimal(res_init.data['total_spent']), Decimal('0.00'))

        # Admin adds payment entry for the delivered parcel
        res_pay = self.client.post('/api/finance/payments/', {
            'parcel': self.parcel.id,
            'amount': '800.00',
            'payment_method': PaymentMethod.CASH,
            'reference': 'REC-TEST-01'
        })
        self.assertEqual(res_pay.status_code, status.HTTP_201_CREATED)

        # Parcel is now marked paid
        self.parcel.refresh_from_db()
        self.assertEqual(self.parcel.payment_status, 'PAID')
        self.assertEqual(self.parcel.total_paid, Decimal('800.00'))

        # Admin adds expense entry
        res_exp = self.client.post('/api/finance/expenses/', {
            'amount': '350.00',
            'category': ExpenseCategory.TRANSPORT_FUEL,
            'office': self.office_alg.id,
            'description': 'Essence navette'
        })
        self.assertEqual(res_exp.status_code, status.HTTP_201_CREATED)

        # Check updated summary
        res_after = self.client.get('/api/finance/summary/')
        self.assertEqual(Decimal(res_after.data['total_received']), Decimal('800.00'))
        self.assertEqual(Decimal(res_after.data['total_spent']), Decimal('350.00'))
        self.assertEqual(Decimal(res_after.data['net_balance']), Decimal('450.00'))
