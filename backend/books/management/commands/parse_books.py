from django.core.management.base import BaseCommand
import requests
from bs4 import BeautifulSoup
from books.models import Book


class Command(BaseCommand):
    help = 'Парсинг назв, зображень, жанру та року книг з однієї сторінки'

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
            image_url = f"{url}/{image_relative_url.lstrip('../')}"

            # Отримуємо посилання на детальну сторінку книги
            detail_relative_url = book.h3.a['href']
            detail_url = f"{url}/catalogue/{detail_relative_url.lstrip('../')}"

            # Запит до детальної сторінки
            detail_resp = requests.get(detail_url, headers=headers)
            if detail_resp.status_code != 200:
                self.stdout.write(self.style.WARNING(f"Не вдалося завантажити деталі для книги: {title}"))
                genre = ''
                year = None
            else:
                detail_soup = BeautifulSoup(detail_resp.text, 'html.parser')

                # Витягуємо жанр із breadcrumbs (3-й елемент)
                breadcrumb = detail_soup.select('ul.breadcrumb li a')
                genre = breadcrumb[2].text.strip() if len(breadcrumb) >= 3 else ''

                # Спроба витягти рік — на цьому сайті немає, ставимо None
                year = None

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
                self.stdout.write(self.style.SUCCESS(f"✅ Додано: {title}"))
            else:
                self.stdout.write(self.style.WARNING(f"⚠️ Вже існує: {title}"))
