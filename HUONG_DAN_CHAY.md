# 🚀 HƯỚNG DẪN CHẠY DỰ ÁN - TỪNG BƯỚC

## 📋 Yêu cầu hệ thống
- ✅ Python 3.13 đã cài
- ✅ Node.js và npm đã cài
- ✅ Git đã cài

---

## 🎯 BƯỚC 1: CHUẨN BỊ BACKEND

### 1.1. Mở PowerShell/Terminal và di chuyển đến thư mục backend
```powershell
cd C:\PBL\E-Commerce-PBL6-Django-Reacjs\backend
```

### 1.2. Kích hoạt môi trường ảo
```powershell
.\venv\Scripts\Activate.ps1
```

**Lưu ý**: Bạn sẽ thấy `(venv)` xuất hiện ở đầu dòng lệnh

### 1.3. Kiểm tra Python và packages đã cài
```powershell
python --version
pip list
```

### 1.4. Tạo database (lần đầu tiên)
```powershell
python manage.py migrate
```

**Kết quả**: Bạn sẽ thấy các dòng "Applying..." và "OK"

### 1.5. Tạo tài khoản admin (lần đầu tiên)
```powershell
python manage.py createsuperuser
```

**Nhập thông tin**:
- Username: `admin` (hoặc tên bạn muốn)
- Email: `admin@example.com` (hoặc email của bạn)
- Password: (nhập mật khẩu, ít nhất 8 ký tự)
- Password (again): (nhập lại mật khẩu)

### 1.6. Chạy Backend Server
```powershell
python manage.py runserver
```

**Kết quả**: Bạn sẽ thấy:
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

✅ **Backend đã chạy tại**: http://localhost:8000

**Kiểm tra**:
- Truy cập: http://localhost:8000/admin
- Đăng nhập bằng tài khoản admin vừa tạo

⚠️ **KHÔNG ĐÓNG terminal này** - Để server backend chạy

---

## 🎨 BƯỚC 2: CHUẨN BỊ FRONTEND

### 2.1. Mở terminal MỚI (giữ terminal backend đang chạy)

### 2.2. Di chuyển đến thư mục frontend
```powershell
cd C:\PBL\E-Commerce-PBL6-Django-Reacjs\frontend
```

### 2.3. Kiểm tra node_modules đã có chưa
```powershell
dir node_modules
```

**Nếu thấy lỗi "không tìm thấy"**, chạy:
```powershell
npm install
```

### 2.4. Chạy Frontend Dev Server
```powershell
npm start
```

