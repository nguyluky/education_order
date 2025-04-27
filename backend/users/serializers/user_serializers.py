from rest_framework import serializers
# from rest_framework.compat import authenticate
from django.contrib.auth import get_user_model, authenticate
from users.models import Student, Educator

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """Serializer for the custom User model."""
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'user_type', 
                  'profile_picture', 'bio', 'date_joined', 'is_verified']
        read_only_fields = ['date_joined', 'is_verified']

class UserLoginSerializer(serializers.Serializer):
    email = serializers.CharField(label="Email")
    password = serializers.CharField(
        label="Password",
        style={'input_type': 'password'},
        trim_whitespace=False
    )

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(request=self.context.get('request'),
                                email=email, password=password)

            # The authenticate call simply returns None for is_active=False
            # users. (Assuming the default ModelBackend authentication
            # backend.)
            if not user:
                msg = 'Unable to log in with provided credentials.'
                raise serializers.ValidationError(msg, code='authorization')
        else:
            msg = 'Must include "email" and "password".'
            raise serializers.ValidationError(msg, code='authorization')

        attrs['user'] = user
        return attrs

# class UserLoginSerializer(serializers.ModelSerializer):
    
#     """Serializer for user login."""
#     email = serializers.EmailField(required=True)
#     password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    
#     class Meta:
#         model = User
#         fields = ['email', 'password']
    
#     def validate(self, attrs):
        
#         email = attrs.get('email')
#         password = attrs.get('password')
        
#         try:
#             user = User.objects.get(email=email)
#         except User.DoesNotExist:
#             raise serializers.ValidationError("User with this email does not exist.")
        
#         if not user.check_password(password):
#             raise serializers.ValidationError("Incorrect password.")
        
#         return attrs

class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    confirm_password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    
    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'password', 'confirm_password', 
                  'user_type', 'profile_picture', 'bio']
    
    def validate(self, attrs):
        return attrs
    
    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            user_type=validated_data.get('user_type', 'student'),
            profile_picture=validated_data.get('profile_picture', None),
            bio=validated_data.get('bio', '')
        )
        
        # Create profile based on user type
        if user.user_type == 'student':
            Student.objects.create(user=user)
        elif user.user_type == 'educator':
            Educator.objects.create(
                user=user,
                hourly_rate=0.00,  # Default rate, will be updated later
                degree='',  # Will be updated during verification
            )
        
        return user

class StudentSerializer(serializers.ModelSerializer):
    """Serializer for the Student model."""
    user = UserSerializer(read_only=True)
    favorite_subjects = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    
    class Meta:
        model = Student
        fields = ['id', 'user', 'favorite_subjects']

class EducatorSerializer(serializers.ModelSerializer):
    """Serializer for the Educator model."""
    user = UserSerializer(read_only=True)
    subjects = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    
    class Meta:
        model = Educator
        fields = ['id', 'user', 'degree', 'hourly_rate', 'subjects', 
                  'verification_status', 'contract_signed']
        read_only_fields = ['verification_status', 'contract_signed']

class EducatorRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for educator registration with verification documents."""
    user = UserRegistrationSerializer()
    
    class Meta:
        model = Educator
        fields = ['user', 'degree', 'degree_certificate', 'id_verification', 'hourly_rate']
    
    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user_data['user_type'] = 'educator'
        
        serializer = UserRegistrationSerializer(data=user_data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        educator = Educator.objects.get(user=user)
        educator.degree = validated_data.get('degree', '')
        educator.degree_certificate = validated_data.get('degree_certificate', None)
        educator.id_verification = validated_data.get('id_verification', None)
        educator.hourly_rate = validated_data.get('hourly_rate', 0.00)
        educator.save()
        
        return educator