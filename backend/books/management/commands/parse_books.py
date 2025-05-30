from django.core.management.base import BaseCommand
import requests
from bs4 import BeautifulSoup
from books.models import Book


class Command(BaseCommand):
    help = 'Парсинг назв та зображень книг з однієї сторінки'

    def handle(self, *args, **kwargs):
        url = "https://books.toscrape.com"
        headers = {
            'User-Agent': (
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                'AppleWebKit/537.36 (KHTML, like Gecko) '
                'Chrome/113.0.0.0 Safari/537.36'
            )
        }

        response = requests.get(url, headers=headers)

        if response.status_code != 200:
            self.stdout.write(self.style.ERROR(f"Сторінка недоступна: {response.status_code}"))
            return

        soup = BeautifulSoup(response.text, 'html.parser')

        book_items = soup.select('article.product_pod')

        if not book_items:
            self.stdout.write(self.style.WARNING("Книги не знайдено"))
            return

        for book in book_items:
            title = book.h3.a['title'].strip()
            image_relative_url = book.select_one('img')['src']
            image_url = f"{url}/{image_relative_url.lstrip('../')}"  # повна URL до картинки

            if not Book.objects.filter(title=title).exists():
                Book.objects.create(
                    title=title,
                    author='',
                    genre='',
                    year=None,
                    rating=None,
                    description='',
                    image_url=image_url
                )
                self.stdout.write(self.style.SUCCESS(f"✅ Додано: {title}"))
            else:
                self.stdout.write(self.style.WARNING(f"⚠️ Вже існує: {title}"))
