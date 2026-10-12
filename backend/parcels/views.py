from decimal import Decimal
from django.db.models import Q
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from core.models import Office, User
from core.permissions import IsStaffUser, IsAdminUserOnly
from notifications.tasks import queue_pickup_sms
from .models import Parcel, ScanEvent, ParcelStatus, ScanEventType
from .serializers import ParcelSerializer, ParcelCreateSerializer, ScanActionSerializer
from .utils import generate_tracking_code

class ParcelListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ParcelCreateSerializer
        return ParcelSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Parcel.objects.select_related(
            'origin_office', 'destination_office', 'current_office', 'created_by'
        ).prefetch_related('scan_events', 'payment_entries')

        # Customer role can ONLY see their own parcels
        if user.role == User.Role.CUSTOMER:
            return qs.filter(Q(sender_customer=user) | Q(created_by=user))

        # Staff (Moderator or Admin) - Apply filters & global search
        search_query = self.request.query_params.get('q', '').strip()
        if search_query:
            qs = qs.filter(
                Q(tracking_code__icontains=search_query) |
                Q(sender_name__icontains=search_query) |
                Q(recipient_name__icontains=search_query) |
                Q(sender_phone__icontains=search_query) |
                Q(recipient_phone__icontains=search_query)
            )

        status_param = self.request.query_params.get('status')
        if status_param and status_param in ParcelStatus.values:
            qs = qs.filter(status=status_param)

        route = self.request.query_params.get('route')
        if route == 'ALG_TO_EUL':
            qs = qs.filter(origin_office__code='ALGIERS', destination_office__code='EL_EULMA')
        elif route == 'EUL_TO_ALG':
            qs = qs.filter(origin_office__code='EL_EULMA', destination_office__code='ALGIERS')

        origin_code = self.request.query_params.get('origin')
        if origin_code:
            qs = qs.filter(origin_office__code=origin_code)

        destination_code = self.request.query_params.get('destination')
        if destination_code:
            qs = qs.filter(destination_office__code=destination_code)

        date_from = self.request.query_params.get('date_from')
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)

        date_to = self.request.query_params.get('date_to')
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)

        return qs

    def perform_create(self, serializer):
        user = self.request.user
        origin = serializer.validated_data['origin_office']
        dest = serializer.validated_data['destination_office']
        
        tracking_code = generate_tracking_code(origin.code, dest.code)
        
        # Fee handling: if customer or moderator without custom fee, defaults apply
        fee_amount = serializer.validated_data.get('fee_amount', Decimal('500.00'))
        if user.role == User.Role.MODERATOR and 'fee_amount' in self.request.data:
            # Moderators cannot edit/set custom fees
            fee_amount = Decimal('500.00')

        sender_customer = user if user.role == User.Role.CUSTOMER else None

        parcel = serializer.save(
            tracking_code=tracking_code,
            created_by=user,
            sender_customer=sender_customer,
            fee_amount=fee_amount,
            status=ParcelStatus.REQUESTED
        )

        # If staff member created it and requested immediate intake
        intake_now = self.request.data.get('intake_now', False)
        if user.role in [User.Role.MODERATOR, User.Role.ADMIN] and intake_now:
            parcel.status = ParcelStatus.RECEIVED_AT_ORIGIN
            parcel.current_office = origin
            parcel.save(update_fields=['status', 'current_office'])

            ScanEvent.objects.create(
                parcel=parcel,
                event_type=ScanEventType.INTAKE,
                office=origin,
                scanned_by=user,
                notes="Intake à la création par l'opérateur"
            )


class ParcelDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ParcelSerializer
    lookup_field = 'id'

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH']:
            # Fee editing is restricted to Admin
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role == User.Role.CUSTOMER:
            return Parcel.objects.filter(Q(sender_customer=user) | Q(created_by=user))
        return Parcel.objects.all()

    def update(self, request, *args, **kwargs):
        parcel = self.get_object()
        user = request.user
        
        # Check if attempting to alter fee_amount
        if 'fee_amount' in request.data:
            if user.role != User.Role.ADMIN:
                return Response(
                    {"error": "Seul un administrateur peut modifier les frais de transport."},
                    status=status.HTTP_403_FORBIDDEN
                )

        return super().update(request, *args, **kwargs)


