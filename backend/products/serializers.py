from rest_framework import serializers
from .models import Product, Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug", "parent", "is_active", "created_at"]
        read_only_fields = ["slug", "created_at"]


class ProductSerializer(serializers.ModelSerializer):
    """Serializer cho GET - đọc dữ liệu"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    seller_name = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            "id",
            "seller",
            "seller_name",
            "name",
            "description",
            "price",
            "stock",
            "image",
            "category",
            "category_name",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["seller", "created_at", "updated_at"]

    def get_image(self, obj):
        """Lấy URL đầy đủ của ảnh"""
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
        """Lấy tên seller từ bảng users_user"""
        if obj.seller:
            return getattr(obj.seller, "full_name", None) or obj.seller.username
        return None


class ProductCreateSerializer(serializers.ModelSerializer):
    """Serializer cho POST/PUT/PATCH - tạo/cập nhật"""
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), 
        allow_null=True, 
        required=False
    )

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "description",
            "price",
            "stock",
            "image",
            "category",
            "is_active",
        ]

    def validate_price(self, value):
        """Validate giá phải > 0"""
        if value <= 0:
            raise serializers.ValidationError("Giá phải lớn hơn 0")
        return value

    def validate_stock(self, value):
        """Validate số lượng >= 0"""
        if value < 0:
            raise serializers.ValidationError("Số lượng không được âm")
        return value

    def create(self, validated_data):
        """Auto gán seller khi tạo mới"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['seller'] = request.user
        return super().create(validated_data)