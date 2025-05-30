from django.core.management.base import BaseCommand
import requests
from bs4 import BeautifulSoup
from books.models import Book
from urllib.parse import urljoin


class Command(BaseCommand):
    help = 'Парсинг назв, зображень, жанру та ціни книг з головної сторінки books.toscrape.com'

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

            # Витягуємо відносне посилання на зображення та очищуємо від '../'
            image_relative_url = book.select_one('img')['src'].strip()
            while image_relative_url.startswith('../'):
                image_relative_url = image_relative_url[3:]
            image_url = urljoin(base_url, image_relative_url)

            # Витягуємо посилання на детальну сторінку
            detail_relative_url = book.h3.a['href']
            detail_url = urljoin(base_url, detail_relative_url)

            genre = ''
            price = None

            # Завантажуємо детальну сторінку книги для отримання жанру та ціни
            detail_resp = requests.get(detail_url, headers=headers)
            if detail_resp.status_code == 200:
                detail_soup = BeautifulSoup(detail_resp.text, 'html.parser')

                # Жанр у хлібних крихтах — третій <li> (індекс 2)
                breadcrumb_items = detail_soup.select('ul.breadcrumb li a')
                if len(breadcrumb_items) >= 3:
                    genre = breadcrumb_items[2].text.strip()

                # Ціна - на сторінці у <p class="price_color">
                price_tag = detail_soup.select_one('p.price_color')
                if price_tag:
                    # Видаляємо символ валюти та конвертуємо в float
                    price_str = price_tag.text.strip()
                    # Приклад: '£53.74' -> 53.74
                    price = float(price_str.lstrip('£'))
            else:
                self.stdout.write(self.style.WARNING(f"Не вдалося завантажити деталі для книги: {title}"))

            # Оновлюємо або створюємо книгу у базі
            book_obj, created = Book.objects.update_or_create(
                title=title,
                defaults={
                    'author': '',
                    'genre': genre,
                    'year': None,   # року нема на сайті, залишаємо None
                    'price': price,
                    'rating': None,
                    'description': '',
                    'image_url': image_url,
                }
            )

            if created:
                self.stdout.write(self.style.SUCCESS(f"✅ Додано: {title} (Жанр: {genre}, Ціна: {price})"))
            else:
                self.stdout.write(self.style.SUCCESS(f"🔄 Оновлено: {title} (Жанр: {genre}, Ціна: {price})"))
