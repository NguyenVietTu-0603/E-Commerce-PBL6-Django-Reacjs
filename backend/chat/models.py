from django.conf import settings
from django.db import models

class Conversation(models.Model):
    buyer = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='buyer_conversations', on_delete=models.CASCADE)
    shop = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='shop_conversations', on_delete=models.CASCADE)
    product = models.ForeignKey('products.Product', null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)
    buyer_unread = models.PositiveIntegerField(default=0)
    shop_unread = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('buyer', 'shop', 'product')

    def __str__(self):
        return f"Conv#{self.id} buyer={self.buyer_id} shop={self.shop_id}"

class Message(models.Model):
    conversation = models.ForeignKey(Conversation, related_name='messages', on_delete=models.CASCADE)
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Msg#{self.id} conv={self.conversation_id} by={self.sender_id}"
