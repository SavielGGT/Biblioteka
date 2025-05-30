from django.db import models

class Book(models.Model):
title = models.CharField(max_length=255)
author = models.CharField(max_length=255, blank=True, null=True)
genre = models.CharField(max_length=100, blank=True, null=True)
year = models.PositiveIntegerField(blank=True, null=True)
rating = models.FloatField(blank=True, null=True)
description = models.TextField(blank=True)
# Абсолютне посилання на зображення обкладинки (з сайту)
image_url = models.URLField(blank=True, null=True)

# Посилання на детальну сторінку книги (з books.toscrape.com)
source_url = models.URLField(blank=True, null=True)

# Дата та час додавання в БД
created_at = models.DateTimeField(auto_now_add=True)

def __str__(self):
    author_display = self.author if self.author else "Unknown"
    return f"{self.title} by {author_display}"
