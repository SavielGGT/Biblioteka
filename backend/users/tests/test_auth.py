def test_password_reset(self):
    response = self.client.post('/api/password-reset/', {'email': 'test@example.com'})
    self.assertEqual(response.status_code, 200)

def test_password_reset_confirm_invalid(self):
    response = self.client.post('/api/password-reset/confirm/', {
        'uid': 'invalid', 'token': 'invalid', 'password': 'newpass'
    })
    self.assertEqual(response.status_code, 400)
