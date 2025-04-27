from django.urls import path
from courses.api.views import (
    SubjectListView, SubjectDetailView, SubjectFavoriteView
)

app_name = 'courses'

urlpatterns = [
    path('subjects/', SubjectListView.as_view(), name='subject_list'),
    path('subjects/<int:pk>/', SubjectDetailView.as_view(), name='subject_detail'),
    path('subjects/<int:pk>/favorite/', SubjectFavoriteView.as_view(), name='subject_favorite'),
]