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

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemCreateSerializer(many=True)

    class Meta:
        model = Order
        fields = (
            'order_id','full_name','phone','email',
            'address','ward','district','city',
            'payment_method','notes','items','total_amount'
        )

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        order = Order.objects.create(**validated_data)
        for it in items_data:
            OrderItem.objects.create(
                order=order,
                product_id=it['product_id'],
                quantity=it['quantity'],
                color=it.get('color',''),
                size=it.get('size',''),
                price=it['price']
            )
        return order

class OrderResponseSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()
    class Meta:
        model = Order
        fields = ('order_id','status','total_amount','created_at','items')

    def get_items(self, obj):
        return [
            {
                'product': item.product.name if hasattr(item.product, 'name') else item.product_id,
                'quantity': item.quantity,
                'price': item.price
            } for item in obj.items.all()
        ]
