from django.core.management.base import BaseCommand
from scraping.utils import scrape_books

class Command(BaseCommand):
    help = 'Scrape books from books.toscrape.com'

    def handle(self, *args, **kwargs):
        created, updated = scrape_books()
        self.stdout.write(self.style.SUCCESS(f"Scraping complete. Created: {created}, Updated: {updated}"))
