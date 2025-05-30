from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Book
from .serializers import BookSerializer

class BookListAPIView(APIView):
"""
API endpoint, що повертає список усіх книг.
"""
def get(self, request):
books = Book.objects.all().order_by('-created_at') # Останні — першими
serializer = BookSerializer(books, many=True)
return Response(serializer.data)