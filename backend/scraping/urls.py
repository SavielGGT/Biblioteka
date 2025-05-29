from django.urls import path
from .views import ScrapeBooksView, ExportBooksView

urlpatterns = [
    path('scrape/', ScrapeBooksView.as_view(), name='scrape-books'),
    path('export/', ExportBooksView.as_view(), name='export-books'),
]
