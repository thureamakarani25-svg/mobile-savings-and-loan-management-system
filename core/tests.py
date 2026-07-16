from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse
from . import views


class AuthFlowTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username='admin',
            password='secret123',
            is_staff=True,
            is_superuser=True,
        )
        self.member = User.objects.create_user(
            username='member',
            password='secret123',
        )

    def test_admin_login_redirects_to_admin_dashboard(self):
        response = self.client.post(reverse('login'), {
            'username': 'admin',
            'password': 'secret123',
        })

        self.assertRedirects(response, reverse('admin_dashboard'))

    def test_member_login_redirects_to_member_dashboard(self):
        response = self.client.post(reverse('login'), {
            'username': 'member',
            'password': 'secret123',
        })

        self.assertRedirects(response, reverse('member_dashboard'))
