
from django.urls import path
from .views import BookListCreateView, BookUpdateDeleteView

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookViewSet

router = DefaultRouter()
router.register('books', BookViewSet, basename='book')


urlpatterns = [
    path('books/', BookListCreateView.as_view(), name='book-list-create'),
    path('books/<int:pk>/', BookUpdateDeleteView.as_view(), name='book-update-delete'),
]
