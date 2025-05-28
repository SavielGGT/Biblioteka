from django.urls import path
from .views import BookListCreateView, BookUpdateDeleteView

urlpatterns = [
    path('books/', BookListCreateView.as_view(), name='book-list-create'),
    path('books/<int:pk>/', BookUpdateDeleteView.as_view(), name='book-update-delete'),
]
