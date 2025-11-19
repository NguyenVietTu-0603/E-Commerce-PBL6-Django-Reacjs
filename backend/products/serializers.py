from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from django.db import IntegrityError
from django.db.models import Avg, Count

from .models import Product, Category, WishlistItem, SavedItem
from reviews.models import Review


# ============================================
# CATEGORY
# ============================================

class CategorySerializer(serializers.ModelSerializer):
    """Category serializer, bao gồm optional product_count"""
    product_count = serializers.IntegerField(read_only=True, required=False)

    class Meta:
        model = Category
        fields = [
            "id", "name", "slug", "parent", "is_active", "created_at", "product_count"
        ]
        read_only_fields = ["slug", "created_at"]


# ============================================
# PRODUCT
# ============================================

class ProductSerializer(serializers.ModelSerializer):
    """Serializer dùng cho GET/read"""
    category = CategorySerializer(read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    image = serializers.SerializerMethodField()
    seller_name = serializers.SerializerMethodField()
    rating_avg = serializers.SerializerMethodField()
    rating_count = serializers.SerializerMethodField()
    variants = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id", "name", "description", "price", "stock", "image",
            "category", "category_name", "seller", "seller_name",
            "is_active", "color_options", "size_options", "variants",
            "created_at", "updated_at", "rating_avg", "rating_count"
        ]
        read_only_fields = ["seller", "created_at", "updated_at"]

    def get_image(self, obj):
        request = self.context.get("request")
        if obj.image:
            try:
                url = obj.image.url
            except Exception:
                url = str(obj.image)
            if request is not None:
                return request.build_absolute_uri(url)
            return url
        return None

    def get_seller_name(self, obj):
        if obj.seller:
            return getattr(obj.seller, "full_name", None) or obj.seller.username
        return None

    def get_rating_avg(self, obj):
        agg = Review.objects.filter(product=obj).aggregate(avg=Avg('rating'))
        return round(agg['avg'] or 0, 2)

    def get_rating_count(self, obj):
        agg = Review.objects.filter(product=obj).aggregate(cnt=Count('id'))
        return agg['cnt'] or 0

    def get_variants(self, obj):
        return {
            "colors": obj.color_options or [],
            "sizes": obj.size_options or [],
        }


class ProductCreateSerializer(serializers.ModelSerializer):
    """Serializer dùng cho create/update (POST/PUT/PATCH)"""
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), allow_null=True, required=False
    )

    class Meta:
        model = Product
        fields = [
            "id", "name", "description", "price", "stock",
            "color_options", "size_options", "image", "category", "is_active"
        ]

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Giá phải lớn hơn 0")
        return value

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("Số lượng không được âm")
        return value

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['seller'] = request.user
        return super().create(validated_data)


# ============================================
# WISHLIST ITEM
# ============================================

class WishlistItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        source='product', queryset=Product.objects.filter(is_active=True), write_only=True
    )

    class Meta:
        model = WishlistItem
        fields = ['id', 'product', 'product_id', 'color', 'size', 'note', 'created_at', 'updated_at']
        read_only_fields = ['id', 'product', 'created_at', 'updated_at']

    def update(self, instance, validated_data):
        validated_data.pop('product', None)
        return super().update(instance, validated_data)


# ============================================
# SAVED ITEM
# ============================================

class SavedItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        source='product', queryset=Product.objects.filter(is_active=True), write_only=True
    )
    quantity = serializers.IntegerField(min_value=1, default=1)

    class Meta:
        model = SavedItem
        fields = ['id', 'product', 'product_id', 'quantity', 'color', 'size', 'moved_from_cart_at', 'updated_at']
        read_only_fields = ['id', 'product', 'moved_from_cart_at', 'updated_at']

    def update(self, instance, validated_data):
        validated_data.pop('product', None)
        return super().update(instance, validated_data)
