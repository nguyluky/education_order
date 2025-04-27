from django.apps import AppConfig


class SessionsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'sessions'
    label = 'learning_sessions'  # Add a unique label to avoid conflict with Django's sessions
