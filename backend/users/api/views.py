from rest_framework import status, generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404

from users.models import Student, Educator
from users.serializers.user_serializers import (
    UserLoginSerializer, UserSerializer, UserRegistrationSerializer, StudentSerializer,
    EducatorSerializer, EducatorRegistrationSerializer
)

User = get_user_model()

class UserRegistrationView(generics.CreateAPIView):
    """API view for user registration."""
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            print(Token)
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user_id': user.id,
                'email': user.email,
                'user_type': user.user_type
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EducatorRegistrationView(generics.CreateAPIView):
    """API view for educator registration with verification documents."""
    serializer_class = EducatorRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            educator = serializer.save()
            user = educator.user
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user_id': user.id,
                'email': user.email,
                'user_type': user.user_type,
                'verification_status': educator.verification_status
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CustomAuthToken(generics.CreateAPIView):
    """Custom token authentication view with user details."""
    serializer_class = UserLoginSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.id,
            'email': user.email,
            'user_type': user.user_type
        })

class LogoutView(APIView):
    """API view for user logout."""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        # Delete the user's token to logout
        request.user.auth_token.delete()
        return Response({"message": "Successfully logged out."}, status=status.HTTP_200_OK)

class UserProfileView(generics.RetrieveUpdateAPIView):
    """API view to retrieve or update user profile."""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user

class StudentProfileView(generics.RetrieveUpdateAPIView):
    """API view to retrieve or update student profile."""
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return get_object_or_404(Student, user=self.request.user)

class EducatorProfileView(generics.RetrieveUpdateAPIView):
    """API view to retrieve or update educator profile."""
    serializer_class = EducatorSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return get_object_or_404(Educator, user=self.request.user)

class EducatorListView(generics.ListAPIView):
    """API view to list all verified educators."""
    serializer_class = EducatorSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Educator.objects.filter(verification_status='verified')
        subject_id = self.request.query_params.get('subject_id', None)
        if subject_id:
            queryset = queryset.filter(subjects__id=subject_id)
        return queryset

class EducatorDetailView(generics.RetrieveAPIView):
    """API view to retrieve educator details."""
    serializer_class = EducatorSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Educator.objects.all()