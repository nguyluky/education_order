from rest_framework import serializers
from sessions.models import Session, Review
from users.serializers.user_serializers import StudentSerializer, EducatorSerializer
from courses.serializers.subject_serializers import SubjectSerializer

class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for the Review model."""
    class Meta:
        model = Review
        fields = ['id', 'session', 'rating', 'comment', 'created_at']
        read_only_fields = ['created_at']

class SessionSerializer(serializers.ModelSerializer):
    """Serializer for Session model."""
    student = StudentSerializer(read_only=True)
    educator = EducatorSerializer(read_only=True)
    subject = SubjectSerializer(read_only=True)
    review = ReviewSerializer(read_only=True)
    duration_minutes = serializers.ReadOnlyField()
    session_cost = serializers.ReadOnlyField()
    
    class Meta:
        model = Session
        fields = ['id', 'student', 'educator', 'subject', 'start_time', 'end_time', 
                 'status', 'created_at', 'updated_at', 'meeting_link', 'session_notes',
                 'duration_minutes', 'session_cost', 'review']
        read_only_fields = ['created_at', 'updated_at']

class SessionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new session."""
    educator_id = serializers.IntegerField(write_only=True)
    subject_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Session
        fields = ['educator_id', 'subject_id', 'start_time', 'end_time', 'session_notes']
    
    def create(self, validated_data):
        # Extract IDs from validated data
        educator_id = validated_data.pop('educator_id')
        subject_id = validated_data.pop('subject_id')
        
        # Get the current user as student
        student = self.context['request'].user.student_profile
        
        # Create the session
        session = Session.objects.create(
            student=student,
            educator_id=educator_id,
            subject_id=subject_id,
            **validated_data
        )
        
        return session

class ReviewCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a review for a completed session."""
    class Meta:
        model = Review
        fields = ['session', 'rating', 'comment']
    
    def validate_session(self, session):
        """Validate that the session is completed and doesn't have a review already."""
        if session.status != 'completed':
            raise serializers.ValidationError("You can only review completed sessions.")
        
        if hasattr(session, 'review'):
            raise serializers.ValidationError("This session has already been reviewed.")
        
        # Verify that the user is the student who attended the session
        if session.student.user != self.context['request'].user:
            raise serializers.ValidationError("You can only review your own sessions.")
        
        return session