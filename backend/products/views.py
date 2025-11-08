from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from .serializers import ProductCreateSerializer, CategorySerializer, ProductSerializer
from .models import Product, Category
from rest_framework import viewsets, permissions, parsers

class ProductCreateView(generics.CreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        if getattr(user, 'user_type', None) not in ('seller', 'admin'):
            raise PermissionDenied('Only sellers or admins can create products.')
        serializer.save()

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        return Response(
            {
                'message': 'Product created successfully',
                'product': response.data
            },
            status=status.HTTP_201_CREATED
        )


class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.filter(is_active=True).order_by('name')
    serializer_class = CategorySerializer

    def get_permissions(self):
        # GET: public (hoặc IsAuthenticated nếu muốn)
        # POST: chỉ admin được tạo category
        if self.request.method == 'POST':
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)


class ProductViewSet(viewsets.ModelViewSet):
    """
    Cho phép GET/POST/PUT/PATCH/DELETE qua API.
    - Dùng ProductCreateSerializer cho create/update (để nhận image upload).
    - Dùng ProductSerializer cho read.
    """
    queryset = Product.objects.all().order_by('-created_at')
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProductCreateSerializer
        return ProductSerializer

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]