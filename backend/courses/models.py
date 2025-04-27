from django.db import models

class Subject(models.Model):
    """Model representing academic subjects offered on the platform."""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    icon = models.ImageField(upload_to='subject_icons/', blank=True, null=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name
