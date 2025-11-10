from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import OrderSerializer, OrderResponseSerializer
from .models import Order
import time

def generate_order_id():
    return "ORD" + str(int(time.time()))[-8:]

class OrderCreateView(APIView):
    permission_classes = []  # cho phép khách đặt hàng
    def post(self, request):
        data = request.data.copy()
        data['order_id'] = generate_order_id()
        serializer = OrderSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save(user=request.user if request.user.is_authenticated else None)
        return Response({'success': True,'order': OrderResponseSerializer(order).data}, status=201)

class OrderListView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        qs = Order.objects.filter(user=request.user).order_by('-created_at')
        data = [OrderResponseSerializer(o).data for o in qs]
        return Response({'results': data})

class OrderDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, order_id):
        try:
            order = Order.objects.get(order_id=order_id, user=request.user)
        except Order.DoesNotExist:
            return Response({'detail':'Không tìm thấy'}, status=404)
        return Response({'order': OrderResponseSerializer(order).data})

class OrderStatusUpdateView(APIView):
    permission_classes = [permissions.IsAdminUser]
    def patch(self, request, order_id):
        status_value = request.data.get('status')
        if status_value not in ['pending','paid','shipping','completed','canceled']:
            return Response({'detail':'Trạng thái không hợp lệ'}, status=400)
        try:
            order = Order.objects.get(order_id=order_id)
        except Order.DoesNotExist:
            return Response({'detail':'Không tìm thấy'}, status=404)
        order.status = status_value
        order.save()
        return Response({'success': True, 'order': OrderResponseSerializer(order).data})