**Kết quả**: 
- Trình duyệt sẽ tự động mở
- Hoặc thấy thông báo:
```
Compiled successfully!

You can now view frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

✅ **Frontend đã chạy tại**: http://localhost:3000

⚠️ **KHÔNG ĐÓNG terminal này** - Để server frontend chạy

---

## 🎉 BƯỚC 3: SỬ DỤNG ỨNG DỤNG

### 3.1. Truy cập ứng dụng
Mở trình duyệt và truy cập: **http://localhost:3000**

### 3.2. Đăng ký tài khoản mới
1. Click nút **"Đăng ký"**
2. Chọn loại tài khoản:
   - **Buyer** (Người mua): để mua sắm sản phẩm
   - **Seller** (Người bán): để bán sản phẩm
3. Điền thông tin và đăng ký

### 3.3. Thử nghiệm tính năng tìm kiếm bằng ảnh
1. Đăng nhập vào hệ thống
2. Click nút **"Tìm bằng ảnh"** ở header
3. Chọn một ảnh từ máy tính
4. Hệ thống sẽ phân loại và hiển thị sản phẩm tương ứng

---

## 🛠️ CÁCH CHẠY NHANH (LẦN SAU)

### Cách 1: Sử dụng script tự động
```powershell
# Chạy từ thư mục gốc dự án
.\start_all.ps1
```

### Cách 2: Thủ công

**Terminal 1 - Backend**:
```powershell
cd C:\PBL\E-Commerce-PBL6-Django-Reacjs
.\run_backend.ps1
```

**Terminal 2 - Frontend**:
```powershell
cd C:\PBL\E-Commerce-PBL6-Django-Reacjs
.\run_frontend.ps1
```

---

## 🔄 CÁC LỆNH THƯỜNG DÙNG

### Backend (trong venv)

**Tạo migrations sau khi thay đổi models**:
```powershell
python manage.py makemigrations
python manage.py migrate
```

**Chạy shell Django**:
```powershell
python manage.py shell
```

**Thu thập static files**:
```powershell
python manage.py collectstatic
```

**Chạy tests**:
```powershell
pytest
```

### Frontend

**Cài package mới**:
```powershell
npm install package-name
```

**Build production**:
```powershell
npm run build
```

**Xem logs chi tiết**:
```powershell
npm start --verbose
```

---

## ⚠️ XỬ LÝ LỖI THƯỜNG GẶP

### 1. Backend không chạy được

**Lỗi: "python không được nhận dạng"**
```powershell
# Kích hoạt venv trước
.\venv\Scripts\Activate.ps1
```

**Lỗi: "No module named 'django'"**
```powershell
# Cài lại dependencies
pip install -r requirements.txt
```

**Lỗi: "Port 8000 đã được sử dụng"**
```powershell
# Chạy ở port khác
python manage.py runserver 8001
```

**Lỗi: "table xxx doesn't exist"**
```powershell
# Chạy lại migrations
python manage.py migrate
```

### 2. Frontend không chạy được

**Lỗi: "npm không được nhận dạng"**
- Cài đặt Node.js từ https://nodejs.org/

**Lỗi: "Cannot find module"**
```powershell
# Cài lại node_modules
rm -r node_modules
rm package-lock.json
npm install
```

**Lỗi: "Port 3000 đã được sử dụng"**
```powershell
# Chạy ở port khác
$env:PORT=3001; npm start
```

### 3. Tìm kiếm bằng ảnh không hoạt động

**Lỗi: "Cannot find model file"**
- Kiểm tra file `best_model_resnet.pth` có trong `backend/`
- File phải có đúng tên và nằm đúng thư mục

**Lỗi: "Classification failed"**
- Kiểm tra PyTorch đã được cài đặt:
  ```powershell
  pip list | findstr torch
  ```
- Nếu chưa có, cài lại:
  ```powershell
  pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
  ```

---

## 🗂️ CẤU TRÚC FOLDERS

```
E-Commerce-PBL6-Django-Reacjs/
├── backend/
│   ├── venv/                    # Môi trường ảo Python
│   ├── manage.py               # Django management script
│   ├── requirements.txt        # Python dependencies
│   ├── best_model_resnet.pth   # ResNet model (QUAN TRỌNG!)
│   ├── db.sqlite3              # Database (tạo sau khi migrate)
│   └── backend/                # Settings Django
├── frontend/
│   ├── node_modules/           # Node dependencies
│   ├── package.json            # Node config
│   ├── src/                    # Source code React
│   └── public/                 # Static files
├── run_backend.ps1             # Script chạy backend
├── run_frontend.ps1            # Script chạy frontend
├── start_all.ps1               # Script chạy cả 2
└── HUONG_DAN_CHAY.md          # File này
```

---

## 📝 CHECKLIST TRƯỚC KHI CHẠY

### Lần đầu tiên
- [ ] Python 3.13 đã cài đặt
- [ ] Node.js đã cài đặt
- [ ] Đã tạo venv: `backend/venv/`
- [ ] Đã cài dependencies backend: `pip list` có Django
- [ ] Đã cài dependencies frontend: `frontend/node_modules/` tồn tại
- [ ] File model: `backend/best_model_resnet.pth` tồn tại
- [ ] Đã chạy migrations: `python manage.py migrate`
- [ ] Đã tạo superuser: `python manage.py createsuperuser`

### Mỗi lần chạy
- [ ] Kích hoạt venv backend: `.\venv\Scripts\Activate.ps1`
- [ ] Port 8000 và 3000 chưa được sử dụng
- [ ] Terminal backend đang chạy
- [ ] Terminal frontend đang chạy

---

## 🎯 TÓM TẮT NHANH

### Chạy lần đầu:
1. `cd backend` → `.\venv\Scripts\Activate.ps1`
2. `python manage.py migrate`
3. `python manage.py createsuperuser`
4. `python manage.py runserver` (terminal 1)
5. `cd ../frontend` → `npm start` (terminal 2)
6. Truy cập http://localhost:3000

### Chạy lần sau:
1. `.\start_all.ps1` (tự động chạy cả 2)
2. Hoặc: `.\run_backend.ps1` + `.\run_frontend.ps1`

---

## 📞 LIÊN HỆ HỖ TRỢ

Nếu gặp vấn đề, kiểm tra:
1. ✅ Terminal có hiển thị lỗi gì không?
2. ✅ Đã kích hoạt venv chưa? (có `(venv)` ở đầu dòng)
3. ✅ Port có bị trùng không?
4. ✅ File `best_model_resnet.pth` có trong `backend/` chưa?
5. ✅ Đã chạy migrations chưa?

**Xem log chi tiết**:
- Backend: Trong terminal đang chạy `runserver`
- Frontend: Trong terminal đang chạy `npm start`

---

**Chúc bạn thành công!** 🎉
