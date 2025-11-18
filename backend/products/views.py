from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from .serializers import (
    ProductCreateSerializer,
    CategorySerializer,
    ProductSerializer,
    WishlistItemSerializer,
    SavedItemSerializer,
)
from .models import Product, Category, WishlistItem, SavedItem
from rest_framework import viewsets, mixins
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework import parsers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from clip_service import embed_pil
from django.core.files.uploadedfile import InMemoryUploadedFile
from PIL import Image
import numpy as np
from django.db.models import Count, Q


class BuyerOnlyPermission(permissions.BasePermission):
    message = 'Chức năng này chỉ dành cho người mua.'

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and getattr(request.user, 'user_type', None) == 'buyer'
        )

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


class ProductViewSet(mixins.ListModelMixin,
                    mixins.RetrieveModelMixin,
                    mixins.CreateModelMixin,
                    mixins.UpdateModelMixin,
                    mixins.DestroyModelMixin,
                    viewsets.GenericViewSet):
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

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return (
            Category.objects.filter(is_active=True)
            .annotate(product_count=Count("products", filter=Q(products__is_active=True)))
            .order_by("name")
        )

class ImageSearchView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request):
        k = int(request.GET.get("k", 12))
        file = request.FILES.get("file")
        if not file:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            img = Image.open(file).convert("RGB")
        except Exception as e:
            return Response({"error": f"Cannot open image: {e}"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            q = embed_pil(img).numpy()  # (D,)
        finally:
            try: img.close()
            except Exception: pass

        prods_qs = Product.objects.exclude(image_embedding__isnull=True).exclude(image_embedding__exact=[])
        prods = list(prods_qs)
        if not prods:
            return Response({"results": []})

        import numpy as np
        embs = np.array([p.image_embedding for p in prods], dtype=np.float32)
        q = q / (np.linalg.norm(q) + 1e-12)
        sims = embs @ q  # cosine vì đã normalize

        top_idx = np.argsort(-sims)[:k]
        results = []
        for idx in top_idx:
            p = prods[int(idx)]
            results.append({
                "id": p.id,
                "name": p.name,
                "price": str(p.price),
                "image": (p.image.url if p.image else (p.image_url or None)),
                "similarity": float(sims[int(idx)]),
            })
        return Response({"results": results})


class WishlistViewSet(mixins.ListModelMixin,
                      mixins.CreateModelMixin,
                      mixins.DestroyModelMixin,
                      viewsets.GenericViewSet):
    serializer_class = WishlistItemSerializer
    permission_classes = [permissions.IsAuthenticated, BuyerOnlyPermission]

    def get_queryset(self):
        return (
            WishlistItem.objects.filter(user=self.request.user)
            .select_related('product', 'product__category', 'product__seller')
            .order_by('-created_at')
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated = serializer.validated_data
        product = validated.get('product')
        if product is None:
            return Response({'detail': 'product_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        color = (validated.get('color') or '').strip()
        size = (validated.get('size') or '').strip()
        note = validated.get('note', '')

        instance, created = WishlistItem.objects.get_or_create(
            user=request.user,
            product=product,
            color=color,
            size=size,
            defaults={'note': note},
        )
        if not created and note:
            instance.note = note
            instance.save(update_fields=['note', 'updated_at'])

        output = self.get_serializer(instance)
        return Response(output.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.user != request.user:
            raise PermissionDenied('Not allowed to modify this wishlist item.')
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class SavedItemViewSet(mixins.ListModelMixin,
                       mixins.CreateModelMixin,
                       mixins.UpdateModelMixin,
                       mixins.DestroyModelMixin,
                       viewsets.GenericViewSet):
    serializer_class = SavedItemSerializer
    permission_classes = [permissions.IsAuthenticated, BuyerOnlyPermission]

    def get_queryset(self):
        return (
            SavedItem.objects.filter(user=self.request.user)
            .select_related('product', 'product__category', 'product__seller')
            .order_by('-moved_from_cart_at')
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated = serializer.validated_data
        product = validated.get('product')
        if product is None:
            return Response({'detail': 'product_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        color = (validated.get('color') or '').strip()
        size = (validated.get('size') or '').strip()
        quantity = validated.get('quantity') or 1

        instance, created = SavedItem.objects.get_or_create(
            user=request.user,
            product=product,
            color=color,
            size=size,
            defaults={'quantity': quantity},
        )
        if not created:
            instance.quantity = max(1, instance.quantity + quantity)
            instance.save(update_fields=['quantity', 'updated_at'])

        output = self.get_serializer(instance)
        return Response(output.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.user != request.user:
            raise PermissionDenied('Not allowed to modify this saved item.')

        quantity = request.data.get('quantity')
        if quantity is None:
            return Response({'detail': 'quantity is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            quantity = int(quantity)
        except (TypeError, ValueError):
            return Response({'detail': 'quantity must be an integer'}, status=status.HTTP_400_BAD_REQUEST)
        instance.quantity = max(1, quantity)
        instance.save(update_fields=['quantity', 'updated_at'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.user != request.user:
            raise PermissionDenied('Not allowed to modify this saved item.')
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
