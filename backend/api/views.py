from decimal import Decimal
from django.contrib.auth import authenticate, login, logout
from django.db.models import Q, Sum
from django.utils import timezone
from django.http import HttpResponse
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import Office, User, Parcel, ScanEvent, PaymentEntry, ExpenseEntry, SmsOutbox
from .serializers import (
    OfficeSerializer, UserSerializer, RegisterCustomerSerializer,
    ParcelSerializer, ScanEventSerializer, PaymentEntrySerializer,
    ExpenseEntrySerializer, SmsOutboxSerializer
)
from .permissions import IsAdminUserRole, IsStaffOrAdmin, CanAccessFinance
from .barcode_utils import generate_barcode_svg
from .sms_service import queue_arrival_pickup_sms
from .ai_service import process_staff_ai_query


# -------------------------------------------------------------
# Authentication Endpoints
# -------------------------------------------------------------
@api_view(['POST'])
@permission_classes([AllowAny])
def api_register_customer(request):
    serializer = RegisterCustomerSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        login(request, user)
        return Response({
            'message': 'Compte client créé avec succès',
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def api_login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return Response({
            'message': 'Connexion réussie',
            'user': UserSerializer(user).data
        })
    return Response({'error': 'Identifiants invalides (nom d\'utilisateur ou mot de passe)'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
def api_logout(request):
    logout(request)
    return Response({'message': 'Déconnexion réussie'})


@api_view(['GET'])
def api_me(request):
    if request.user.is_authenticated:
        return Response(UserSerializer(request.user).data)
    return Response({'authenticated': False}, status=status.HTTP_200_OK)


# -------------------------------------------------------------
# Offices ViewSet
# -------------------------------------------------------------
class OfficeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Office.objects.filter(is_active=True)
    serializer_class = OfficeSerializer
    permission_classes = [AllowAny]


# -------------------------------------------------------------
# Parcels ViewSet with Custody State-Machine
# -------------------------------------------------------------
class ParcelViewSet(viewsets.ModelViewSet):
    queryset = Parcel.objects.all().order_by('-created_at')
    serializer_class = ParcelSerializer
    lookup_field = 'tracking_number'

    def get_permissions(self):
        if self.action in ['track', 'barcode_image']:
            return [AllowAny()]
        return [AllowAny()]  # Permissive for prototype exploration, fine-grained checks in methods

    def get_queryset(self):
        user = self.request.user
        qs = Parcel.objects.all()

        # If logged in as customer, strictly see only their parcels
        if user.is_authenticated and user.role == User.ROLE_CUSTOMER:
            qs = qs.filter(Q(sender_user=user) | Q(sender_phone=user.phone) | Q(recipient_phone=user.phone))

        # Search filter
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(tracking_number__icontains=search) |
                Q(sender_name__icontains=search) |
                Q(recipient_name__icontains=search) |
                Q(sender_phone__icontains=search) |
                Q(recipient_phone__icontains=search)
            )

        # Status filter
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)

        # Route filter (ALG_EUL or EUL_ALG)
        route = self.request.query_params.get('route')
        if route == 'ALG_EUL':
            qs = qs.filter(origin_office_id='ALG', destination_office_id='EUL')
        elif route == 'EUL_ALG':
            qs = qs.filter(origin_office_id='EUL', destination_office_id='ALG')

        # Date filters
        date_from = self.request.query_params.get('date_from')
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)
        date_to = self.request.query_params.get('date_to')
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)

        return qs.order_by('-created_at')

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        sender_user = user if (user and user.role == User.ROLE_CUSTOMER) else None
        
        # Staff can register directly at INTAKE if requested
        initial_status = self.request.data.get('status', Parcel.STATUS_PENDING_DROPOFF)
        if user and user.is_staff_member and initial_status == Parcel.STATUS_INTAKE:
            parcel = serializer.save(
                created_by=user,
                sender_user=sender_user,
                status=Parcel.STATUS_INTAKE,
                current_office_id=serializer.validated_data['origin_office'].code
            )
            ScanEvent.objects.create(
                parcel=parcel,
                event_type=ScanEvent.EVENT_INTAKE,
                office=parcel.origin_office,
                performed_by=user,
                notes="Enregistrement direct au comptoir"
            )
        else:
            parcel = serializer.save(
                created_by=user,
                sender_user=sender_user,
                status=Parcel.STATUS_PENDING_DROPOFF
            )
            ScanEvent.objects.create(
                parcel=parcel,
                event_type=ScanEvent.EVENT_DROPOFF_REQUEST,
                office=parcel.origin_office,
                performed_by=user,
                notes="Demande en ligne en attente de dépôt physique"
            )

    # ---------------------------------------------------------
    # Public Tracking Endpoint
    # ---------------------------------------------------------
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def track(self, request):
        code = request.query_params.get('code', '').strip().upper()
        if not code:
            return Response({'error': 'Veuillez renseigner un numéro de suivi / يُرجى إدخال رقم التتبع'}, status=status.HTTP_400_BAD_REQUEST)
        
        parcel = Parcel.objects.filter(tracking_number__iexact=code).first()
        if not parcel:
            return Response({'error': f'Colis {code} introuvable / الطرد غير موجود'}, status=status.HTTP_404_NOT_FOUND)
        
        return Response(ParcelSerializer(parcel).data)

    # ---------------------------------------------------------
    # Barcode SVG Endpoint
    # ---------------------------------------------------------
    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def barcode_image(self, request, tracking_number=None):
        parcel = self.get_object()
        svg = generate_barcode_svg(parcel.tracking_number, width=320, height=80, show_text=True)
        return HttpResponse(svg, content_type='image/svg+xml')

    # ---------------------------------------------------------
    # Custody Workflow 1: INTAKE (Accept Physical Dropoff & Set Fee)
    # ---------------------------------------------------------
    @action(detail=True, methods=['post'])
    def intake(self, request, tracking_number=None):
        parcel = self.get_object()
        
        # Custody rule: Can only perform intake if in PENDING_DROPOFF
        if parcel.status != Parcel.STATUS_PENDING_DROPOFF:
            return Response({
                'error': f"Opération impossible: le colis est actuellement '{parcel.get_status_display()}' et a déjà passé l'étape de dépôt."
            }, status=status.HTTP_400_BAD_REQUEST)

        fee = request.data.get('fee')
        if fee is not None:
            try:
                parcel.fee = Decimal(str(fee))
            except Exception:
                return Response({'error': 'Format de frais invalide'}, status=status.HTTP_400_BAD_REQUEST)

        weight = request.data.get('weight_kg')
        if weight:
            parcel.weight_kg = Decimal(str(weight))

        user = request.user if request.user.is_authenticated else None
        notes = request.data.get('notes', 'Prise en charge au bureau d\'origine')

        parcel.status = Parcel.STATUS_INTAKE
        parcel.current_office = parcel.origin_office
        parcel.save()

        event = ScanEvent.objects.create(
            parcel=parcel,
            event_type=ScanEvent.EVENT_INTAKE,
            office=parcel.origin_office,
            performed_by=user,
            notes=notes
        )

        return Response({
            'message': f'Colis {parcel.tracking_number} enregistré avec succès à {parcel.origin_office.name_fr}',
            'parcel': ParcelSerializer(parcel).data,
            'event': ScanEventSerializer(event).data
        })

    # ---------------------------------------------------------
    # Custody Workflow 2: DISPATCH SCAN (Depart Origin Office)
    # ---------------------------------------------------------
    @action(detail=True, methods=['post'])
    def dispatch(self, request, tracking_number=None):
        parcel = self.get_object()
        
        # Enforce custody chain: Must be in INTAKE
        if parcel.status != Parcel.STATUS_INTAKE:
            return Response({
                'error': f"Scan expédition refusé: le colis doit être en agence (INTAKE). Statut actuel: '{parcel.get_status_display()}'."
            }, status=status.HTTP_400_BAD_REQUEST)

        user = request.user if request.user.is_authenticated else None
        notes = request.data.get('notes', f"Expédié vers {parcel.destination_office.name_fr}")

        parcel.status = Parcel.STATUS_DISPATCHED
        parcel.current_office = None  # In transit
        parcel.save()

        event = ScanEvent.objects.create(
            parcel=parcel,
            event_type=ScanEvent.EVENT_DISPATCH,
            office=parcel.origin_office,
            performed_by=user,
            notes=notes
        )

        return Response({
            'message': f'Colis {parcel.tracking_number} scanné et expédié vers {parcel.destination_office.name_fr}',
            'parcel': ParcelSerializer(parcel).data,
            'event': ScanEventSerializer(event).data
        })

    # ---------------------------------------------------------
    # Custody Workflow 3: ARRIVAL SCAN (Arrive Destination & Trigger SMS)
    # ---------------------------------------------------------
    @action(detail=True, methods=['post'])
    def arrive(self, request, tracking_number=None):
        parcel = self.get_object()

        # Enforce custody chain: Must be in DISPATCHED
        if parcel.status != Parcel.STATUS_DISPATCHED:
            return Response({
                'error': f"Scan arrivée refusé: le colis doit être en transit (DISPATCHED). Statut actuel: '{parcel.get_status_display()}'."
            }, status=status.HTTP_400_BAD_REQUEST)

        user = request.user if request.user.is_authenticated else None
        notes = request.data.get('notes', f"Réceptionné à {parcel.destination_office.name_fr}")

        parcel.status = Parcel.STATUS_ARRIVED
        parcel.current_office = parcel.destination_office
        parcel.save()

        event = ScanEvent.objects.create(
            parcel=parcel,
            event_type=ScanEvent.EVENT_ARRIVAL,
            office=parcel.destination_office,
            performed_by=user,
            notes=notes
        )

        # Trigger mock SMS in preferred language (default French, Arabic supported)
        lang = request.data.get('language', 'fr')
        sms = queue_arrival_pickup_sms(parcel, language=lang)

        return Response({
            'message': f'Colis {parcel.tracking_number} arrivé à {parcel.destination_office.name_fr}. SMS prêt pour le destinataire.',
            'parcel': ParcelSerializer(parcel).data,
            'event': ScanEventSerializer(event).data,
            'sms_outbox': SmsOutboxSerializer(sms).data
        })

    # ---------------------------------------------------------
    # Custody Workflow 4: PICKUP / HANDOFF (Can be recorded unpaid!)
    # ---------------------------------------------------------
    @action(detail=True, methods=['post'])
    def pickup(self, request, tracking_number=None):
        parcel = self.get_object()

        # Enforce custody chain: Must be ARRIVED
        if parcel.status != Parcel.STATUS_ARRIVED:
            return Response({
                'error': f"Remise impossible: le colis doit être arrivé à destination. Statut actuel: '{parcel.get_status_display()}'."
            }, status=status.HTTP_400_BAD_REQUEST)

        user = request.user if request.user.is_authenticated else None
        notes = request.data.get('notes', 'Colis remis en main propre au destinataire')

        # IMPORTANT: Pickup allowed even if unpaid!
        parcel.status = Parcel.STATUS_DELIVERED
        parcel.save()

        event = ScanEvent.objects.create(
            parcel=parcel,
            event_type=ScanEvent.EVENT_PICKUP,
            office=parcel.destination_office,
            performed_by=user,
            notes=notes
        )

        return Response({
            'message': f'Colis {parcel.tracking_number} livré avec succès au destinataire.',
            'parcel': ParcelSerializer(parcel).data,
            'event': ScanEventSerializer(event).data,
            'is_paid': parcel.is_paid,
            'unpaid_warning': not parcel.is_paid
        })

    # ---------------------------------------------------------
    # Print Bon Endpoint (80mm Ticket, Sender Bon, Recipient Bon)
    # ---------------------------------------------------------
    @action(detail=True, methods=['get'])
    def print_bon(self, request, tracking_number=None):
        parcel = self.get_object()
        bon_type = request.query_params.get('type', 'ticket') # 'ticket', 'sender', 'recipient'
        lang = request.query_params.get('lang', 'fr') # 'fr', 'ar'

        # Generate barcode SVG for the print document
        barcode_svg = generate_barcode_svg(parcel.tracking_number, width=320, height=80, show_text=True)

        return Response({
            'bon_type': bon_type,
            'language': lang,
            'parcel': ParcelSerializer(parcel).data,
            'barcode_svg': barcode_svg,
            'company': {
                'name_fr': 'Khaled Express',
                'name_ar': 'خالد إكسبريس',
                'tagline_fr': 'Transport de colis Alger <-> El Eulma',
                'tagline_ar': 'نقل الطرود السريع الجزائر <-> العلمة',
                'phone': '0550 00 00 00'
            },
            'printed_at': timezone.now().strftime('%Y-%m-%d %H:%M:%S')
        })


# -------------------------------------------------------------
# Finance ViewSet & Summary (Strictly Admin Only)
# -------------------------------------------------------------
@api_view(['GET'])
def api_finance_summary(request):
    """
    Returns financial summary: total received, total spent, net balance,
    and breakdown per office. STRICTLY ADMIN ONLY.
    Moderators cannot open finance screens or edit fees/expenses.
    """
    if request.user.is_authenticated and not request.user.can_access_finance:
        return Response({
            'error': 'Accès interdit: Seuls les administrateurs ont accès au module financier.'
        }, status=status.HTTP_403_FORBIDDEN)

    total_received = PaymentEntry.objects.aggregate(t=Sum('amount'))['t'] or Decimal('0.00')
    total_spent = ExpenseEntry.objects.aggregate(t=Sum('amount'))['t'] or Decimal('0.00')
    net_balance = total_received - total_spent

    # Per office breakdown
    offices_data = []
    for office in Office.objects.all():
        spent = ExpenseEntry.objects.filter(office=office).aggregate(t=Sum('amount'))['t'] or Decimal('0.00')
        # Parcels originating or delivered at this office
        received = PaymentEntry.objects.filter(parcel__origin_office=office).aggregate(t=Sum('amount'))['t'] or Decimal('0.00')
        offices_data.append({
            'code': office.code,
            'name_fr': office.name_fr,
            'name_ar': office.name_ar,
            'received': float(received),
            'spent': float(spent),
            'balance': float(received - spent)
        })

    recent_payments = PaymentEntrySerializer(PaymentEntry.objects.all()[:15], many=True).data
    recent_expenses = ExpenseEntrySerializer(ExpenseEntry.objects.all()[:15], many=True).data

    return Response({
        'total_received': float(total_received),
        'total_spent': float(total_spent),
        'net_balance': float(net_balance),
        'currency': 'DZD',
        'offices': offices_data,
        'recent_payments': recent_payments,
        'recent_expenses': recent_expenses
    })


@api_view(['POST', 'GET'])
def api_finance_payments(request):
    if request.user.is_authenticated and not request.user.can_access_finance:
        return Response({'error': 'Accès interdit (Réservé aux administrateurs)'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        payments = PaymentEntry.objects.all()[:50]
        return Response(PaymentEntrySerializer(payments, many=True).data)

    # POST new payment
    tracking_number = request.data.get('tracking_number')
    parcel = Parcel.objects.filter(tracking_number=tracking_number).first()
    if not parcel:
        return Response({'error': f'Colis {tracking_number} introuvable'}, status=status.HTTP_404_NOT_FOUND)

    amount = request.data.get('amount')
    method = request.data.get('payment_method', PaymentEntry.METHOD_CASH)
    notes = request.data.get('notes', '')

    payment = PaymentEntry.objects.create(
        parcel=parcel,
        amount=Decimal(str(amount)),
        payment_method=method,
        recorded_by=request.user if request.user.is_authenticated else None,
        notes=notes
    )

    return Response({
        'message': f'Paiement de {payment.amount} DZD enregistré pour {parcel.tracking_number}',
        'payment': PaymentEntrySerializer(payment).data,
        'parcel_is_paid': parcel.is_paid
    }, status=status.HTTP_201_CREATED)


@api_view(['POST', 'GET'])
def api_finance_expenses(request):
    if request.user.is_authenticated and not request.user.can_access_finance:
        return Response({'error': 'Accès interdit (Réservé aux administrateurs)'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        expenses = ExpenseEntry.objects.all()[:50]
        return Response(ExpenseEntrySerializer(expenses, many=True).data)

    # POST new expense
    office_code = request.data.get('office')
    office = Office.objects.filter(code=office_code).first()
    if not office:
        return Response({'error': f'Bureau {office_code} invalide'}, status=status.HTTP_400_BAD_REQUEST)

    amount = request.data.get('amount')
    category = request.data.get('category', ExpenseEntry.CATEGORY_OTHER)
    description = request.data.get('description', '')

    expense = ExpenseEntry.objects.create(
        office=office,
        amount=Decimal(str(amount)),
        category=category,
        description=description,
        recorded_by=request.user if request.user.is_authenticated else None
    )

    return Response({
        'message': f'Dépense de {expense.amount} DZD enregistrée pour {office.name_fr}',
        'expense': ExpenseEntrySerializer(expense).data
    }, status=status.HTTP_201_CREATED)


# -------------------------------------------------------------
# SMS Mock Outbox Endpoint
# -------------------------------------------------------------
@api_view(['GET'])
def api_sms_outbox(request):
    messages = SmsOutbox.objects.all()[:50]
    return Response(SmsOutboxSerializer(messages, many=True).data)


# -------------------------------------------------------------
# Staff AI Assistant Query Endpoint (Read-Only)
# -------------------------------------------------------------
@api_view(['POST'])
def api_ai_query(request):
    """
    Staff-only, read-only AI assistant for natural language parcel search and queue summaries.
    """
    query = request.data.get('query', '')
    language = request.data.get('language', 'fr')
    if not query:
        return Response({'error': 'Veuillez saisir une question'}, status=status.HTTP_400_BAD_REQUEST)

    result = process_staff_ai_query(query, language=language)
    return Response(result)
