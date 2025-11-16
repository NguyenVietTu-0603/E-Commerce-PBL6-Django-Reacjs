from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    # Authentication
    RegisterView,
    LoginView,
    LogoutView,
    
    # User Management
    UserDetailView,
    ChangePasswordView,
    DeleteAccountView,
    
    # Admin
    UserListView,
    UserManageView,
    UserStatusUpdateView,
    UserStatisticsView,
    
    # Profile
    ProfileView,
    current_user,
    
    # Shop views (THÊM)
    get_all_shops,
    seller_shop_profile,
    shop_statistics,
)

urlpatterns = [
    # ==================== AUTHENTICATION ====================
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # ==================== USER MANAGEMENT ====================
    path('me/', UserDetailView.as_view(), name='user-detail'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('me/delete/', DeleteAccountView.as_view(), name='delete-account'),
    
    # ==================== PROFILE ====================
    path('profile/', ProfileView.as_view(), name='profile'),
    
    # ==================== ADMIN ====================
    path('', UserListView.as_view(), name='user-list'),  # Admin only
    path('<int:user_id>/', UserManageView.as_view(), name='user-manage'),  # Admin only
    path('<int:user_id>/status/', UserStatusUpdateView.as_view(), name='user-status'),  # Admin only
    path('statistics/', UserStatisticsView.as_view(), name='user-statistics'),  # Admin only
    
    # ==================== SHOP ENDPOINTS (THÊM CUỐI) ====================
    path('shops/', get_all_shops, name='all-shops'),  # Danh sách tất cả shop
    path('shop/<int:seller_id>/', seller_shop_profile, name='seller-shop'),  # Shop detail + products
    path('shop/<int:seller_id>/stats/', shop_statistics, name='shop-stats'),  # Shop statistics
]