import json
import logging
from django.conf import settings
from django.db.models import Count, Q
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from core.permissions import IsStaffUser
from parcels.models import Parcel, ParcelStatus
from parcels.serializers import ParcelSerializer

logger = logging.getLogger(__name__)

class StaffAiAssistantView(APIView):
    """
    Staff-only, strictly read-only AI assistant for natural-language parcel search
    and queue summaries. Employs server-side Gemini when configured, or intelligent
    real-time deterministic NLP summarizer as fallback.
    """
    permission_classes = [IsStaffUser]

    def post(self, request):
        query = request.data.get('query', '').strip()
        if not query:
            return Response(
                {"error": "Veuillez poser une question ou saisir un critère de recherche."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 1. Gather live queue summary stats
        status_counts = dict(
            Parcel.objects.values('status')
            .annotate(c=Count('id'))
            .values_list('status', 'c')
        )
        total_parcels = Parcel.objects.count()

        # Route breakdown
        alg_to_eul = Parcel.objects.filter(
            origin_office__code='ALGIERS', destination_office__code='EL_EULMA'
        ).count()
        eul_to_alg = Parcel.objects.filter(
            origin_office__code='EL_EULMA', destination_office__code='ALGIERS'
        ).count()

        summary_data = {
            'total_parcels': total_parcels,
            'status_breakdown': {
                'requested': status_counts.get(ParcelStatus.REQUESTED, 0),
                'received_at_origin': status_counts.get(ParcelStatus.RECEIVED_AT_ORIGIN, 0),
                'dispatched_in_transit': status_counts.get(ParcelStatus.DISPATCHED, 0),
                'ready_at_destination': status_counts.get(ParcelStatus.RECEIVED_AT_DESTINATION, 0),
                'delivered': status_counts.get(ParcelStatus.DELIVERED, 0),
            },
            'routes': {
                'Alger_vers_El_Eulma': alg_to_eul,
                'El_Eulma_vers_Alger': eul_to_alg
            }
        }

        # 2. Extract potential parcel search matches
        tokens = query.replace(',', ' ').replace('?', ' ').replace('.', ' ').split()
        match_query = Q()
        for token in tokens:
            if len(token) >= 3:
                match_query |= (
                    Q(tracking_code__icontains=token) |
                    Q(sender_name__icontains=token) |
                    Q(recipient_name__icontains=token) |
                    Q(sender_phone__icontains=token) |
                    Q(recipient_phone__icontains=token)
                )

        relevant_parcels = []
        if match_query:
            relevant_parcels = list(Parcel.objects.filter(match_query)[:10])

        # If no specific tokens matched, or for overview questions, provide recent parcels
        if not relevant_parcels and any(k in query.lower() for k in ['transit', 'cours', 'file', 'queue', 'résumé', 'ملخص', 'اليوم', 'tous']):
            relevant_parcels = list(Parcel.objects.all().order_by('-updated_at')[:8])

        parcels_data = ParcelSerializer(relevant_parcels, many=True).data

        # 3. Server-side Gemini integration if API key is provided
        gemini_api_key = getattr(settings, 'GEMINI_API_KEY', None)
        answer_text = None

        if gemini_api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=gemini_api_key)
                model = genai.GenerativeModel('gemini-1.5-flash')

                system_prompt = f"""
Tu es l'assistant IA opérationnel de Khaled Express (société de transport de colis entre Alger et El Eulma).
Tu réponds UNIQUEMENT de manière consultative et en lecture seule au personnel de l'agence.
Tu ne peux pas modifier la base de données.
Voici l'état actuel en direct du système :
- Données de la file : {json.dumps(summary_data, ensure_ascii=False)}
- Colis pertinents trouvés ({len(relevant_parcels)}) :
{json.dumps([{
    'tracking_code': p.tracking_code,
    'status': p.get_status_display(),
    'trajet': f"{p.origin_office.name_fr} -> {p.destination_office.name_fr}",
    'expéditeur': f"{p.sender_name} ({p.sender_phone})",
    'destinataire': f"{p.recipient_name} ({p.recipient_phone})",
    'frais': f"{p.fee_amount} DZD",
    'paiement': p.payment_status
} for p in relevant_parcels], ensure_ascii=False, indent=2)}

Question de l'opérateur : "{query}"

Fournis une réponse claire, polie et concise en français ou en arabe selon la langue de la question. Mentionne les numéros de suivi si applicable.
"""
                response = model.generate_content(system_prompt)
                if response and response.text:
                    answer_text = response.text.strip()
            except Exception as e:
                logger.warning(f"Gemini API invocation failed: {e}. Falling back to rule-based engine.")

        # 4. Fallback intelligent response generator if Gemini not configured or offline
        if not answer_text:
            query_lower = query.lower()
            is_arabic = any('\u0600' <= char <= '\u06FF' for char in query)
            
            if is_arabic:
                if 'ملخص' in query or 'حالة' in query or 'كم' in query:
                    answer_text = (
                        f"📊 **ملخص طوابير خالد إكسبريس (الجزائر - العلمة)** :\n\n"
                        f"- إجمالي الطرود المسجلة: **{summary_data['total_parcels']}**\n"
                        f"- في انتظار الإيداع: **{summary_data['status_breakdown']['requested']}**\n"
                        f"- مودعة في مكتب الانطلاق: **{summary_data['status_breakdown']['received_at_origin']}**\n"
                        f"- في مرحلة النقل (قيد العبور): **{summary_data['status_breakdown']['dispatched_in_transit']}**\n"
                        f"- وصلت وجاهزة للاستلام في الوجهة: **{summary_data['status_breakdown']['ready_at_destination']}**\n"
                        f"- تم تسليمها بنجاح: **{summary_data['status_breakdown']['delivered']}**\n\n"
                        f"اتجاه الجزائر ⬅️➡️ العلمة: {summary_data['routes']['Alger_vers_El_Eulma']} طرد | "
                        f"العلمة ⬅️➡️ الجزائر: {summary_data['routes']['El_Eulma_vers_Alger']} طرد."
                    )
                elif relevant_parcels:
                    p_list = "\n".join([f"- **{p.tracking_code}**: من {p.sender_name} إلى {p.recipient_name} ({p.get_status_display()})" for p in relevant_parcels[:5]])
                    answer_text = f"تم العثور على {len(relevant_parcels)} طرد مطابق لبحثكم:\n\n{p_list}"
                else:
                    answer_text = "لم يتم العثور على طرود تطابق معايير البحث المحددة. يرجى التأكد من رقم التتبع أو الاسم أو رقم الهاتف."
            else:
                if any(w in query_lower for w in ['stat', 'résumé', 'combien', 'queue', 'file', 'transit', 'point']):
                    answer_text = (
                        f"📊 **Résumé opérationnel des files Khaled Express (Alger ↔ El Eulma)** :\n\n"
                        f"- Total des colis : **{summary_data['total_parcels']}**\n"
                        f"- En attente de dépôt physique : **{summary_data['status_breakdown']['requested']}**\n"
                        f"- Enregistrés au bureau de départ : **{summary_data['status_breakdown']['received_at_origin']}**\n"
                        f"- En cours d'acheminement (Transit) : **{summary_data['status_breakdown']['dispatched_in_transit']}**\n"
                        f"- Arrivés à destination (Prêts au retrait) : **{summary_data['status_breakdown']['ready_at_destination']}**\n"
                        f"- Remis aux destinataires : **{summary_data['status_breakdown']['delivered']}**\n\n"
                        f"🔄 **Flux par axe** :\n"
                        f"- Alger ➔ El Eulma : **{summary_data['routes']['Alger_vers_El_Eulma']}** colis\n"
                        f"- El Eulma ➔ Alger : **{summary_data['routes']['El_Eulma_vers_Alger']}** colis"
                    )
                elif relevant_parcels:
                    p_list = "\n".join([
                        f"- **{p.tracking_code}** ({p.get_status_display()}) : "
                        f"{p.origin_office.name_fr} ➔ {p.destination_office.name_fr} | "
                        f"Exp: {p.sender_name} ({p.sender_phone}) ➔ Dest: {p.recipient_name} ({p.recipient_phone}) | "
                        f"Frais: {p.fee_amount} DZD ({p.payment_status})"
                        for p in relevant_parcels[:5]
                    ])
                    answer_text = (
                        f"🔍 **{len(relevant_parcels)} colis trouvé(s)** pour votre recherche :\n\n"
                        f"{p_list}\n\n"
                        f"*(Assistant en lecture seule : aucune modification apportée)*"
                    )
                else:
                    answer_text = (
                        f"Aucun colis ne correspond précisément à '{query}'. "
                        f"Vous pouvez rechercher par code de suivi (ex: KX-...), nom d'expéditeur ou de destinataire, ou demander un résumé de file."
                    )

        return Response({
            "response": answer_text,
            "summary": summary_data,
            "matched_parcels": parcels_data,
            "read_only": True
        })
