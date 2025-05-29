from rest_framework.test import APITestCase
from rest_framework import status
from users.models import User

class AuthTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='test@example.com', password='testpass')

    def test_login_success(self):
        response = self.client.post('/api/token/', {
            'email': 'test@example.com',
            'password': 'testpass'
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)

    def test_login_fail(self):
        response = self.client.post('/api/token/', {
            'email': 'test@example.com',
            'password': 'wrongpass'
        })
        self.assertEqual(response.status_code, 401)
