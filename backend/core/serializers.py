from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from .models import User, Office

class OfficeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Office
        fields = [
            'id', 'code', 'name_fr', 'name_ar',
            'wilaya', 'address_fr', 'address_ar', 'phone'
        ]

class UserProfileSerializer(serializers.ModelSerializer):
    assigned_office_detail = OfficeSerializer(source='assigned_office', read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'phone_number', 'full_name', 'role',
            'assigned_office', 'assigned_office_detail', 'preferred_language'
        ]
        read_only_fields = ['id', 'role']

class CustomerRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=4)

    class Meta:
        model = User
        fields = ['phone_number', 'password', 'full_name', 'preferred_language']

    def create(self, validated_data):
        password = validated_data.pop('password')
        phone = validated_data.get('phone_number').strip().replace(' ', '')
        validated_data['phone_number'] = phone
        validated_data['username'] = phone
        validated_data['role'] = User.Role.CUSTOMER

        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        return user

class LoginSerializer(serializers.Serializer):
    phone_number = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        phone_number = attrs.get('phone_number', '').strip().replace(' ', '')
        password = attrs.get('password')

        user = authenticate(username=phone_number, password=password)
        if not user:
            # Also try looking up by phone_number directly in case username was different
            try:
                user_obj = User.objects.get(phone_number=phone_number)
                if user_obj.check_password(password):
                    user = user_obj
            except User.DoesNotExist:
                user = None

        if not user:
            raise serializers.ValidationError({"error": "Numéro de téléphone ou mot de passe incorrect."})

        if not user.is_active:
            raise serializers.ValidationError({"error": "Compte désactivé."})

        attrs['user'] = user
        return attrs
