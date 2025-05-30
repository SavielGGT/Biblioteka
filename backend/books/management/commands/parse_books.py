from django.core.management.base import BaseCommand
import requests
from bs4 import BeautifulSoup
from books.models import Book
from urllib.parse import urljoin


class Command(BaseCommand):
    help = 'Парсинг назв, зображень, жанру та року книг з однієї сторінки'

    def handle(self, *args, **kwargs):
        base_url = "https://books.toscrape.com/"
        headers = {
            'User-Agent': (
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                'AppleWebKit/537.36 (KHTML, like Gecko) '
                'Chrome/113.0.0.0 Safari/537.36'
            )
        }

        response = requests.get(base_url, headers=headers)
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

            # Формуємо повний URL до зображення
            image_relative_url = book.select_one('img')['src']
            image_url = urljoin(base_url, image_relative_url)

            # Формуємо повний URL до детальної сторінки
            detail_relative_url = book.h3.a['href']
            detail_url = urljoin(base_url, detail_relative_url)

            genre = ''
            year = None  # На цьому сайті немає року, тому залишаємо None

            # Запитуємо детальну сторінку для отримання жанру
            detail_resp = requests.get(detail_url, headers=headers)
            if detail_resp.status_code == 200:
                detail_soup = BeautifulSoup(detail_resp.text, 'html.parser')

                # Жанр на сайті знаходиться в хлібних крихтах (breadcrumb) під 3-м <li> (індекс 2)
                breadcrumb_items = detail_soup.select('ul.breadcrumb li a')
                if len(breadcrumb_items) >= 3:
                    genre = breadcrumb_items[2].text.strip()
            else:
                self.stdout.write(self.style.WARNING(f"Не вдалося завантажити деталі для книги: {title}"))

            # Записуємо книгу в базу (якщо такої ще немає)
            if not Book.objects.filter(title=title).exists():
                Book.objects.create(
                    title=title,
                    author='',
                    genre=genre,
                    year=year,
                    rating=None,
                    description='',
                    image_url=image_url
                )
                self.stdout.write(self.style.SUCCESS(f"✅ Додано: {title} (Жанр: {genre})"))
            else:
                self.stdout.write(self.style.WARNING(f"⚠️ Вже існує: {title}"))
