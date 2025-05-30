from django.core.management.base import BaseCommand
import requests
from bs4 import BeautifulSoup
from books.models import Book
from urllib.parse import urljoin


class Command(BaseCommand):
    help = 'Парсинг та оновлення назв, зображень, жанру та ціни книг'

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

            image_relative_url = book.select_one('img')['src']
            image_url = urljoin(base_url, image_relative_url)

            detail_relative_url = book.h3.a['href']
            detail_url = urljoin(base_url, detail_relative_url)

            genre = ''
            price = None

            detail_resp = requests.get(detail_url, headers=headers)
            if detail_resp.status_code == 200:
                detail_soup = BeautifulSoup(detail_resp.text, 'html.parser')

                breadcrumb_items = detail_soup.select('ul.breadcrumb li a')
                if len(breadcrumb_items) >= 3:
                    genre = breadcrumb_items[2].text.strip()

                price_tag = detail_soup.select_one('p.price_color')
                if price_tag:
                    price_text = price_tag.text.strip()  # наприклад "£53.74"
                    # Витягуємо число, видаляючи символ валюти та конвертуємо в float
                    try:
                        price = float(price_text.lstrip('£'))
                    except ValueError:
                        price = None
            else:
                self.stdout.write(self.style.WARNING(f"Не вдалося завантажити деталі для книги: {title}"))

            obj, created = Book.objects.update_or_create(
                title=title,
                defaults={
                    'image_url': image_url,
                    'genre': genre,
                    'price': price,
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"✅ Додано: {title} (Жанр: {genre}, Ціна: {price})"))
            else:
                self.stdout.write(self.style.SUCCESS(f"♻️ Оновлено: {title} (Жанр: {genre}, Ціна: {price})"))
