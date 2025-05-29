from rest_framework.test import APITestCase
from rest_framework import status
from users.models import User
from rest_framework_simplejwt.tokens import RefreshToken

class ProfileTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='test@example.com', password='testpass')
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)

    def test_profile_authenticated(self):
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.access_token)
        response = self.client.get('/api/profile/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['email'], 'test@example.com')

    def test_profile_unauthenticated(self):
        response = self.client.get('/api/profile/')
        self.assertEqual(response.status_code, 401)
