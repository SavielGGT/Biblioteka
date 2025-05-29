from django.core.management.base import BaseCommand
from scraping.utils import export_books_to_excel
import os

class Command(BaseCommand):
    help = 'Export books to Excel file (books.xlsx)'

    def handle(self, *args, **kwargs):
        response = export_books_to_excel()
        path = os.path.join(os.getcwd(), 'books.xlsx')
        with open(path, 'wb') as f:
            f.write(response.content)
        self.stdout.write(self.style.SUCCESS(f"✔ Exported to: {path}"))
