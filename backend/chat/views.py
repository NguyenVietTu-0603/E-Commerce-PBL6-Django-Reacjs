from django.db.models import Prefetch
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Conversation, Message
from .serializers import ConversationSerializer


class ConversationListView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request):
		queryset = self.get_queryset(request)
		serializer = ConversationSerializer(queryset, many=True, context={"request": request})
		return Response({"results": serializer.data})

	def get_queryset(self, request):
		user = request.user
		base_queryset = (
			Conversation.objects.select_related("buyer", "shop", "product", "shop__profile", "buyer__profile")
			.prefetch_related(
				Prefetch(
					"messages",
					queryset=Message.objects.order_by("-created_at"),
					to_attr="_prefetched_messages",
				)
			)
		)

		if getattr(user, "user_type", None) == "seller":
			return base_queryset.filter(shop=user).order_by("-created_at")
		if getattr(user, "user_type", None) == "buyer":
			return base_queryset.filter(buyer=user).order_by("-created_at")

		buyer_id = request.query_params.get("buyer")
		shop_id = request.query_params.get("shop")
		if buyer_id:
			base_queryset = base_queryset.filter(buyer_id=buyer_id)
		if shop_id:
			base_queryset = base_queryset.filter(shop_id=shop_id)
		return base_queryset.order_by("-created_at")
