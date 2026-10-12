import re
import logging
import requests
from requests.auth import HTTPBasicAuth

logger = logging.getLogger(__name__)

def normalize_gateway_url(raw_url: str) -> str:
    """
    Ensures the URL points to the correct message endpoint of capcom6/android-sms-gateway.
    For local mode: http://<ip>:<port>/message
    For cloud mode: https://api.sms-gate.app/3rdparty/v1/message
    """
    if not raw_url:
        return "https://api.sms-gate.app/3rdparty/v1/message"
    
    url = raw_url.strip().rstrip('/')
    
    # If using cloud service sms-gate.app (whether entered as api.sms-gate.app, mobile/v1, or host:port)
    if "sms-gate.app" in url:
        return "https://api.sms-gate.app/3rdparty/v1/message"

    if not url.startswith(('http://', 'https://')):
        url = f"http://{url}"

    # Local server on Android device (e.g. http://192.168.1.50:8080/message)
    if not url.endswith("/message") and not url.endswith("/messages"):
        url = f"{url}/message"

    return url

def clean_phone_number(phone: str) -> str:
    """
    Cleans phone number for the Android telephony SMS dispatcher.
    """
    if not phone:
        return ""
    cleaned = re.sub(r'[^\d+]', '', phone.strip())
    # Format Algerian local mobile (05/06/07) to international format if requested
    if cleaned.startswith('0') and len(cleaned) == 10:
        cleaned = f"+213{cleaned[1:]}"
    return cleaned

def dispatch_sms_via_android_gateway(phone_number: str, text_message: str, settings=None) -> dict:
    """
    Sends an SMS via capcom6/android-sms-gateway API.
    Request body format:
    {
        "textMessage": {
            "text": "..."
        },
        "phoneNumbers": ["+213..."]
    }
    """
    from .models import SmsGatewaySettings

    if settings is None:
        settings = SmsGatewaySettings.get_settings()

    if not settings.is_enabled:
        return {
            "success": True,
            "provider": "Simulation",
            "status_code": 200,
            "error": None,
            "note": "Passerelle Android désactivée. Message simulé avec succès."
        }

    target_url = normalize_gateway_url(settings.gateway_url)
    phone = clean_phone_number(phone_number)

    payload = {
        "textMessage": {
            "text": text_message
        },
        "phoneNumbers": [
            phone
        ]
    }

    headers = {
        "Content-Type": "application/json",
        "User-Agent": "KhaledExpress-GatewayClient/1.0"
    }

    auth = None
    pwd = (settings.password or "").strip()
    user = (settings.username or "").strip()

    # Support both Bearer Token (JWT/cloud API key) and HTTP Basic Auth:
    if pwd and (not user or user.lower() in ('bearer', 'token', 'jwt') or pwd.startswith('ey')):
        headers["Authorization"] = f"Bearer {pwd}"
    elif user or pwd:
        auth = HTTPBasicAuth(user, pwd)

    try:
        logger.info(f"Dispatching SMS via Android Gateway to {phone} at {target_url}")
        response = requests.post(
            target_url,
            json=payload,
            headers=headers,
            auth=auth,
            timeout=(2.5, 4.0)  # 2.5s connect, 4s read
        )

        if response.status_code in (200, 201, 202):
            try:
                resp_json = response.json()
            except Exception:
                resp_json = {"raw": response.text}

            logger.info(f"SMS successfully sent via Android Gateway: HTTP {response.status_code}")
            return {
                "success": True,
                "provider": "AndroidSmsGateway",
                "status_code": response.status_code,
                "response": resp_json,
                "gateway_url": target_url,
                "error": None
            }
        else:
            if response.status_code == 401:
                err_msg = (
                    "Passerelle Android : Authentification refusée par le téléphone (HTTP 401). "
                    "Vérifiez l'identifiant (username) et le mot de passe / token configurés dans l'application Android."
                )
            elif response.status_code == 403:
                err_msg = (
                    "Passerelle Android : Accès refusé (HTTP 403). "
                    "Vérifiez les permissions de l'application Android SMS Gateway."
                )
            elif response.status_code == 404:
                err_msg = (
                    f"Passerelle Android : Adresse introuvable (HTTP 404) sur {target_url}. "
                    "Vérifiez l'adresse IP et le chemin /message dans l'application."
                )
            else:
                err_msg = f"Passerelle Android : HTTP {response.status_code}: {response.text[:300]}"

            logger.warning(f"Android Gateway returned error: {err_msg}")
            return {
                "success": False,
                "provider": "AndroidSmsGateway",
                "status_code": response.status_code,
                "error": err_msg,
                "gateway_url": target_url
            }

    except requests.exceptions.Timeout:
        err = "Délai d'attente dépassé (Timeout). Vérifiez que le téléphone Android est allumé et sur le même réseau."
        logger.error(err)
        return {
            "success": False,
            "provider": "AndroidSmsGateway",
            "status_code": None,
            "error": err,
            "gateway_url": target_url
        }
    except requests.exceptions.ConnectionError as ce:
        err = f"Connexion refusée à {target_url}. Assurez-vous que l'application Android SMS Gateway est active et que l'IP/port est exact."
        logger.error(f"{err}: {ce}")
        return {
            "success": False,
            "provider": "AndroidSmsGateway",
            "status_code": None,
            "error": err,
            "gateway_url": target_url
        }
    except Exception as exc:
        err = f"Erreur imprévue lors de l'envoi SMS: {str(exc)}"
        logger.exception(err)
        return {
            "success": False,
            "provider": "AndroidSmsGateway",
            "status_code": None,
            "error": err,
            "gateway_url": target_url
        }
