from rest_framework import serializers
from courses.models import Subject
from users.serializers.user_serializers import EducatorSerializer

class SubjectSerializer(serializers.ModelSerializer):
    """Serializer for the Subject model."""
    class Meta:
        model = Subject
        fields = ['id', 'name', 'description', 'icon']

class SubjectDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for Subject model including related educators."""
    educators = EducatorSerializer(many=True, read_only=True)
    
    class Meta:
        model = Subject
        fields = ['id', 'name', 'description', 'icon', 'educators']