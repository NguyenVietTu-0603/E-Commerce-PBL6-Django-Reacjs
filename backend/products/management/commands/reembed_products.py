from pathlib import Path
from django.core.management.base import BaseCommand
from django.db import transaction
from products.models import Product
from clip_service import embed_images  # đổi từ 'backend.clip_service' sang 'clip_service'

class Command(BaseCommand):
    help = "Tạo lại CLIP embeddings từ file ảnh của Product (media/products/...)."

    def add_arguments(self, parser):
        parser.add_argument("--only-missing", action="store_true", help="Chỉ tạo cho sản phẩm chưa có embedding")
        parser.add_argument("--batch-size", type=int, default=64)
        parser.add_argument("--limit", type=int, default=None)

    def handle(self, *args, **opts):
        only_missing = opts.get("only_missing", False)
        batch_size = int(opts.get("batch_size", 64))
        limit = opts.get("limit")

        qs = Product.objects.exclude(image="").exclude(image__isnull=True)
        if only_missing:
            qs = qs.filter(image_embedding__isnull=True)

        total = qs.count()
        if limit:
            total = min(total, total if limit is None else limit)
            qs = qs[:limit]

        self.stdout.write(f"🔎 Sản phẩm cần xử lý: {total}")
        processed = 0

        buf = []
        paths = []

        def flush():
            nonlocal buf, paths, processed
            if not buf:
                return
            embs = embed_images(paths)  # shape: (B, D)
            for prod, vec in zip(buf, embs):
                prod.image_embedding = vec.numpy().astype("float32").tolist()
            with transaction.atomic():
                Product.objects.bulk_update(buf, ["image_embedding"], batch_size=200)
            processed += len(buf)
            self.stdout.write(f"💾 Cập nhật {len(buf)} | Tổng: {processed}")
            buf = []
            paths = []

        for prod in qs.iterator():
            try:
                img_path = Path(prod.image.path)
            except Exception:
                continue
            if not img_path.exists():
                continue
            buf.append(prod)
            paths.append(str(img_path))
            if len(buf) >= batch_size:
                flush()

        flush()
        self.stdout.write(f"✅ Hoàn tất. Đã cập nhật: {processed}")