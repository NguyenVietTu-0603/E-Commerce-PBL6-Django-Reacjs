from django.urls import path
from .views import OrderCreateView, OrderListView, OrderDetailView, OrderStatusUpdateView

urlpatterns = [
    path('', OrderCreateView.as_view(), name='order-create'),
    path('mine/', OrderListView.as_view(), name='order-list'),
    path('<str:order_id>/', OrderDetailView.as_view(), name='order-detail'),
    path('<str:order_id>/status/', OrderStatusUpdateView.as_view(), name='order-status'),
]