from django.http import HttpResponse
from openpyxl import Workbook
from books.models import Book
from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework import status

class ExportBooksView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        books = Book.objects.all()

        wb = Workbook()
        ws = wb.active
        ws.title = "Books"

        ws.append(["Title", "Author", "Genre", "Year", "Rating", "Description", "Image URL"])

        for book in books:
            ws.append([
                book.title,
                book.author,
                book.genre,
                book.year,
                book.rating,
                book.description[:100],  # щоб не заливало весь Excel
                book.image_url
            ])

        response = HttpResponse(content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        response["Content-Disposition"] = 'attachment; filename=books_export.xlsx'
        wb.save(response)
        return response
