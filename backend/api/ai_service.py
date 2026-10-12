import os
from django.db.models import Count, Q
from .models import Parcel, Office, PaymentEntry

def process_staff_ai_query(query: str, language: str = 'fr'):
    """
    Read-only AI Assistant for parcel search and queue summaries.
    Uses Gemini API if GEMINI_API_KEY is configured, or provides
    comprehensive local intelligent analysis fallback.
    """
    query_clean = query.strip()
    
    # 1. Gather live read-only system metrics
    total_parcels = Parcel.objects.count()
    status_counts = dict(Parcel.objects.values_list('status').annotate(c=Count('id')))
    algiers_intake = Parcel.objects.filter(current_office_id='ALG', status=Parcel.STATUS_INTAKE).count()
    eleulma_intake = Parcel.objects.filter(current_office_id='EUL', status=Parcel.STATUS_INTAKE).count()
    in_transit = Parcel.objects.filter(status=Parcel.STATUS_DISPATCHED).count()
    ready_alg = Parcel.objects.filter(destination_office_id='ALG', status=Parcel.STATUS_ARRIVED).count()
    ready_eul = Parcel.objects.filter(destination_office_id='EUL', status=Parcel.STATUS_ARRIVED).count()
    
    # Check unpaid delivered
    unpaid_delivered = [p for p in Parcel.objects.filter(status=Parcel.STATUS_DELIVERED) if not p.is_paid]

    # Keyword search on parcels
    search_results = Parcel.objects.filter(
        Q(tracking_number__icontains=query_clean) |
        Q(sender_name__icontains=query_clean) |
        Q(recipient_name__icontains=query_clean) |
        Q(sender_phone__icontains=query_clean) |
        Q(recipient_phone__icontains=query_clean) |
        Q(description__icontains=query_clean)
    )[:10]

    context_summary = f"""
    --- Live Database State (Read-Only) ---
    Total Parcels: {total_parcels}
    Status Breakdown: {status_counts}
    Algiers Office (ALG) - Parcels registered waiting dispatch: {algiers_intake}
    El Eulma Office (EUL) - Parcels registered waiting dispatch: {eleulma_intake}
    In-Transit (Dispatched between Algiers and El Eulma): {in_transit}
    Ready for Pickup in Algiers: {ready_alg}
    Ready for Pickup in El Eulma: {ready_eul}
    Unpaid Delivered Parcels: {len(unpaid_delivered)}
    """

    gemini_key = os.environ.get('GEMINI_API_KEY')
    ai_response_text = ""

    if gemini_key:
        try:
            from google import genai
            client = genai.Client(api_key=gemini_key)
            prompt = f"""
            You are the Khaled Express Operations AI Assistant for logistics between Algiers and El Eulma.
            You are READ-ONLY and provide parcel search and queue summaries.
            
            Current System Data:
            {context_summary}
            
            Staff Member Query: "{query_clean}"
            Language: {"Arabic" if language == 'ar' else "French"}
            
            Provide a helpful, precise operational response in the requested language.
            """
            resp = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            if resp and resp.text:
                ai_response_text = resp.text
        except Exception as e:
            ai_response_text = f"[Gemini offline: {e}] "

    # Fallback / Smart rule-based answer if no API key or empty response
    if not ai_response_text or ai_response_text.startswith("[Gemini offline"):
        q_lower = query_clean.lower()
        if language == 'ar':
            if 'علمة' in q_lower or 'eulma' in q_lower:
                ai_response_text = (
                    f"حالة الطرود الخاصة بمكتب العلمة (سطيف):\n"
                    f"• في انتظار الإرسال بالعلمة: {eleulma_intake} طرد\n"
                    f"• جاهزة للاستلام بمكتب العلمة: {ready_eul} طرد\n"
                    f"• في الطريق: {in_transit} طرد"
                )
            elif 'جزائر' in q_lower or 'alger' in q_lower:
                ai_response_text = (
                    f"حالة الطرود الخاصة بمكتب الجزائر العاصمة:\n"
                    f"• في انتظار الإرسال بالجزائر: {algiers_intake} طرد\n"
                    f"• جاهزة للاستلام بالجزائر: {ready_alg} طرد\n"
                    f"• في الطريق بين المكاتب: {in_transit} طرد"
                )
            elif 'غير مدفوع' in q_lower or 'دفع' in q_lower or 'unpaid' in q_lower:
                ai_response_text = (
                    f"الطرود المسلمة وغير المدفوعة بعد: {len(unpaid_delivered)} طرد. "
                    f"يمكن للمسؤول المالي (Admin) تسجيل الدفعات المرتبطة بها في لوحة المالية."
                )
            else:
                ai_response_text = (
                    f"ملخص العمليات الحالي لشبكة خالد إكسبريس:\n"
                    f"• إجمالي الطرود المسجلة: {total_parcels}\n"
                    f"• في الطريق (Alger <-> El Eulma): {in_transit} طرد\n"
                    f"• جاهزة للاستلام بالجزائر: {ready_alg} | بالعلمة: {ready_eul}\n"
                    f"تم العثور على {search_results.count()} طرد يطابق استفسارك."
                )
        else:
            if 'eulma' in q_lower or 'setif' in q_lower:
                ai_response_text = (
                    f"État des files pour l'agence d'El Eulma (Sétif) :\n"
                    f"• Colis enregistrés en attente d'expédition : {eleulma_intake}\n"
                    f"• Colis arrivés prêts au retrait : {ready_eul}\n"
                    f"• Colis actuellement en transit : {in_transit}"
                )
            elif 'alger' in q_lower:
                ai_response_text = (
                    f"État des files pour l'agence d'Alger :\n"
                    f"• Colis enregistrés en attente d'expédition : {algiers_intake}\n"
                    f"• Colis arrivés prêts au retrait : {ready_alg}\n"
                    f"• Colis actuellement en transit : {in_transit}"
                )
            elif 'non payé' in q_lower or 'paiement' in q_lower or 'impayé' in q_lower:
                ai_response_text = (
                    f"Il y a actuellement {len(unpaid_delivered)} colis remis mais non encore soldés. "
                    f"Les administrateurs peuvent enregistrer les règlements correspondants dans le module Finance."
                )
            else:
                ai_response_text = (
                    f"Synthèse opérationnelle Khaled Express (Alger <-> El Eulma) :\n"
                    f"• Total colis enregistrés : {total_parcels}\n"
                    f"• En transit sur la ligne : {in_transit}\n"
                    f"• Prêts au retrait : Alger ({ready_alg}), El Eulma ({ready_eul})\n"
                    f"{search_results.count()} colis correspondent précisément à votre recherche."
                )

    matching_parcels_data = [
        {
            'tracking_number': p.tracking_number,
            'sender_name': p.sender_name,
            'recipient_name': p.recipient_name,
            'origin': p.origin_office_id,
            'destination': p.destination_office_id,
            'status': p.status,
            'fee': float(p.fee),
            'is_paid': p.is_paid,
            'created_at': p.created_at.strftime('%Y-%m-%d %H:%M')
        }
        for p in search_results
    ]

    return {
        'query': query_clean,
        'ai_response': ai_response_text,
        'matches_count': len(matching_parcels_data),
        'parcels': matching_parcels_data,
        'stats': {
            'total': total_parcels,
            'in_transit': in_transit,
            'algiers_waiting': algiers_intake,
            'eleulma_waiting': eleulma_intake,
            'unpaid_delivered': len(unpaid_delivered)
        }
    }
