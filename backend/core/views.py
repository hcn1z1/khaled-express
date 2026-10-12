from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from .models import Office, User
from .serializers import (
    OfficeSerializer,
    UserProfileSerializer,
    CustomerRegistrationSerializer,
    LoginSerializer
)

class CustomerRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = CustomerRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        user_data = UserProfileSerializer(user).data
        return Response({
            'token': token.key,
            'user': user_data
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)
        user_data = UserProfileSerializer(user).data
        return Response({
            'token': token.key,
            'user': user_data
        }, status=status.HTTP_200_OK)

class CurrentUserView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user

class OfficeListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = Office.objects.all().order_by('code')
    serializer_class = OfficeSerializer
