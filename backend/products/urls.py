from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductViewSet, 
    CategoryViewSet,
    seller_products,
    seller_stats,
    seller_product_detail,
    toggle_product_status,
)

# Router cho ViewSets
router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'categories', CategoryViewSet, basename='category')

urlpatterns = [
    # ViewSet routes (tự động tạo các endpoints CRUD)
    # GET    /api/products/          - List all products
    # POST   /api/products/          - Create product
    # GET    /api/products/<pk>/     - Get product detail
    # PUT    /api/products/<pk>/     - Update product (full)
    # PATCH  /api/products/<pk>/     - Update product (partial)
    # DELETE /api/products/<pk>/     - Delete product
    path('', include(router.urls)),
    
    # Seller-specific endpoints
    path('seller/products/', seller_products, name='seller-products'),
    path('seller/stats/', seller_stats, name='seller-stats'),
    path('seller/products/<int:pk>/', seller_product_detail, name='seller-product-detail'),
    
    # Product management
    path('products/<int:pk>/toggle/', toggle_product_status, name='toggle-product-status'),
]