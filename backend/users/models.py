from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _

class UserManager(BaseUserManager):
    """Define a model manager for User model with no username field."""

    def _create_user(self, email, password=None, **extra_fields):
        """Create and save a User with the given email and password."""
        if not email:
            raise ValueError('The given email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(email, password, **extra_fields)

class User(AbstractUser):
    """Custom User model that uses email as the unique identifier."""
    
    USERNAME_FIELD = 'email'
    EMAIL_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    
    USER_TYPE_CHOICES = (
        ('student', 'Student'),
        ('educator', 'Educator'),
        ('admin', 'Admin'),
    )
    
    username = None
    email = models.EmailField(_('email address'), unique=True)
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES, default='student')
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)
    
    objects = UserManager()
    
    def __str__(self):
        return self.email

class Student(models.Model):
    """Student profile model extending the base User."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    favorite_subjects = models.ManyToManyField('courses.Subject', related_name='interested_students', blank=True)
    
    def __str__(self):
        return f"Student: {self.user.email}"

class Educator(models.Model):
    """Educator profile model extending the base User."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='educator_profile')
    degree = models.CharField(max_length=255)
    degree_certificate = models.FileField(upload_to='certificates/', blank=True)
    id_verification = models.FileField(upload_to='id_verification/', blank=True)
    hourly_rate = models.DecimalField(max_digits=6, decimal_places=2)
    subjects = models.ManyToManyField('courses.Subject', related_name='educators')
    verification_status = models.CharField(max_length=20, 
                                          choices=[('pending', 'Pending'), 
                                                   ('verified', 'Verified'),
                                                   ('rejected', 'Rejected')],
                                          default='pending')
    contract_signed = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Educator: {self.user.email}"
