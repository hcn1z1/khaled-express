import os
import sys
from decimal import Decimal

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

# Set up Django environment
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'khaled_express.settings')
django.setup()

from core.models import Office, User
from parcels.models import Parcel, ScanEvent, ParcelStatus, ScanEventType
from parcels.utils import generate_tracking_code, generate_barcode_svg, generate_barcode_base64_png
from finance.models import PaymentEntry, ExpenseEntry, PaymentMethod, ExpenseCategory
from notifications.models import MockSmsOutbox, MockSmsStatus
from notifications.tasks import queue_pickup_sms
from rest_framework.test import APIClient

def run_e2e_verification():
    print("=" * 60)
    print("RUNNING KHALED EXPRESS FULL WORKFLOW VERIFICATION")
    print("=" * 60)

    client = APIClient()

    # 1. Verify Offices
    offices = Office.objects.all()
    print(f"[1] Offices verified ({offices.count()}): {[o.code for o in offices]}")
    assert set(o.code for o in offices) == {'ALGIERS', 'EL_EULMA'}, "Only Algiers and El Eulma allowed"

    office_alg = Office.objects.get(code='ALGIERS')
    office_eul = Office.objects.get(code='EL_EULMA')

    # 2. Verify Accounts & Roles
    admin = User.objects.get(phone_number='0555000001')
    moderator_alg = User.objects.get(phone_number='0555000002')
    customer = User.objects.get(phone_number='0661123456')

    print(f"[2] Roles verified:")
    print(f"    - Admin: {admin.full_name} ({admin.role})")
    print(f"    - Moderator: {moderator_alg.full_name} ({moderator_alg.role})")
    print(f"    - Customer: {customer.full_name} ({customer.role})")

    # 3. Customer Creates Online Request
    client.force_authenticate(user=customer)
    res_create = client.post('/api/parcels/', {
        'origin_office': office_alg.id,
        'destination_office': office_eul.id,
        'sender_name': customer.full_name,
        'sender_phone': customer.phone_number,
        'recipient_name': 'Destinataire Test E2E',
        'recipient_phone': '0555998877',
        'description': 'Colis Test E2E',
        'weight_kg': '2.50',
        'preferred_sms_language': 'ar'
    }, format='json')
    assert res_create.status_code == 201, f"Create failed: {res_create.data}"
    tracking_code = res_create.data['tracking_code']
    parcel_id = res_create.data['id']
    print(f"[3] Online parcel request created: {tracking_code} (Status: {res_create.data['status']})")

    # 4. Scoping: Customer only sees own parcels
    res_list_cust = client.get('/api/parcels/')
    cust_codes = [p['tracking_code'] for p in res_list_cust.data]
    assert tracking_code in cust_codes, "Customer must see their own parcel"
    print(f"[4] Customer scoping verified: sees {len(cust_codes)} of their own parcels")

    # 5. Barcode & Ticket Preview
    client.force_authenticate(user=moderator_alg)
    res_detail = client.get(f'/api/parcels/{parcel_id}/')
    assert res_detail.data['barcode_png'].startswith('data:image/png;base64,'), "Code 128 PNG generated"
    assert '<svg' in res_detail.data['barcode_svg'], "Code 128 SVG generated"
    print(f"[5] Barcode Code 128 generated successfully (PNG & SVG)")

    # 6. Custody Transition 1: INTAKE Scan
    res_intake = client.post('/api/parcels/scan/', {
        'tracking_code': tracking_code,
        'event_type': ScanEventType.INTAKE,
        'office_id': office_alg.id,
        'notes': 'Dépôt physique au comptoir Alger'
    })
    assert res_intake.status_code == 200, f"Intake scan failed: {res_intake.data}"
    assert res_intake.data['parcel']['status'] == ParcelStatus.RECEIVED_AT_ORIGIN
    print(f"[6] Custody Step 1: Intake scan succeeded (Status: RECEIVED_AT_ORIGIN)")

    # Test invalid custody step: cannot jump to ARRIVAL without DISPATCH!
    res_bad_jump = client.post('/api/parcels/scan/', {
        'tracking_code': tracking_code,
        'event_type': ScanEventType.ARRIVAL,
        'office_id': office_eul.id
    })
    assert res_bad_jump.status_code == 400, "Skipping dispatch must be rejected"
    print(f"[6b] Custody check: Invalid step jump rejected ({res_bad_jump.data['error']})")

    # 7. Custody Transition 2: DISPATCH Scan
    res_dispatch = client.post('/api/parcels/scan/', {
        'tracking_code': tracking_code,
        'event_type': ScanEventType.DISPATCH,
        'office_id': office_alg.id,
        'notes': 'Départ navette Alger -> El Eulma'
    })
    assert res_dispatch.status_code == 200
    assert res_dispatch.data['parcel']['status'] == ParcelStatus.DISPATCHED
    print(f"[7] Custody Step 2: Dispatch scan succeeded (Status: DISPATCHED)")

    # 8. Custody Transition 3: ARRIVAL Scan + SMS Queueing
    sms_count_before = MockSmsOutbox.objects.filter(parcel_id=parcel_id).count()
    res_arrival = client.post('/api/parcels/scan/', {
        'tracking_code': tracking_code,
        'event_type': ScanEventType.ARRIVAL,
        'office_id': office_eul.id,
        'notes': 'Arrivée à El Eulma'
    })
    assert res_arrival.status_code == 200
    assert res_arrival.data['parcel']['status'] == ParcelStatus.RECEIVED_AT_DESTINATION
    sms_count_after = MockSmsOutbox.objects.filter(parcel_id=parcel_id).count()
    assert sms_count_after == sms_count_before + 1, "Exactly one mock SMS must be queued"
    sms_entry = MockSmsOutbox.objects.get(parcel_id=parcel_id)
    print(f"[8] Custody Step 3: Arrival scan succeeded (Status: RECEIVED_AT_DESTINATION)")
    print(f"    - Mock SMS queued: \"{sms_entry.message_body[:50]}...\" (Idempotency key: {sms_entry.idempotency_key})")

    # Duplicate scan retry test
    res_dup_arrival = client.post('/api/parcels/scan/', {
        'tracking_code': tracking_code,
        'event_type': ScanEventType.ARRIVAL,
        'office_id': office_eul.id
    })
    assert res_dup_arrival.status_code == 400, "Duplicate arrival scan must be rejected"
    assert MockSmsOutbox.objects.filter(parcel_id=parcel_id).count() == 1, "Retries must not create duplicate SMS"
    print(f"[8b] SMS Idempotency check: No duplicate SMS created")

    # 9. Custody Transition 4: PICKUP Scan (allowed even if unpaid!)
    parcel_obj = Parcel.objects.get(id=parcel_id)
    assert parcel_obj.payment_status == 'UNPAID', "Fee is currently unpaid"
    res_pickup = client.post('/api/parcels/scan/', {
        'tracking_code': tracking_code,
        'event_type': ScanEventType.PICKUP,
        'office_id': office_eul.id,
        'notes': 'Remis au destinataire (paiement différé)'
    })
    assert res_pickup.status_code == 200, "Pickup handoff must succeed while unpaid"
    assert res_pickup.data['parcel']['status'] == ParcelStatus.DELIVERED
    print(f"[9] Custody Step 4: Pickup handoff succeeded while UNPAID (Status: DELIVERED)")

    # 10. Financial Security: Moderator cannot access or edit money
    res_mod_fin = client.get('/api/finance/summary/')
    assert res_mod_fin.status_code == 403, "Moderator blocked from finance summary"
    res_mod_pay = client.post('/api/finance/payments/', {'parcel': parcel_id, 'amount': '500.00'})
    assert res_mod_pay.status_code == 403, "Moderator blocked from creating payments"
    res_mod_fee = client.patch(f'/api/parcels/{parcel_id}/', {'fee_amount': '1200.00'})
    assert res_mod_fee.status_code == 403, "Moderator blocked from editing fees"
    print(f"[10] Security verified: Moderator received HTTP 403 on all finance operations")

    # 11. Admin Financial Control: Later payment entry updates total received
    client.force_authenticate(user=admin)
    summary_before = client.get('/api/finance/summary/').data
    total_received_before = Decimal(summary_before['total_received'])

    res_pay = client.post('/api/finance/payments/', {
        'parcel': parcel_id,
        'amount': '500.00',
        'payment_method': PaymentMethod.CASH,
        'reference': 'REC-E2E-TEST'
    })
    assert res_pay.status_code == 201, "Admin payment recording succeeded"

    summary_after = client.get('/api/finance/summary/').data
    total_received_after = Decimal(summary_after['total_received'])
    assert total_received_after == total_received_before + Decimal('500.00'), "Total received increased by 500 DZD"
    print(f"[11] Finance Admin verified: Payment recorded, total received updated from {total_received_before} to {total_received_after} DZD")

    # 12. Admin Expense entry updates total spent
    total_spent_before = Decimal(summary_after['total_spent'])
    res_exp = client.post('/api/finance/expenses/', {
        'amount': '1200.00',
        'category': ExpenseCategory.TRANSPORT_FUEL,
        'description': 'Carburant navette Alger - El Eulma E2E',
        'office': office_alg.id
    })
    assert res_exp.status_code == 201
    summary_final = client.get('/api/finance/summary/').data
    total_spent_final = Decimal(summary_final['total_spent'])
    assert total_spent_final == total_spent_before + Decimal('1200.00'), "Total spent increased by 1200 DZD"
    print(f"[12] Finance Expenses verified: Total spent updated from {total_spent_before} to {total_spent_final} DZD")

    # 13. Staff AI Assistant: Read-only check
    res_ai = client.post('/api/ai/assistant/', {
        'query': 'Résume les colis en transit et les livrés'
    })
    assert res_ai.status_code == 200
    assert 'response' in res_ai.data
    assert res_ai.data['read_only'] is True
    print(f"[13] Staff AI Assistant verified: Read-only summary returned successfully")

    print("=" * 60)
    print("ALL 13 WORKFLOW & BUSINESS RULES PASSED PERFECTLY!")
    print("=" * 60)

if __name__ == '__main__':
    run_e2e_verification()
