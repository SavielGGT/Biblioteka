from django.core import mail
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from rest_framework.test import APITestCase
from rest_framework import status
from users.models import User

class PasswordResetTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='reset@example.com', password='testpass')

    def test_password_reset_email_sent(self):
        response = self.client.post('/api/password-reset/', {'email': 'reset@example.com'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)

    def test_password_reset_confirm_valid(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)
        response = self.client.post('/api/password-reset/confirm/', {
            'uid': uid,
            'token': token,
            'password': 'newpass123'
        })
        self.assertEqual(response.status_code, 200)

    def test_password_reset_confirm_invalid(self):
        response = self.client.post('/api/password-reset/confirm/', {
            'uid': 'invalid',
            'token': 'invalid',
            'password': 'newpass123'
        })
        self.assertEqual(response.status_code, 400)
