import requests
from bs4 import BeautifulSoup
from books.models import Book
import openpyxl
import io
from django.http import HttpResponse

BASE_URL = "https://books.toscrape.com/"

def scrape_books():
    created, updated = 0, 0
    page = 1

    while True:
        url = f"{BASE_URL}catalogue/page-{page}.html"
        res = requests.get(url)
        if res.status_code != 200:
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

            try:
                rating_str = detail_soup.select_one(".star-rating")["class"][1]
                rating = ["Zero", "One", "Two", "Three", "Four", "Five"].index(rating_str)
            except:
                rating = 0

            book_obj, created_flag = Book.objects.update_or_create(
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

            if created_flag:
                created += 1
            else:
                updated += 1

        page += 1

    return created, updated

def export_books_to_excel():
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Books"

    headers = ["Title", "Author", "Genre", "Year", "Rating", "Description", "Image URL"]
    ws.append(headers)

    for book in Book.objects.all():
        ws.append([
            book.title,
            book.author,
            book.genre,
            book.year,
            book.rating,
            book.description,
            book.image_url
        ])

    stream = io.BytesIO()
    wb.save(stream)
    stream.seek(0)

    response = HttpResponse(
        stream,
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = 'attachment; filename=books.xlsx'
    return response
