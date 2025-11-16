from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from django.db import IntegrityError
from django.db.models import Avg, Count

from .models import Category, Product, WishlistItem, SavedItem
from reviews.models import Review

class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = ("id", "name", "slug", "product_count")

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    image = serializers.SerializerMethodField()
    seller_name = serializers.SerializerMethodField()
    rating_avg = serializers.SerializerMethodField()
    rating_count = serializers.SerializerMethodField()
    variants = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "description",
            "price",
            "image",
            "category",
            "seller_id",
            "seller_name",
            "stock",
             "color_options",
             "size_options",
             "variants",
            "created_at",
            "rating_avg",
            "rating_count",
        ]

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
        """Lấy full_name từ bảng users_user"""
        if obj.seller_id:
            return getattr(obj.seller, "full_name", None) or obj.seller.username
        return None

    def get_rating_avg(self, obj):
        agg = Review.objects.filter(product=obj).aggregate(a=Avg('rating'))
        return round(agg['a'] or 0, 2)

    def get_rating_count(self, obj):
        agg = Review.objects.filter(product=obj).aggregate(c=Count('id'))
        return agg['c'] or 0

    def get_variants(self, obj):
        return {
            "colors": obj.color_options or [],
            "sizes": obj.size_options or [],
        }

class ProductCreateSerializer(serializers.ModelSerializer):
    # dùng khi cần create/update; category nhận id
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), allow_null=True, required=False)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "description",
            "price",
            "stock",
            "color_options",
            "size_options",
            "image",
            "category",
        ]

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['seller'] = request.user
        return super().create(validated_data)
        
class WishlistItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_active=True),
        source='product',
        write_only=True
    )

    class Meta:
        model = WishlistItem
        fields = [
            'id', 'product', 'product_id', 'color', 'size', 'note',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['user'] = request.user
        try:
            return super().create(validated_data)
        except IntegrityError:
            raise ValidationError('Sản phẩm đã có trong danh sách yêu thích.')

    def update(self, instance, validated_data):
        # Limit updates to note/color/size (product immutable)
        validated_data.pop('product', None)
        return super().update(instance, validated_data)


class SavedItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_active=True),
        source='product',
        write_only=True
    )

    class Meta:
        model = SavedItem
        fields = [
            'id', 'product', 'product_id', 'quantity', 'color', 'size',
            'moved_from_cart_at', 'updated_at'
        ]
        read_only_fields = ['moved_from_cart_at', 'updated_at']

    def validate_quantity(self, value):
        if value <= 0:
            raise ValidationError('Số lượng phải lớn hơn 0.')
        return value

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['user'] = request.user
        try:
            return super().create(validated_data)
        except IntegrityError:
            # Nếu đã tồn tại, cập nhật số lượng
            instance = SavedItem.objects.get(
                user=request.user,
                product=validated_data['product'],
                color=validated_data.get('color', ''),
                size=validated_data.get('size', '')
            )
            instance.quantity = validated_data.get('quantity', instance.quantity)
            instance.save(update_fields=['quantity', 'updated_at'])
            return instance

    def update(self, instance, validated_data):
        validated_data.pop('product', None)
        return super().update(instance, validated_data)


class WishlistItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        source='product', queryset=Product.objects.filter(is_active=True), write_only=True, required=False
    )

    class Meta:
        model = WishlistItem
        fields = [
            'id', 'product', 'product_id', 'color', 'size', 'note', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'product', 'created_at', 'updated_at']

    def update(self, instance, validated_data):
        validated_data.pop('product', None)
        return super().update(instance, validated_data)


class SavedItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        source='product', queryset=Product.objects.filter(is_active=True), write_only=True, required=False
    )
    quantity = serializers.IntegerField(min_value=1, default=1)

    class Meta:
        model = SavedItem
        fields = [
            'id', 'product', 'product_id', 'quantity', 'color', 'size', 'moved_from_cart_at', 'updated_at'
        ]
        read_only_fields = ['id', 'product', 'moved_from_cart_at', 'updated_at']

    def update(self, instance, validated_data):
        validated_data.pop('product', None)
        return super().update(instance, validated_data)