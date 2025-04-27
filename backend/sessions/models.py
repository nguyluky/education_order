from django.db import models
from django.utils import timezone

class Session(models.Model):
    """Model representing tutoring sessions between students and educators."""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('canceled', 'Canceled'),
    ]
    
    student = models.ForeignKey('users.Student', on_delete=models.CASCADE, related_name='booked_sessions')
    educator = models.ForeignKey('users.Educator', on_delete=models.CASCADE, related_name='teaching_sessions')
    subject = models.ForeignKey('courses.Subject', on_delete=models.CASCADE, related_name='sessions')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    meeting_link = models.URLField(blank=True, null=True)
    session_notes = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-start_time']
    
    def __str__(self):
        return f"{self.subject} - {self.student} with {self.educator} ({self.start_time.strftime('%Y-%m-%d %H:%M')})"
    
    @property
    def duration_minutes(self):
        """Calculate the duration of the session in minutes."""
        delta = self.end_time - self.start_time
        return delta.seconds // 60
    
    @property
    def session_cost(self):
        """Calculate the cost of the session based on educator's hourly rate."""
        hourly_rate = self.educator.hourly_rate
        hours = self.duration_minutes / 60
        return hours * hourly_rate
    
    def is_upcoming(self):
        """Check if the session is in the future."""
        return self.start_time > timezone.now()
    
class Review(models.Model):
    """Model representing reviews for completed sessions."""
    
    session = models.OneToOneField(Session, on_delete=models.CASCADE, related_name='review')
    rating = models.PositiveSmallIntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Review for {self.session}"
