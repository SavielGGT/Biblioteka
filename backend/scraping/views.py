from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework import status
from .utils import scrape_books, export_books_to_excel

class ScrapeBooksView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        created, updated = scrape_books()
        return Response({
            "message": "Scraping complete.",
            "created": created,
            "updated": updated
        }, status=status.HTTP_200_OK)

class ExportBooksView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        return export_books_to_excel()
