from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from products.models import Product
from .models import Order, OrderItem


def create_user(**kwargs):
    defaults = {
        "username": "user",
        "email": "user@example.com",
        "password": "pass12345",
    }
    defaults.update(kwargs)
    User = get_user_model()
    return User.objects.create_user(**defaults)


class OrderModelTests(TestCase):
    def setUp(self):
        self.buyer = create_user(username="buyer", email="buyer@example.com", user_type="buyer")

    def test_order_id_auto_generated(self):
        """ORD-MOD-001: Order lưu không order_id sẽ tự sinh mã"""
        order = Order.objects.create(
            user=self.buyer,
            order_id="",
            full_name="Buyer Test",
            phone="0123456789",
            email="buyer@example.com",
            address="123 Street",
            ward="Ward",
            district="District",
            city="City",
            payment_method="cod",
            notes="",
            total_amount=Decimal("100.00"),
        )
        self.assertTrue(order.order_id)
        self.assertTrue(order.order_id.startswith("ORD"))


class OrderCreateAPITests(APITestCase):
    def setUp(self):
        self.seller = create_user(
            username="seller",
            email="seller@example.com",
            user_type="seller",
        )
        self.product = Product.objects.create(
            seller=self.seller,
            name="Canvas Tote",
            price=Decimal("199.00"),
            stock=15,
        )

    def test_guest_can_create_order(self):
        """ORD-API-001: Khách có thể tạo đơn hàng với danh sách sản phẩm"""
        payload = {
            "full_name": "Guest",
            "phone": "0909000000",
            "email": "guest@example.com",
            "address": "123 Guest St",
            "ward": "Ward 1",
            "district": "District 1",
            "city": "City",
            "payment_method": "cod",
            "notes": "",
            "total_amount": "199.00",
            "items": [
                {"product_id": self.product.id, "quantity": 1, "price": "199.00"}
            ],
        }
        response = self.client.post(reverse("order-create"), payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data.get("success"))
        order = Order.objects.get(order_id=response.data["order"]["order_id"])
        self.assertEqual(order.items.count(), 1)
        self.assertIsNone(order.user)

    def test_create_fails_with_invalid_product(self):
        """ORD-API-002: Tạo đơn với product không tồn tại trả về lỗi 400"""
        payload = {
            "full_name": "Guest",
            "phone": "0909000000",
            "email": "guest@example.com",
            "address": "123 Guest St",
            "ward": "Ward 1",
            "district": "District 1",
            "city": "City",
            "payment_method": "cod",
            "notes": "",
            "total_amount": "199.00",
            "items": [
                {"product_id": 9999, "quantity": 1, "price": "199.00"}
            ],
        }
        response = self.client.post(reverse("order-create"), payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("items", response.data)


class OrderCustomerViewsTests(APITestCase):
    def setUp(self):
        self.buyer = create_user(
            username="buyermain",
            email="buyer@example.com",
            user_type="buyer",
        )
        self.other_buyer = create_user(
            username="buyerother",
            email="other@example.com",
            user_type="buyer",
        )
        self.seller = create_user(
            username="sellercustomer",
            email="seller-customer@example.com",
            user_type="seller",
        )
        self.product = Product.objects.create(
            seller=self.seller,
            name="Wool Jacket",
            price=Decimal("250.00"),
            stock=4,
        )
        self.order = Order.objects.create(
            user=self.buyer,
            order_id="ORD-CUST-1",
            full_name="Buyer Name",
            phone="0123456789",
            email="buyer@example.com",
            address="1 Street",
            ward="Ward",
            district="District",
            city="City",
            payment_method="cod",
            notes="",
            total_amount=Decimal("250.00"),
        )
        OrderItem.objects.create(
            order=self.order,
            product=self.product,
            quantity=1,
            price=Decimal("250.00"),
        )

    def test_list_requires_authentication(self):
        """ORD-CUST-001: Danh sách đơn hàng yêu cầu đăng nhập"""
        response = self.client.get(reverse("order-list"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_user_receives_their_orders(self):
        """ORD-CUST-002: Người dùng nhận đúng đơn hàng của mình"""
        self.client.force_authenticate(user=self.buyer)
        response = self.client.get(reverse("order-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["order_id"], "ORD-CUST-1")

    def test_cannot_view_other_users_order_detail(self):
        """ORD-CUST-003: Người dùng khác truy cập order trả về 404"""
        self.client.force_authenticate(user=self.other_buyer)
        response = self.client.get(reverse("order-detail", args=["ORD-CUST-1"]))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_owner_can_view_order_detail(self):
        """ORD-CUST-004: Chủ đơn hàng xem chi tiết thành công"""
        self.client.force_authenticate(user=self.buyer)
        response = self.client.get(reverse("order-detail", args=["ORD-CUST-1"]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["order"]["order_id"], "ORD-CUST-1")


class OrderStatusAdminTests(APITestCase):
    def setUp(self):
        self.admin = create_user(
            username="admin",
            email="admin@example.com",
            user_type="admin",
        )
        self.admin.is_staff = True
        self.admin.is_superuser = True
        self.admin.save()
        self.buyer = create_user(username="buyer-status", email="buyer-status@example.com", user_type="buyer")
        self.order = Order.objects.create(
            user=self.buyer,
            order_id="ORD-STATUS-1",
            full_name="Buyer Status",
            phone="0123456789",
            email="buyer-status@example.com",
            address="1 Street",
            ward="Ward",
            district="District",
            city="City",
            payment_method="cod",
            notes="",
            total_amount=Decimal("100.00"),
        )

    def test_non_admin_cannot_update_status(self):
        """ORD-ADMIN-001: Người không phải admin bị chặn cập nhật trạng thái"""
        self.client.force_authenticate(user=self.buyer)
        response = self.client.patch(
            reverse("order-status", args=["ORD-STATUS-1"]),
            {"status": "shipping"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_update_status(self):
        """ORD-ADMIN-002: Admin cập nhật trạng thái đơn hàng thành công"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.patch(
            reverse("order-status", args=["ORD-STATUS-1"]),
            {"status": "completed"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, "completed")

    def test_admin_rejects_invalid_status_value(self):
        """ORD-ADMIN-003: Admin cung cấp trạng thái không hợp lệ nhận lỗi 400"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.patch(
            reverse("order-status", args=["ORD-STATUS-1"]),
            {"status": "invalid"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("detail", response.data)


class SellerOrderViewsTests(APITestCase):
    def setUp(self):
        self.seller = create_user(
            username="seller-main",
            email="seller-main@example.com",
            user_type="seller",
        )
        self.other_seller = create_user(
            username="seller-other",
            email="seller-other@example.com",
            user_type="seller",
        )
        self.stranger_seller = create_user(
            username="seller-stranger",
            email="seller-stranger@example.com",
            user_type="seller",
        )
        self.buyer = create_user(
            username="buyer-seller",
            email="buyer-seller@example.com",
            user_type="buyer",
        )

        self.product_owned = Product.objects.create(
            seller=self.seller,
            name="Seller Hat",
            price=Decimal("50.00"),
            stock=10,
        )
        self.product_other = Product.objects.create(
            seller=self.other_seller,
            name="Other Seller Gloves",
            price=Decimal("70.00"),
            stock=10,
        )

        self.order = Order.objects.create(
            user=self.buyer,
            order_id="ORD-SELLER-1",
            full_name="Buyer Seller",
            phone="0123456789",
            email="buyer-seller@example.com",
            address="1 Seller St",
            ward="Ward",
            district="District",
            city="City",
            payment_method="cod",
            notes="",
            total_amount=Decimal("120.00"),
        )
        OrderItem.objects.create(
            order=self.order,
            product=self.product_owned,
            quantity=1,
            price=Decimal("50.00"),
        )
        OrderItem.objects.create(
            order=self.order,
            product=self.product_other,
            quantity=1,
            price=Decimal("70.00"),
        )

    def test_seller_orders_returns_only_owned_items(self):
        """ORD-SELLER-001: Seller chỉ thấy các item thuộc sản phẩm của mình"""
        self.client.force_authenticate(user=self.seller)
        response = self.client.get(reverse("seller-orders"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["items_count"], 1)
        self.assertEqual(response.data["results"][0]["items"][0]["product_id"], self.product_owned.id)

    def test_seller_can_update_status_when_part_of_order(self):
        """ORD-SELLER-002: Seller sở hữu sản phẩm có thể cập nhật trạng thái"""
        self.client.force_authenticate(user=self.seller)
        response = self.client.patch(
            reverse("seller-update-order-status", args=["ORD-SELLER-1"]),
            {"status": "shipping"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, "shipping")

    def test_seller_without_items_cannot_update_status(self):
        """ORD-SELLER-003: Seller không có sản phẩm trong đơn sẽ bị từ chối"""
        self.client.force_authenticate(user=self.stranger_seller)
        response = self.client.patch(
            reverse("seller-update-order-status", args=["ORD-SELLER-1"]),
            {"status": "shipping"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, "pending")
