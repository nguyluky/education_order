from django.urls import path
from users.api.views import (
    UserRegistrationView, EducatorRegistrationView, CustomAuthToken,
    LogoutView, UserProfileView, StudentProfileView, EducatorProfileView,
    EducatorListView, EducatorDetailView
)

app_name = 'users'

urlpatterns = [
    # Authentication endpoints
    path('register/', UserRegistrationView.as_view(), name='user_register'),
    path('register/educator/', EducatorRegistrationView.as_view(), name='educator_register'),
    path('login/', CustomAuthToken.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    
    # Profile endpoints
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('profile/student/', StudentProfileView.as_view(), name='student_profile'),
    path('profile/educator/', EducatorProfileView.as_view(), name='educator_profile'),
    
    # Educator endpoints
    path('educators/', EducatorListView.as_view(), name='educator_list'),
    path('educators/<int:pk>/', EducatorDetailView.as_view(), name='educator_detail'),
]