from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend

from .models import Book
from .serializers import BookSerializer
from .permissions import IsAdminOrReadOnly # переконайся, що файл permissions.py існує

class BookViewSet(viewsets.ModelViewSet):