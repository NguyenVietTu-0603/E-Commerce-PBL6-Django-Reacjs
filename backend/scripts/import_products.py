import csv
import random
from pathlib import Path
from products.models import Product, Category
from django.contrib.auth import get_user_model
from django.core.files import File  # thêm

User = get_user_model()

def run():
    base_dir = Path(__file__).resolve().parent
    products_csv = base_dir / 'styles.csv'
    images_csv = base_dir / 'images.csv'
    # Dùng thư mục ảnh thật ngoài dự án
    image_dir = Path(r"C:\Users\HOan\Downloads\fashion-dataset\images")  # thư mục chứa ảnh local dạng {id}.jpg

    if not products_csv.exists():
        print(f"❌ Không tìm thấy file: {products_csv}")
        return

    def normalize_filename(name: str | None) -> str | None:
        if not name:
            return None
        return name.strip().lower()

    def find_local_image(row_id: str | None) -> Path | None:
        if not row_id:
            return None
        # ưu tiên .jpg, nhưng vẫn thử vài phần mở rộng phổ biến
        for ext in ('.jpg', '.jpeg', '.png', '.webp'):
            p = image_dir / f"{row_id}{ext}"
            if p.exists():
                return p
        return None

    # Load image map: filename -> link
    image_map: dict[str, str] = {}
    if images_csv.exists():
        with images_csv.open(newline='', encoding='utf-8') as imgfile:
            reader = csv.DictReader(imgfile)
            for row in reader:
                fn = (
                    row.get('filename')
                    or row.get('file_name')
                    or row.get('image')
                    or row.get('image_filename')
                )
                url = row.get('link') or row.get('url') or row.get('image_url')
                fn_n = normalize_filename(fn)
                if fn_n and url:
                    image_map[fn_n] = url.strip()
        print(f"✅ Đã load {len(image_map)} ảnh từ images.csv")
    else:
        print(f"⚠️ Không tìm thấy images.csv tại: {images_csv}. Sẽ import không có ảnh URL.")

    if not image_dir.exists():
        print(f"⚠️ Thư mục ảnh local chưa tồn tại: {image_dir}")

    # Lấy seller mặc định
    try:
        default_seller = User.objects.first()
        if not default_seller:
            print("❌ Không có user nào trong database!")
            print("💡 Tạo user bằng: python manage.py createsuperuser")
            return
        print(f"✅ Sử dụng seller: {default_seller}")
    except Exception as e:
        print(f"❌ Lỗi khi lấy seller: {e}")
        return

    # Cache categories
    category_cache = {}

    # Hàng chỉ có URL sẽ bulk_create; hàng có ảnh local sẽ save từng bản ghi
    remote_products: list[Product] = []
    missing_any_image = 0
    have_local = 0
    have_remote = 0

    processed = 0
    total_rows = 0
    MAX_ROWS = 1000

    print(f"🔄 Đang đọc file {products_csv}...")

    with products_csv.open(newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            if processed >= MAX_ROWS:
                break
            total_rows += 1

            # Thông tin sản phẩm
            name = row.get('productDisplayName') or row.get('name') or 'Unknown Product'
            desc_parts = []
            for key in ['gender', 'usage', 'articleType', 'baseColour', 'season', 'year']:
                val = (row.get(key) or '').strip()
                if val:
                    desc_parts.append(val)
            description = ' - '.join(desc_parts) if desc_parts else 'No description'

            # Category
            category_name = row.get('subCategory') or row.get('masterCategory') or 'Uncategorized'
            if category_name not in category_cache:
                category_obj, created = Category.objects.get_or_create(
                    name=category_name,
                    defaults={'is_active': True}
                )
                category_cache[category_name] = category_obj
                if created:
                    print(f"  ➕ Tạo category mới: {category_name}")
            else:
                category_obj = category_cache[category_name]

            # ID để tìm ảnh
            row_id = row.get('id') or row.get('productId') or row.get('styleid') or row.get('product_id')
            local_path = find_local_image(str(row_id) if row_id else None)

            # Tìm URL ảnh nếu chưa có local
            image_url = ""
            if not local_path:
                # dựng filename nếu có trong styles.csv
                filename = row.get('filename') or row.get('file_name')
                if not filename and row_id:
                    filename = f"{row_id}.jpg"
                fn_norm = normalize_filename(filename)
                if fn_norm and image_map:
                    image_url = image_map.get(fn_norm, "")
                    if not image_url and '.' in fn_norm:
                        image_url = image_map.get(fn_norm.rsplit('.', 1)[0], "")

            price = random.randint(200_000, 1_500_000)
            stock = random.randint(1, 50)

            # Có ảnh local: lưu ngay để gắn ImageField đúng cách
            if local_path:
                product = Product(
                    seller=default_seller,
                    category=category_obj,
                    name=name,
                    description=description,
                    price=price,
                    stock=stock,
                    image_url="",  # ưu tiên ảnh thật
                    is_active=True,
                )
                product.save()  # cần PK trước khi lưu file (an toàn)
                with local_path.open('rb') as f:
                    product.image.save(local_path.name, File(f), save=True)
                have_local += 1
                processed += 1
            else:
                # Không có local -> dùng URL (nếu có)
                if not image_url:
                    missing_any_image += 1
                product = Product(
                    seller=default_seller,
                    category=category_obj,
                    name=name,
                    description=description,
                    price=price,
                    stock=stock,
                    image='',            # không có file
                    image_url=image_url, # URL nếu có
                    is_active=True
                )
                remote_products.append(product)
                have_remote += 1
                processed += 1

            if processed % 100 == 0:
                print(f"  📦 Đã xử lý {processed}/{MAX_ROWS} dòng...")

    # Bulk create cho các bản ghi chỉ dùng URL
    if remote_products:
        try:
            print(f"\n💾 Đang lưu {len(remote_products)} sản phẩm dùng URL ảnh...")
            Product.objects.bulk_create(remote_products, batch_size=500)
        except Exception as e:
            print(f"❌ Lỗi khi bulk_create: {e}")
            import traceback
            traceback.print_exc()

    print("✅ Import hoàn tất!")
    print(f"   📊 Tổng xử lý: {processed}/{MAX_ROWS} (đọc {total_rows} dòng)")
    print(f"   🖼️  Ảnh local: {have_local}")
    print(f"   🌐  Ảnh URL: {have_remote - missing_any_image}")
    print(f"   ❌ Thiếu ảnh: {missing_any_image}")
    print(f"   📂 Categories: {len(category_cache)}")