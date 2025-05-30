from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework import status
from django.http import HttpResponse

from .utils import scrape_books, export_books_to_excel

class ScrapeBooksView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        try:
            count = scrape_books()
            return Response({"message": f"Успішно додано {count} книг."})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ExportBooksView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        try:
            file = export_books_to_excel()
            response = HttpResponse(file, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            response['Content-Disposition'] = 'attachment; filename=books.xlsx'
            return response
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