class ScanExecuteView(APIView):
    """
    Handles barcode scanner events (Intake, Dispatch, Arrival, Pickup)
    with strict custody transition checks.
    """
    permission_classes = [IsStaffUser]

    def post(self, request):
        serializer = ScanActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        tracking_code = serializer.validated_data['tracking_code'].strip().upper()
        event_type = serializer.validated_data['event_type']
        notes = serializer.validated_data.get('notes', '')

        try:
            parcel = Parcel.objects.select_related('origin_office', 'destination_office', 'current_office').get(
                tracking_code=tracking_code
            )
        except Parcel.DoesNotExist:
            return Response(
                {"error": f"Colis avec le code '{tracking_code}' introuvable."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Determine office of scanning
        office_id = serializer.validated_data.get('office_id')
        if office_id:
            try:
                scan_office = Office.objects.get(id=office_id)
            except Office.DoesNotExist:
                return Response({"error": "Agence spécifiée inexistante."}, status=status.HTTP_400_BAD_REQUEST)
        elif request.user.assigned_office:
            scan_office = request.user.assigned_office
        else:
            # Fallback based on event
            scan_office = parcel.origin_office if event_type in [ScanEventType.INTAKE, ScanEventType.DISPATCH] else parcel.destination_office

        # Custody Step Verification Rules
        if event_type == ScanEventType.INTAKE:
            if parcel.status != ParcelStatus.REQUESTED:
                return Response(
                    {"error": f"Transition invalide : Le colis est déjà enregistré (statut actuel: {parcel.get_status_display()})."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if scan_office.id != parcel.origin_office_id:
                return Response(
                    {"error": f"L'enregistrement (Intake) doit se faire au bureau de départ ({parcel.origin_office.name_fr})."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            parcel.status = ParcelStatus.RECEIVED_AT_ORIGIN
            parcel.current_office = parcel.origin_office

        elif event_type == ScanEventType.DISPATCH:
            if parcel.status != ParcelStatus.RECEIVED_AT_ORIGIN:
                return Response(
                    {"error": f"Transition invalide : Impossible d'expédier un colis au statut '{parcel.get_status_display()}'. Il doit être enregistré au bureau de départ."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if scan_office.id != parcel.origin_office_id:
                return Response(
                    {"error": f"Le départ doit être scanné au bureau d'origine ({parcel.origin_office.name_fr})."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            parcel.status = ParcelStatus.DISPATCHED
            parcel.current_office = None

        elif event_type == ScanEventType.ARRIVAL:
            if parcel.status != ParcelStatus.DISPATCHED:
                return Response(
                    {"error": f"Transition invalide : Le colis ne peut pas arriver s'il n'est pas en transit / expédié (statut actuel: {parcel.get_status_display()})."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if scan_office.id != parcel.destination_office_id:
                return Response(
                    {"error": f"L'arrivée doit être scanné au bureau de destination ({parcel.destination_office.name_fr})."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            parcel.status = ParcelStatus.RECEIVED_AT_DESTINATION
            parcel.current_office = parcel.destination_office
            
            # Queue mock pickup SMS notification (guaranteed idempotent)
            queue_pickup_sms(parcel)

        elif event_type == ScanEventType.PICKUP:
            if parcel.status != ParcelStatus.RECEIVED_AT_DESTINATION:
                return Response(
                    {"error": f"Transition invalide : Le colis n'est pas prêt pour le retrait à destination (statut actuel: {parcel.get_status_display()})."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if scan_office.id != parcel.destination_office_id:
                return Response(
                    {"error": f"Le retrait s'effectue au bureau de destination ({parcel.destination_office.name_fr})."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            # Pickup is recorded even if the fee remains unpaid!
            parcel.status = ParcelStatus.DELIVERED

        else:
            return Response({"error": "Type d'événement inconnu."}, status=status.HTTP_400_BAD_REQUEST)

        parcel.save()

        # Log Scan Event
        scan_event = ScanEvent.objects.create(
            parcel=parcel,
            event_type=event_type,
            office=scan_office,
            scanned_by=request.user,
            notes=notes
        )

        return Response({
            "message": f"Scan '{event_type}' enregistré avec succès.",
            "parcel": ParcelSerializer(parcel).data,
            "event_id": scan_event.id
        }, status=status.HTTP_200_OK)


class PublicTrackView(APIView):
    """
    Public unauthenticated tracking lookup by code.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        code = request.query_params.get('code', '').strip().upper()
        if not code:
            return Response({"error": "Paramètre 'code' requis."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            parcel = Parcel.objects.select_related(
                'origin_office', 'destination_office', 'current_office'
            ).prefetch_related('scan_events').get(tracking_code=code)
        except Parcel.DoesNotExist:
            return Response({"error": "Aucun colis trouvé avec ce code de suivi."}, status=status.HTTP_404_NOT_FOUND)

        return Response(ParcelSerializer(parcel).data)
