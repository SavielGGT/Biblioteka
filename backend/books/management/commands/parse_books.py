from django.core.management.base import BaseCommand
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from books.models import Book


class Command(BaseCommand):
    help = 'Парсинг книг з сайту books.toscrape.com з оновленням існуючих записів'

    def handle(self, *args, **kwargs):
        base_url = "https://books.toscrape.com/"
        headers = {
            'User-Agent': (
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                'AppleWebKit/537.36 (KHTML, like Gecko) '
                'Chrome/113.0.0.0 Safari/537.36'
            )
        }

        # Парсимо головну сторінку
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

            # URL картинки (відносний)
            image_relative_url = book.select_one('img')['src']
            # Абсолютний URL картинки
            image_url = urljoin(base_url, image_relative_url)

            # Жанр беремо з класу article або альтернативно з іншої частини - на books.toscrape.com немає прямого жанру тут, можна спробувати взяти з категорії на сторінці книги
            # Для прикладу, візьмемо категорію зі сторінки книги (потрібно запарсити сторінку детально)
            book_detail_relative_url = book.h3.a['href']
            book_detail_url = urljoin(base_url + "catalogue/", book_detail_relative_url)

            # Відкриваємо детальну сторінку книги, щоб взяти ціну і жанр (категорію)
            detail_resp = requests.get(book_detail_url, headers=headers)
            if detail_resp.status_code != 200:
                self.stdout.write(self.style.WARNING(f"Не вдалося отримати деталі книги {title}"))
                continue

            detail_soup = BeautifulSoup(detail_resp.text, 'html.parser')

            # Ціна
            price_str = detail_soup.select_one('p.price_color')
            price = price_str.text.strip() if price_str else ''

            # Жанр (категорія) - у breadcrumbs друга позиція після "Home"
            breadcrumbs = detail_soup.select('ul.breadcrumb li a')
            genre = breadcrumbs[2].text.strip() if len(breadcrumbs) > 2 else ''

            # Оновлення або створення книги в базі
            book_obj, created = Book.objects.update_or_create(
                title=title,
                defaults={
                    'image_url': image_url,
                    'genre': genre,
                    'price': price,
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"✅ Додано: {title}"))
            else:
                self.stdout.write(self.style.SUCCESS(f"🔄 Оновлено: {title}"))
