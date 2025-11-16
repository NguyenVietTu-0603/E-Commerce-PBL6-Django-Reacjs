from django.urls import path
from .views import (
    ProductViewSet,
    CategoryViewSet,
    ImageSearchView,
    WishlistViewSet,
    SavedItemViewSet,
)

urlpatterns = [
    # Product URLs
    path('products/', ProductViewSet.as_view({'get': 'list', 'post': 'create'}), name='product-list'),
    path('products/<int:pk>/', ProductViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='product-detail'),

    # Image search URL
    path('search/image/', ImageSearchView.as_view(), name='image-search'),

    # Category URLs
    path('categories/', CategoryViewSet.as_view({'get': 'list', 'post': 'create'}), name='category-list'),
    path('categories/<int:pk>/', CategoryViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='category-detail'),

    # Wishlist & Saved items
    path('products/wishlist/', WishlistViewSet.as_view({'get': 'list', 'post': 'create'}), name='wishlist-list'),
    path('products/wishlist/<int:pk>/', WishlistViewSet.as_view({'delete': 'destroy'}), name='wishlist-detail'),
    path('products/saved-items/', SavedItemViewSet.as_view({'get': 'list', 'post': 'create'}), name='saveditem-list'),
    path('products/saved-items/<int:pk>/', SavedItemViewSet.as_view({'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='saveditem-detail'),
]