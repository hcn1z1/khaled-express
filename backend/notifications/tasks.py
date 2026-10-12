import logging
from celery import shared_task
from django.utils import timezone
from .models import MockSmsOutbox, MockSmsStatus, SmsGatewaySettings
from .gateway import dispatch_sms_via_android_gateway

logger = logging.getLogger(__name__)

def build_pickup_sms_content(parcel, language: str) -> str:
    """
    Renders the pickup SMS using the configured template from SmsGatewaySettings.
    """
    settings = SmsGatewaySettings.get_settings()
    return settings.render_template(parcel, language)

def queue_pickup_sms(parcel):
    """
    Enqueues a pickup notification SMS idempotently.
    Prevents duplicates on scan retries using idempotency_key.
    Uses the customizable template configured by moderators or admins.
    """
    idempotency_key = f"arrival_pickup_sms_{parcel.id}"
    lang = parcel.preferred_sms_language or 'fr'
    message_text = build_pickup_sms_content(parcel, lang)

    sms_record, created = MockSmsOutbox.objects.get_or_create(
        idempotency_key=idempotency_key,
        defaults={
            'parcel': parcel,
            'recipient_phone': parcel.recipient_phone,
            'language': lang,
            'message_body': message_text,
            'status': MockSmsStatus.QUEUED,
        }
    )

    if created:
        # Dispatch asynchronously via Celery or execute immediately if worker not available
        try:
            deliver_mock_sms.delay(str(sms_record.id))
        except Exception as e:
            logger.warning(f"Celery dispatch failed, delivering synchronously: {e}")
            deliver_mock_sms(str(sms_record.id))

    return sms_record

@shared_task
def deliver_mock_sms(sms_id: str):
    """
    Dispatches SMS to recipient via the configured capcom6/android-sms-gateway.
    Falls back gracefully if the gateway is disabled (simulation mode).
    """
    try:
        sms = MockSmsOutbox.objects.get(id=sms_id)
        if sms.status == MockSmsStatus.QUEUED:
            settings = SmsGatewaySettings.get_settings()
            
            # Dispatch to Android Gateway (or simulate if gateway disabled)
            result = dispatch_sms_via_android_gateway(
                phone_number=sms.recipient_phone,
                text_message=sms.message_body,
                settings=settings
            )

            if result.get("success"):
                sms.mark_sent(
                    provider=result.get("provider", "AndroidSmsGateway"),
                    report_data=result
                )
                logger.info(f"Delivered SMS {sms.id} to {sms.recipient_phone} via {result.get('provider')}")
                return True
            else:
                sms.mark_failed(
                    provider=result.get("provider", "AndroidSmsGateway"),
                    error=result.get("error", "Échec d'envoi")
                )
                logger.error(f"Failed delivering SMS {sms.id}: {result.get('error')}")
                return False

    except MockSmsOutbox.DoesNotExist:
        logger.error(f"SMS record {sms_id} does not exist.")
        return False
