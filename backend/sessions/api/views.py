from rest_framework import generics, permissions, status
from rest_framework.response import Response

from sessions.models import Session, Review
from sessions.serializers.session_serializers import (
    SessionSerializer, SessionCreateSerializer, 
    ReviewSerializer, ReviewCreateSerializer
)

# Custom permission classes
class IsStudent(permissions.BasePermission):
    """Permission to check if user is a student."""
    def has_permission(self, request, view):
        return request.user.user_type == 'student'

class IsEducator(permissions.BasePermission):
    """Permission to check if user is an educator."""
    def has_permission(self, request, view):
        return request.user.user_type == 'educator'

class SessionListView(generics.ListAPIView):
    """API view to list sessions based on user role."""
    serializer_class = SessionSerializer

class MySessionsListView(generics.ListAPIView):
    """API view to list user's sessions with status filtering."""
    serializer_class = SessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        status_filter = self.request.query_params.get('status', None)
        
        # Base queryset depends on user type
        if user.user_type == 'student':
            queryset = Session.objects.filter(student__user=user)
        elif user.user_type == 'educator':
            queryset = Session.objects.filter(educator__user=user)
        else:
            return Session.objects.none()
        
        # Apply status filter if provided
        if status_filter:
            queryset = queryset.filter(status=status_filter)
            
        return queryset.order_by('-start_time')

class SessionCreateView(generics.CreateAPIView):
    """API view for students to book a new session with an educator."""
    serializer_class = SessionCreateSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        return context

class SessionDetailView(generics.RetrieveAPIView):
    """API view to retrieve session details."""
    serializer_class = SessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'student':
            return Session.objects.filter(student__user=user)
        elif user.user_type == 'educator':
            return Session.objects.filter(educator__user=user)
        return Session.objects.none()

class SessionUpdateStatusView(generics.UpdateAPIView):
    """API view for educators to update session status (confirm/cancel)."""
    serializer_class = SessionSerializer
    permission_classes = [permissions.IsAuthenticated, IsEducator]
    http_method_names = ['patch']
    
    def get_queryset(self):
        return Session.objects.filter(educator__user=self.request.user)
    
    def patch(self, request, *args, **kwargs):
        session = self.get_object()
        status_value = request.data.get('status')
        
        # Validate status transition
        if status_value not in ['confirmed', 'canceled', 'completed']:
            return Response(
                {"error": "Invalid status. Must be 'confirmed', 'canceled', or 'completed'."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update session status
        session.status = status_value
        session.save()
        
        return Response({"message": f"Session status updated to {status_value}"}, status=status.HTTP_200_OK)

class ReviewCreateView(generics.CreateAPIView):
    """API view for students to create a review for a completed session."""
    serializer_class = ReviewCreateSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        return context

class ReviewListView(generics.ListAPIView):
    """API view to list reviews for an educator."""
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        educator_id = self.kwargs.get('educator_id')
        return Review.objects.filter(
            session__educator__id=educator_id,
            session__status='completed'
        )