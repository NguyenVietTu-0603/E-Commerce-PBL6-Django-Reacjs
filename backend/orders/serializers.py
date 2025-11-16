from rest_framework import serializers
from .models import Order, OrderItem
from products.models import Product

class OrderItemCreateSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField()
    color = serializers.CharField(required=False, allow_blank=True)
    size = serializers.CharField(required=False, allow_blank=True)
    price = serializers.DecimalField(max_digits=12, decimal_places=2)

    def validate_product_id(self, v):
        if not Product.objects.filter(id=v).exists():
            raise serializers.ValidationError("Sản phẩm không tồn tại")
        return v


class OrderItemResponseSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField(source='product.id', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.SerializerMethodField()
    seller_id = serializers.IntegerField(source='product.seller.id', read_only=True)
    seller_name = serializers.SerializerMethodField()
    total = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = [
            'id',
            'product_id',
            'product_name',
            'product_image',
            'seller_id',
            'seller_name',
            'quantity',
            'color',
            'size',
            'price',
            'total',
        ]

    def get_product_image(self, obj):
        request = self.context.get('request')
        if obj.product.image:
            if request:
                return request.build_absolute_uri(obj.product.image.url)
            return obj.product.image.url
        return None

    def get_seller_name(self, obj):
        seller = obj.product.seller
        return getattr(seller, 'full_name', None) or seller.username

    def get_total(self, obj):
        return obj.price * obj.quantity


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemCreateSerializer(many=True)

    class Meta:
        model = Order
        fields = (
            'order_id', 'full_name', 'phone', 'email',
            'address', 'ward', 'district', 'city',
            'payment_method', 'notes', 'items', 'total_amount'
        )

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        order = Order.objects.create(**validated_data)
        for it in items_data:
            OrderItem.objects.create(
                order=order,
                product_id=it['product_id'],
                quantity=it['quantity'],
                color=it.get('color', ''),
                size=it.get('size', ''),
                price=it['price']
            )
        return order


class OrderResponseSerializer(serializers.ModelSerializer):
    items = OrderItemResponseSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    items_count = serializers.SerializerMethodField()
    buyer_name = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'order_id',
            'user',
            'buyer_name',
            'full_name',
            'phone',
            'email',
            'address',
            'ward',
            'district',
            'city',
            'payment_method',
            'notes',
            'status',
            'status_display',
            'total_amount',
            'items',
            'items_count',
            'created_at',
        ]

    def get_items_count(self, obj):
        return obj.items.count()

    def get_buyer_name(self, obj):
        if obj.user:
            return getattr(obj.user, 'full_name', None) or obj.user.username
        return obj.full_name


class OrderListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing orders"""
    items_count = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    buyer_name = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'order_id',
            'buyer_name',
            'full_name',
            'phone',
            'status',
            'status_display',
            'payment_method',
            'total_amount',
            'items_count',
            'created_at',
        ]

    def get_items_count(self, obj):
        return obj.items.count()

    def get_buyer_name(self, obj):
        if obj.user:
            return getattr(obj.user, 'full_name', None) or obj.user.username
        return obj.full_name
