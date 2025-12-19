# 🚀 Hướng dẫn cài đặt môi trường ảo

Dự án đã được thiết lập với môi trường ảo riêng biệt cho Backend (Python) và Frontend (Node.js).

## 📋 Tổng quan

### Backend (Django + PyTorch)
- **Vị trí**: `backend/venv/`
- **Python version**: 3.13
- **Các package chính**:
  - Django 4.2.27
  - Django REST Framework
  - PyTorch 2.9.1 (CPU version)
  - torchvision 0.24.1
  - transformers 4.57.3
  - Pillow, numpy, và nhiều package khác

### Frontend (React)
- **Vị trí**: `frontend/node_modules/`
- **Node/npm**: Sử dụng npm install
- **Framework**: React với Create React App

---

## 🎯 Cách sử dụng nhanh

### 1️⃣ Chạy Backend Server

**Cách 1: Sử dụng script (khuyến nghị)**
```powershell
.\run_backend.ps1
```

**Cách 2: Thủ công**
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python manage.py runserver
```

Server sẽ chạy tại: **http://localhost:8000**

### 2️⃣ Chạy Frontend Dev Server

**Cách 1: Sử dụng script (khuyến nghị)**
```powershell
.\run_frontend.ps1
```

**Cách 2: Thủ công**
```powershell
cd frontend
npm start
```

Server sẽ chạy tại: **http://localhost:3000**

---

## 🛠️ Scripts có sẵn

| Script | Mô tả |
|--------|-------|
| `activate_backend.ps1` | Kích hoạt venv backend (PowerShell) |
| `activate_backend.bat` | Kích hoạt venv backend (CMD) |
| `run_backend.ps1` | Chạy Django server |
| `run_frontend.ps1` | Chạy React dev server |

---

## 📦 Backend - Chi tiết

### Cấu trúc môi trường ảo
```
backend/
├── venv/               # Virtual environment
│   ├── Scripts/
│   ├── Lib/
│   └── Include/
├── manage.py
├── requirements.txt
└── ...
```

### Các lệnh thường dùng

**Kích hoạt venv:**
```powershell
cd backend
.\venv\Scripts\Activate.ps1
```

**Kiểm tra packages đã cài:**
```powershell
pip list
```

**Cài thêm package mới:**
```powershell
pip install package-name
```

**Cập nhật requirements.txt:**
```powershell
pip freeze > requirements.txt
```

**Migrate database:**
```powershell
python manage.py migrate
```

**Tạo superuser:**
```powershell
python manage.py createsuperuser
```

**Chạy tests:**
```powershell
pytest
```

### Deactivate venv
```powershell
deactivate
```

---

## 🎨 Frontend - Chi tiết

### Cấu trúc
```
frontend/
├── node_modules/      # Dependencies
├── src/
├── public/
├── package.json
└── ...
```

### Các lệnh thường dùng

**Cài đặt dependencies:**
```powershell
cd frontend
npm install
```

**Chạy dev server:**
```powershell
npm start
```

**Build production:**
```powershell
npm run build
```

**Chạy tests:**
```powershell
npm test
```

**Fix vulnerabilities:**
```powershell
npm audit fix
```

---

## 🔧 Troubleshooting

### Backend

**Lỗi: "python not found"**
- Đảm bảo đã kích hoạt venv: `.\venv\Scripts\Activate.ps1`

**Lỗi: "Module not found"**
- Cài lại dependencies: `pip install -r requirements.txt`

**Lỗi khi load ResNet model**
- Kiểm tra file `best_model_resnet.pth` có trong `backend/`
- Đảm bảo PyTorch đã được cài đặt

**Lỗi database**
```powershell
python manage.py migrate
```

### Frontend

**Lỗi: "npm command not found"**
- Cài đặt Node.js từ https://nodejs.org/

**Lỗi dependencies**
```powershell
rm -rf node_modules package-lock.json
npm install
```

**Port 3000 đã được sử dụng**
- Thay đổi port: `PORT=3001 npm start`

---

## 🔄 Cài đặt lại từ đầu

### Backend
```powershell
# Xóa venv cũ
rm -rf backend/venv

# Tạo venv mới
cd backend
python -m venv venv

# Kích hoạt và cài đặt
.\venv\Scripts\Activate.ps1
pip install --upgrade pip

# Cài PyTorch CPU version
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Cài các packages còn lại
pip install -r requirements.txt
```

### Frontend
```powershell
# Xóa node_modules cũ
rm -rf frontend/node_modules
rm frontend/package-lock.json

# Cài đặt lại
cd frontend
npm install
```

---

## 📝 Ghi chú quan trọng

1. **Không commit venv và node_modules** - Đã được thêm vào `.gitignore`

2. **PyTorch CPU version** - Sử dụng CPU để tiết kiệm dung lượng. Nếu có GPU:
   ```powershell
   pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
   ```

3. **Requirements.txt đã được cập nhật**:
   - `numpy>=1.26.4` thay vì `==1.26.4`
   - `torch>=2.2.0` thay vì `==2.2.2+cpu`
   - `torchvision>=0.17.0` mới được thêm

4. **Frontend có 12 vulnerabilities** - Có thể fix bằng `npm audit fix`

5. **Python version**: Dự án sử dụng Python 3.13

---

## 🌟 Workflow phát triển

### Bắt đầu làm việc
1. Mở 2 terminal
2. Terminal 1: `.\run_backend.ps1`
3. Terminal 2: `.\run_frontend.ps1`
4. Truy cập http://localhost:3000

### Kết thúc làm việc
- Nhấn `Ctrl+C` trong cả 2 terminal
- Backend: gõ `deactivate` để thoát venv

---

## 📞 Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
- [ ] Python và Node.js đã được cài đặt
- [ ] Đã kích hoạt venv trước khi chạy lệnh Python
- [ ] Dependencies đã được cài đặt đầy đủ
- [ ] Port 8000 và 3000 chưa được sử dụng
- [ ] File `best_model_resnet.pth` có trong `backend/`

---

**Phiên bản**: 1.0  
**Ngày cập nhật**: 19/12/2025
