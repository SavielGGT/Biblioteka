import requests
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from books.models import Book

BASE_URL = "https://books.toscrape.com/"

class Command(BaseCommand):
    help = 'Scrape books from books.toscrape.com'

    def handle(self, *args, **kwargs):
        page = 1
        while True:
            url = f"{BASE_URL}catalogue/page-{page}.html"
            res = requests.get(url)

            if res.status_code != 200:
                self.stdout.write(self.style.WARNING(f"Page {page} not found. Stopping."))
                break

            soup = BeautifulSoup(res.content, "html.parser")
            books = soup.select(".product_pod")

            for book in books:
                title = book.h3.a["title"]
                relative_url = book.h3.a["href"]
                book_url = BASE_URL + "catalogue/" + relative_url

                detail_res = requests.get(book_url)
                detail_soup = BeautifulSoup(detail_res.content, "html.parser")

                description_tag = detail_soup.select_one("#product_description ~ p")
                description = description_tag.get_text(strip=True) if description_tag else "No description"

                image_rel_url = detail_soup.select_one(".item img")["src"].replace("../", "")
                image_url = BASE_URL + image_rel_url

                price = detail_soup.select_one(".price_color").text.replace("£", "")
                try:
                    rating_str = detail_soup.select_one(".star-rating")["class"][1]
                    rating = ["Zero", "One", "Two", "Three", "Four", "Five"].index(rating_str)
                except:
                    rating = 0

                Book.objects.get_or_create(
                    title=title,
                    defaults={
                        "author": "Unknown",
                        "genre": "General",
                        "year": 2020,
                        "rating": rating,
                        "description": description,
                        "image_url": image_url,
                    }
                )

                self.stdout.write(self.style.SUCCESS(f"✔ Saved: {title}"))

            page += 1
