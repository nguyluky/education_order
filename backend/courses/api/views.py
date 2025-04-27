from rest_framework import generics, permissions, status
from rest_framework.response import Response
from courses.models import Subject
from courses.serializers.subject_serializers import SubjectSerializer, SubjectDetailSerializer

class SubjectListView(generics.ListAPIView):
    """API view to list all available subjects."""
    serializer_class = SubjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Subject.objects.all()

class SubjectDetailView(generics.RetrieveAPIView):
    """API view to retrieve subject details including associated educators."""
    serializer_class = SubjectDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Subject.objects.all()

class SubjectFavoriteView(generics.UpdateAPIView):
    """API view to add/remove subjects from student favorites."""
    serializer_class = SubjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Subject.objects.all()
    
    def update(self, request, *args, **kwargs):
        subject = self.get_object()
        student = request.user.student_profile
        
        # Toggle favorite status
        if subject in student.favorite_subjects.all():
            student.favorite_subjects.remove(subject)
            action = "removed from"
        else:
            student.favorite_subjects.add(subject)
            action = "added to"
            
        return Response({"message": f"Subject {subject.name} {action} favorites."}, 
                       status=status.HTTP_200_OK)