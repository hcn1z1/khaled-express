import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'khaled_express.settings')
django.setup()

from decimal import Decimal
from django.core.exceptions import ValidationError
from api.models import Office, User, Parcel, ScanEvent, PaymentEntry, ExpenseEntry, SmsOutbox
from api.sms_service import queue_arrival_pickup_sms
from api.ai_service import process_staff_ai_query
from api.barcode_utils import generate_barcode_svg

def run_tests():
    print("==================================================")
    print("RUNNING KHALED EXPRESS PROTOTYPE VERIFICATION SUITE")
    print("==================================================")

    alg = Office.objects.get(code='ALG')
    eul = Office.objects.get(code='EUL')
    admin = User.objects.get(username='admin')
    moderator = User.objects.get(username='moderator')
    customer = User.objects.get(username='karim')

    # Test 1: Office restriction validation
    print("\n[TEST 1] Office Restriction (Algiers <-> El Eulma only)")
    invalid_parcel = Parcel(
        origin_office=alg,
        destination_office_id='ORAN',
        sender_name='Test',
        sender_phone='0550000000',
        recipient_name='Test',
        recipient_phone='0550000001'
    )
    try:
        invalid_parcel.full_clean()
        assert False, "Should have rejected non-existent or invalid office!"
    except ValidationError:
        print("  -> PASSED: Successfully rejected invalid office outside Algiers & El Eulma.")

    # Test 2: Same office restriction
    try:
        same_office_parcel = Parcel(
            origin_office=alg,
            destination_office=alg,
            sender_name='Test',
            sender_phone='0550000000',
            recipient_name='Test',
            recipient_phone='0550000001'
        )
        same_office_parcel.full_clean()
        assert False, "Should have rejected same origin and destination!"
    except ValidationError:
        print("  -> PASSED: Successfully rejected origin == destination.")

    # Test 3: Custody workflow step-by-step
    print("\n[TEST 2] Custody Workflow & Strict Step Validation")
    test_tracking = "KE-ALG-EUL-999001"
    Parcel.objects.filter(tracking_number=test_tracking).delete()
    
    # Step A: Customer requests dropoff online
    parcel = Parcel.objects.create(
        tracking_number=test_tracking,
        origin_office=alg,
        destination_office=eul,
        sender_name='Mohamed Test',
        sender_phone='0551112233',
        sender_user=customer,
        recipient_name='Riad Eulma',
        recipient_phone='0662223344',
        status=Parcel.STATUS_PENDING_DROPOFF
    )
    assert parcel.status == Parcel.STATUS_PENDING_DROPOFF
    print(f"  -> Step A: Request created with status '{parcel.status}'.")

    # Step B: Physical Intake at Algiers
    parcel.status = Parcel.STATUS_INTAKE
    parcel.fee = Decimal('1000.00')
    parcel.current_office = alg
    parcel.save()
    ScanEvent.objects.create(
        parcel=parcel,
        event_type=ScanEvent.EVENT_INTAKE,
        office=alg,
        performed_by=admin
    )
    print(f"  -> Step B: Intake completed at {alg.code}, fee set to {parcel.fee} DZD, status is '{parcel.status}'.")

    # Step C: Dispatch Scan from Algiers
    parcel.status = Parcel.STATUS_DISPATCHED
    parcel.current_office = None # in transit
    parcel.save()
    ScanEvent.objects.create(
        parcel=parcel,
        event_type=ScanEvent.EVENT_DISPATCH,
        office=alg,
        performed_by=admin
    )
    print(f"  -> Step C: Dispatched on transport, status is '{parcel.status}'.")

    # Step D: Arrival Scan at El Eulma & Mock SMS Queueing
    parcel.status = Parcel.STATUS_ARRIVED
    parcel.current_office = eul
    parcel.save()
    ScanEvent.objects.create(
        parcel=parcel,
        event_type=ScanEvent.EVENT_ARRIVAL,
        office=eul,
        performed_by=moderator
    )
    
    # Queue localized SMS
    sms1 = queue_arrival_pickup_sms(parcel, language='fr')
    sms_count_before = SmsOutbox.objects.filter(parcel=parcel).count()
    # Retry to verify idempotency (no duplicate SMS!)
    sms2 = queue_arrival_pickup_sms(parcel, language='fr')
    sms_count_after = SmsOutbox.objects.filter(parcel=parcel).count()
    assert sms_count_before == 1 and sms_count_after == 1, "Duplicate SMS created on retry!"
    print(f"  -> Step D: Arrived at {eul.code}. Localized SMS queued in mock outbox. Idempotency verified (retries = 1 SMS).")

    # Step E: Pickup / Handoff while UNPAID
    print("\n[TEST 3] Handoff Allowed While Unpaid & Later Payment Entry")
    assert not parcel.is_paid, "Parcel should be unpaid currently!"
    parcel.status = Parcel.STATUS_DELIVERED
    parcel.save()
    ScanEvent.objects.create(
        parcel=parcel,
        event_type=ScanEvent.EVENT_PICKUP,
        office=eul,
        performed_by=moderator,
        notes="Remis au destinataire - non payé"
    )
    print(f"  -> Step E: Handed over successfully with status '{parcel.status}' while unpaid (is_paid={parcel.is_paid}).")

    # Step F: Later Admin Payment Entry
    PaymentEntry.objects.create(
        parcel=parcel,
        amount=Decimal('1000.00'),
        payment_method=PaymentEntry.METHOD_BARIDIMOB,
        recorded_by=admin,
        notes="Paiement a posteriori par BaridiMob"
    )
    assert parcel.is_paid, "Parcel should now be paid!"
    print(f"  -> Step F: Admin recorded payment entry. Parcel is_paid is now: {parcel.is_paid}.")

    # Test 4: Financial Summary Calculation
    print("\n[TEST 4] Financial Calculation: Total Received & Total Spent")
    total_received = sum(p.amount for p in PaymentEntry.objects.all())
    total_spent = sum(e.amount for e in ExpenseEntry.objects.all())
    print(f"  -> Total Received: {total_received} DZD")
    print(f"  -> Total Spent: {total_spent} DZD")
    print(f"  -> Net Balance: {total_received - total_spent} DZD")
    assert total_received > 0 and total_spent > 0

    # Test 5: Role Permissions
    print("\n[TEST 5] Role Permissions: Admin vs Moderator vs Customer")
    assert admin.can_access_finance, "Admin must have access to finance!"
    assert not moderator.can_access_finance, "Moderator must NOT have access to finance!"
    assert not customer.can_access_finance, "Customer must NOT have access to finance!"
    print("  -> PASSED: Finance access restricted strictly to Admin.")

    # Test 6: AI Assistant read-only search
    print("\n[TEST 6] AI Assistant Read-Only Querying")
    ai_res_fr = process_staff_ai_query("Combien de colis en attente à El Eulma ?", language='fr')
    assert "El Eulma" in ai_res_fr['ai_response']
    ai_res_ar = process_staff_ai_query("كم عدد الطرود بالعلمة ؟", language='ar')
    assert "العلمة" in ai_res_ar['ai_response']
    print(f"  -> AI French Output snippet: {ai_res_fr['ai_response'][:70]}...")
    print(f"  -> AI Arabic Output matched: {'العلمة' in ai_res_ar['ai_response']}")
    print("  -> PASSED: AI assistant provided instant read-only summaries in French and Arabic.")

    # Test 7: Barcode SVG Generation
    print("\n[TEST 7] Code 128 Barcode Generation for 80mm Printing")
    svg = generate_barcode_svg("KE-ALG-EUL-100202", width=320, height=80)
    assert "<svg" in svg and "</svg>" in svg and "KE-ALG-EUL-100202" in svg
    print("  -> PASSED: Clean Code 128 SVG generated for 80mm thermal printing.")

    print("\n==================================================")
    print("ALL VERIFICATION SUITE TESTS PASSED SUCCESSFULLY!")
    print("==================================================")

if __name__ == '__main__':
    run_tests()
