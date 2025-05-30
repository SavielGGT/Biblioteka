from django.core.management.base import BaseCommand
import requests
from bs4 import BeautifulSoup
from books.models import Book
from urllib.parse import urljoin


class Command(BaseCommand):
    help = 'Парсинг книг з books.toscrape.com: назва, жанр, ціна, рейтинг, повне посилання на зображення'

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

            # Зображення
            raw_img_src = book.find('img')['src']
            image_url = urljoin(base_url, raw_img_src)

            # Посилання на деталі
            detail_href = book.h3.a['href']
            detail_url = urljoin(base_url, detail_href)

            # Ініціалізація
            genre = ''
            price = None
            rating = None

            # Парсимо сторінку з деталями
            detail_resp = requests.get(detail_url, headers=headers)
            if detail_resp.status_code == 200:
                detail_soup = BeautifulSoup(detail_resp.text, 'html.parser')

                # Жанр
                breadcrumb_links = detail_soup.select('ul.breadcrumb li a')
                if len(breadcrumb_links) >= 3:
                    genre = breadcrumb_links[2].text.strip()

                # Ціна
                price_tag = detail_soup.select_one('p.price_color')
                if price_tag:
                    try:
                        price = float(price_tag.text.strip().lstrip('£'))
                    except ValueError:
                        price = None

                # Рейтинг
                rating_tag = detail_soup.select_one('p.star-rating')
                if rating_tag:
                    rating_classes = rating_tag.get('class', [])
                    rating_map = {
                        'One': 1,
                        'Two': 2,
                        'Three': 3,
                        'Four': 4,
                        'Five': 5
                    }
                    for cls in rating_classes:
                        if cls in rating_map:
                            rating = rating_map[cls]
                            break

            # Зберігаємо книгу
            book_obj, created = Book.objects.update_or_create(
                title=title,
                defaults={
                    'author': '',
                    'genre': genre,
                    'year': None,
                    'price': price,
                    'rating': rating,
                    'description': '',
                    'image_url': image_url,
                    'source_url': detail_url
                }
            )

            status = "✅ Додано" if created else "🔄 Оновлено"
            self.stdout.write(self.style.SUCCESS(f"{status}: {title} — £{price} — ⭐ {rating} — {genre}"))
