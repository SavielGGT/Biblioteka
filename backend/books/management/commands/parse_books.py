from django.core.management.base import BaseCommand
import requests
from bs4 import BeautifulSoup
from books.models import Book
from urllib.parse import urljoin


class Command(BaseCommand):
    help = 'Парсинг книг з books.toscrape.com (назва, жанр, ціна, локальне зображення)'

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

            # Витягуємо шлях до зображення (відносний, типу '../../media/cache/...')
            img_tag = book.select_one('img')
            raw_img_url = img_tag['src']  # приклад: '../../media/cache/xx/xx/image.jpg'

            # Очистимо шлях: заберемо '../' на початку, отримаємо 'media/cache/...'
            if raw_img_url.startswith('../../'):
                local_img_path = raw_img_url.replace('../../', '', 1)
            else:
                local_img_path = raw_img_url.lstrip('/')

            # Повна URL-адреса на сайті (не зберігаємо, але можемо використовувати при потребі)
            # full_image_url = urljoin(base_url, raw_img_url)

            # Посилання на сторінку книги
            detail_relative_url = book.h3.a['href']
            detail_url = urljoin(base_url, detail_relative_url)

            # Ініціалізація
            genre = ''
            price = None

            # Деталі з внутрішньої сторінки
            detail_resp = requests.get(detail_url, headers=headers)
            if detail_resp.status_code == 200:
                detail_soup = BeautifulSoup(detail_resp.text, 'html.parser')

                # Жанр
                breadcrumb_items = detail_soup.select('ul.breadcrumb li a')
                if len(breadcrumb_items) >= 3:
                    genre = breadcrumb_items[2].text.strip()

                # Ціна
                price_tag = detail_soup.select_one('p.price_color')
                if price_tag:
                    try:
                        price_text = price_tag.text.strip()
                        price = float(price_text.replace('£', ''))
                    except ValueError:
                        price = None

            # Збереження
            book_obj, created = Book.objects.update_or_create(
                title=title,
                defaults={
                    'author': '',
                    'genre': genre,
                    'year': None,
                    'price': price,
                    'rating': None,
                    'description': '',
                    'image_url': local_img_path,  # ✅ тільки відносний шлях
                }
            )

            if created:
                self.stdout.write(self.style.SUCCESS(f"✅ Додано: {title}"))
            else:
                self.stdout.write(self.style.SUCCESS(f"🔄 Оновлено: {title}"))
