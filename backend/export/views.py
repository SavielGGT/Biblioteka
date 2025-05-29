# 📁 export/views.py

from django.http import HttpResponse
from openpyxl import Workbook
from books.models import Book
from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser

class ExportBooksView(APIView):
    permission_classes = [IsAdminUser]  # Доступ лише для адміністраторів

    def get(self, request):
        books = Book.objects.all()

        wb = Workbook()
        ws = wb.active
        ws.title = "Books"

        # Заголовки колонок
        ws.append(["Title", "Author", "Genre", "Year", "Rating", "Description", "Image URL"])

        # Запис книг у таблицю
        for book in books:
            ws.append([
                book.title,
                book.author,
                book.genre,
                book.year,
                book.rating,
                book.description[:100],  # скорочено до 100 символів
                book.image_url
            ])

        # Повертаємо файл XLSX
        response = HttpResponse(
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response["Content-Disposition"] = 'attachment; filename=books_export.xlsx'
        wb.save(response)
        return response
