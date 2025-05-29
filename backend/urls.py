from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # API
    path('api/', include('users.urls')),   # 📁 users/
    path('api/', include('books.urls')),   # 📁 books/
    path('api/', include('export.urls')),  # 📁 export/
]
