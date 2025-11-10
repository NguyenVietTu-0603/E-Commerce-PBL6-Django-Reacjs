from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from products.models import Product

class OrderAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        User = get_user_model()
        self.seller = User.objects.create_user(
            username='seller1',
            email='seller@example.com',
            password='pass12345'
        )
        # Thêm các field bắt buộc khác nếu có (ví dụ category, slug...)
        self.product = Product.objects.create(
            name='Test',
            price=100000,
            seller=self.seller,
            # category=..., slug='test', stock=10, ...
        )

    def test_create_order(self):
        data = {
            "full_name": "A",
            "phone": "0123",
            "email": "a@test.com",
            "address": "123",
            "ward": "W",
            "district": "D",
            "city": "C",
            "payment_method": "cod",
            "notes": "",
            "items": [
                {"product_id": self.product.id, "quantity": 1, "price": "100000"}
            ],
            "total_amount": "100000"
        }
        resp = self.client.post(reverse('order-create'), data, format='json')
        self.assertEqual(resp.status_code, 201)
        self.assertTrue(resp.data['success'])
