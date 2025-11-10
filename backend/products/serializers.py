from rest_framework import serializers
from .models import Product, Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug"]

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    image = serializers.SerializerMethodField()
    seller_name = serializers.SerializerMethodField()  # 👈 thêm trường mới

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
            "seller_name",  # 👈 hiển thị tên shop
            "stock",
            "created_at",
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

class ProductCreateSerializer(serializers.ModelSerializer):
    # dùng khi cần create/update; category nhận id
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), allow_null=True, required=False)

    class Meta:
        model = Product
        fields = ["id", "name", "description", "price", "image", "category"]

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['seller'] = request.user
        return super().create(validated_data)