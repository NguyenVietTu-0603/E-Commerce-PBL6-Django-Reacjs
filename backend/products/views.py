from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from .serializers import ProductCreateSerializer, CategorySerializer, ProductSerializer
from .models import Product, Category
from rest_framework import viewsets, mixins
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework import parsers
from django.db.models import Q
from rest_framework import filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny

# ============================================
# VIEWSETS
# ============================================

class ProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet cho Product CRUD
    - GET: Public (không cần auth)
    - POST/PUT/PATCH/DELETE: Cần authentication
    """
    queryset = Product.objects.select_related('seller', 'category').all()
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'price', 'name']
    ordering = ['-created_at']

    def get_permissions(self):
        """Phân quyền theo action"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]
        return [AllowAny()]

    def get_serializer_class(self):
        """Chọn serializer phù hợp"""
        if self.action in ['create', 'update', 'partial_update']:
            return ProductCreateSerializer
        return ProductSerializer

    def get_queryset(self):
        """Filter products"""
        queryset = Product.objects.select_related('seller', 'category').all()
        
        # Filter by category
        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        # Filter by active status
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        # Filter by seller
        seller_id = self.request.query_params.get('seller')
        if seller_id:
            queryset = queryset.filter(seller_id=seller_id)
        
        # Filter by stock
        stock_status = self.request.query_params.get('stock_status')
        if stock_status == 'in_stock':
            queryset = queryset.filter(stock__gt=0)
        elif stock_status == 'out_of_stock':
            queryset = queryset.filter(stock=0)
        
        # Search
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(description__icontains=search)
            )
        
        return queryset

    def perform_create(self, serializer):
        """Tự động gán seller khi tạo product"""
        serializer.save(seller=self.request.user)

    def perform_update(self, serializer):
        """Chỉ seller mới update được product của mình"""
        product = self.get_object()
        if product.seller != self.request.user:
            raise PermissionDenied("Bạn chỉ có thể chỉnh sửa sản phẩm của mình")
        serializer.save()

    def perform_destroy(self, instance):
        """Chỉ seller mới xóa được product của mình"""
        if instance.seller != self.request.user:
            raise PermissionDenied("Bạn chỉ có thể xóa sản phẩm của mình")
        instance.delete()

    def create(self, request, *args, **kwargs):
        """Custom response khi tạo product"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Trả về dữ liệu đầy đủ với ProductSerializer
        product = serializer.instance
        output_serializer = ProductSerializer(product, context={'request': request})
        
        return Response(
            {
                'message': 'Tạo sản phẩm thành công!',
                'product': output_serializer.data
            },
            status=status.HTTP_201_CREATED
        )


class CategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet cho Category CRUD
    """
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        """Filter categories"""
        queryset = Category.objects.all()
        
        # Filter by active status
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset


# ============================================
# SELLER-SPECIFIC ENDPOINTS
# ============================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def seller_products(request):
    """
    Lấy tất cả sản phẩm của seller đang đăng nhập
    GET /api/seller/products/
    """
    try:
        # Lấy products của seller
        products = Product.objects.filter(
            seller=request.user
        ).select_related('category').order_by('-created_at')
        
        # Serialize
        serializer = ProductSerializer(
            products, 
            many=True, 
            context={'request': request}
        )
        
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def seller_stats(request):
    """
    Lấy thống kê sản phẩm của seller
    GET /api/seller/stats/
    """
    try:
        seller = request.user
        
        # Thống kê products
        products = Product.objects.filter(seller=seller)
        total_products = products.count()
        active_products = products.filter(is_active=True).count()
        inactive_products = products.filter(is_active=False).count()
        out_of_stock = products.filter(stock=0).count()
        
        stats = {
            'total': total_products,
            'active': active_products,
            'inactive': inactive_products,
            'outOfStock': out_of_stock,
        }
        
        return Response(stats, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def toggle_product_status(request, pk):
    """
    Bật/tắt trạng thái active của product
    PATCH /api/products/<pk>/toggle/
    Body: {"is_active": true/false} (optional)
    """
    try:
        product = Product.objects.get(pk=pk)
        
        # Check ownership
        if product.seller != request.user:
            return Response(
                {'error': 'Bạn không có quyền chỉnh sửa sản phẩm này'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Lấy status mới hoặc toggle
        new_status = request.data.get('is_active')
        if new_status is not None:
            product.is_active = new_status
        else:
            product.is_active = not product.is_active
        
        product.save()
        
        serializer = ProductSerializer(product, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Product.DoesNotExist:
        return Response(
            {'error': 'Không tìm thấy sản phẩm'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def seller_product_detail(request, pk):
    """
    Get, Update, Delete product của seller
    
    GET /api/seller/products/<pk>/
    PUT /api/seller/products/<pk>/
    PATCH /api/seller/products/<pk>/
    DELETE /api/seller/products/<pk>/
    """
    try:
        product = Product.objects.select_related('category').get(pk=pk)
        
        # Check ownership
        if product.seller != request.user:
            return Response(
                {'error': 'Bạn không có quyền truy cập sản phẩm này'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if request.method == 'GET':
            # Get product detail
            serializer = ProductSerializer(product, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        elif request.method in ['PUT', 'PATCH']:
            # Update product
            print(f"=== UPDATING PRODUCT {pk} ===")
            print(f"Data: {request.data}")
            print(f"Files: {request.FILES}")
            
            partial = request.method == 'PATCH'
            serializer = ProductCreateSerializer(
                product,
                data=request.data,
                partial=partial,
                context={'request': request}
            )
            
            if serializer.is_valid():
                serializer.save()
                
                # Return full product data
                output_serializer = ProductSerializer(
                    serializer.instance,
                    context={'request': request}
                )
                
                return Response({
                    'success': True,
                    'message': 'Cập nhật sản phẩm thành công',
                    'product': output_serializer.data
                }, status=status.HTTP_200_OK)
            
            print(f"❌ Validation errors: {serializer.errors}")
            return Response(
                {'errors': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        elif request.method == 'DELETE':
            # Delete product
            product_name = product.name
            product.delete()
            return Response({
                'success': True,
                'message': f'Đã xóa sản phẩm "{product_name}"'
            }, status=status.HTTP_200_OK)
        
    except Product.DoesNotExist:
        return Response(
            {'error': 'Không tìm thấy sản phẩm'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        print(f"❌ Error in seller_product_detail: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )