from django.urls import path
from .views import ExportBooksView

urlpatterns = [
    path('export/', ExportBooksView.as_view(), name='export-books'),
]
