from django.utils import timezone
from .models import SmsOutbox, Parcel

def queue_arrival_pickup_sms(parcel: Parcel, language: str = 'fr') -> SmsOutbox:
    """
    Queues a localized pickup SMS when the destination marks a parcel ready.
    Ensures idempotency so duplicate arrival scans or retries do not send multiple messages.
    """
    idempotency_key = f"PICKUP_SMS_{parcel.tracking_number}"
    
    # Check if already queued
    existing = SmsOutbox.objects.filter(idempotency_key=idempotency_key).first()
    if existing:
        return existing

    dest = parcel.destination_office
    fee_str = f"{parcel.fee:.0f}"

    if language == 'ar':
        message = (
            f"خالد إكسبريس: طردكم رقم {parcel.tracking_number} وصل وهو جاهز للاستلام "
            f"بمكتب {dest.name_ar} ({dest.address_ar}). "
            f"المبلغ المطلوب: {fee_str} د.ج. "
            f"هاتف المكتب: {dest.phone}."
        )
    else:
        message = (
            f"Khaled Express: Votre colis {parcel.tracking_number} est arrivé et prêt au retrait "
            f"à l'agence {dest.name_fr} ({dest.address_fr}). "
            f"Montant à régler: {fee_str} DZD. "
            f"Contact agence: {dest.phone}."
        )

    outbox_entry = SmsOutbox.objects.create(
        parcel=parcel,
        recipient_phone=parcel.recipient_phone,
        language=language,
        message_body=message,
        status=SmsOutbox.STATUS_QUEUED,
        idempotency_key=idempotency_key,
        created_at=timezone.now(),
        sent_at=timezone.now() # Mock immediate dispatch in prototype
    )
    return outbox_entry
