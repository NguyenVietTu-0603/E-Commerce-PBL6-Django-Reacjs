# Hướng dẫn sử dụng tìm kiếm bằng ảnh với ResNet

## Tính năng mới
Hệ thống tìm kiếm sản phẩm bằng ảnh sử dụng mô hình ResNet18 đã được train với 18 class:
- backpack, belts, boots, dresses, eyewears, handbags, hatcap, jackets, jeans, perfume, phones, shirts, shorts, skirts, slides, sneakers, wallets, watch

## Cài đặt Backend

### 1. Đảm bảo mô hình đã có
File `best_model_resnet.pth` phải nằm trong thư mục `backend/`

### 2. Cài đặt dependencies (nếu chưa)
```bash
cd backend
pip install -r requirements.txt
```

### 3. Chạy server
```bash
python manage.py runserver
```

## Cài đặt Frontend

### 1. Cài đặt dependencies
```bash
cd frontend
npm install
```

### 2. Chạy development server
```bash
npm start
```

## Cách sử dụng

### Từ giao diện web:
1. Đăng nhập vào hệ thống
2. Ở thanh header, click vào button **"Tìm bằng ảnh"** (có icon ảnh)
3. Chọn một file ảnh từ máy tính của bạn
4. Hệ thống sẽ:
   - Phân loại ảnh thành 1 trong 18 class
   - Hiển thị category được phát hiện
   - Tìm và hiển thị các sản phẩm trong category đó
5. Kết quả sẽ hiển thị trên trang `/search?mode=image`

### Test API trực tiếp:
```bash
curl -X POST http://localhost:8000/api/search/image/ \
  -F "file=@path/to/your/image.jpg"
```

Response mẫu:
```json
{
  "predicted_class": "backpack",
  "category": "Backpack",
  "total_results": 25,
  "results": [
    {
      "id": 1,
      "name": "Cool Backpack",
      "price": "299000",
      "image": "/media/products/backpack.jpg",
      "category": "Backpack",
      "seller": "seller_username"
    }
  ]
}
```

## Kiến trúc hệ thống

### Backend:
- **resnet_service.py**: Service load model và thực hiện classification
- **products/views.py**: ImageSearchView - API endpoint xử lý upload ảnh
- **products/urls.py**: Route `/api/search/image/`

### Frontend:
- **components/ImageSearchUpload.jsx**: Component upload ảnh
- **components/Header.jsx**: Tích hợp button tìm kiếm bằng ảnh
- **pages/SearchResults.jsx**: Hiển thị kết quả tìm kiếm

## Lưu ý quan trọng

1. **Model file**: Đảm bảo `best_model_resnet.pth` có đúng architecture với code (ResNet18, 18 classes)

2. **Categories trong database**: Để kết quả tìm kiếm tốt nhất, các category trong database nên khớp với 18 class names:
   - Tạo categories: Backpack, Belts, Boots, Dresses, Eyewears, Handbags, Hatcap, Jackets, Jeans, Perfume, Phones, Shirts, Shorts, Skirts, Slides, Sneakers, Wallets, Watch

3. **Performance**: 
   - Model chỉ load 1 lần khi server khởi động
   - Sử dụng CPU inference (có thể chuyển sang GPU nếu có)

4. **Giới hạn**: API trả về tối đa 50 sản phẩm mỗi lần tìm kiếm

## Troubleshooting

### Lỗi "Cannot find model file":
- Kiểm tra file `best_model_resnet.pth` có trong thư mục `backend/`
- Đảm bảo đúng tên file

### Lỗi "Classification failed":
- Kiểm tra ảnh upload có hợp lệ không
- Kiểm tra model architecture khớp với file .pth

### Không tìm thấy sản phẩm:
- Kiểm tra database có sản phẩm trong category tương ứng không
- Thử thêm sản phẩm vào các category khớp với 18 class names

## Nâng cấp trong tương lai

1. **Cải thiện accuracy**: Train lại model với data nhiều hơn
2. **Multi-class output**: Hiển thị top 3 categories thay vì chỉ 1
3. **Similarity search**: Thay vì chỉ filter theo category, tính similarity giữa các sản phẩm
4. **Caching**: Cache kết quả classification để tăng tốc độ
