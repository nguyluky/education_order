from django.urls import path
from sessions.api.views import (
    MySessionsListView, SessionListView, SessionCreateView, SessionDetailView, SessionUpdateStatusView,
    ReviewCreateView, ReviewListView
)

app_name = 'sessions'

urlpatterns = [
    # Session endpoints
    path('', SessionListView.as_view(), name='session_list'),
    path('create/', SessionCreateView.as_view(), name='session_create'),
    path('<int:pk>/', SessionDetailView.as_view(), name='session_detail'),
    path('<int:pk>/status/', SessionUpdateStatusView.as_view(), name='session_update_status'),
    path('my-sessions/', MySessionsListView.as_view(), name='my_sessions'),
    
    # Review endpoints
    path('reviews/create/', ReviewCreateView.as_view(), name='review_create'),
    path('educator/<int:educator_id>/reviews/', ReviewListView.as_view(), name='educator_reviews'),
]