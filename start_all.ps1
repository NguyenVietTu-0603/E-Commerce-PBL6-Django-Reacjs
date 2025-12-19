# Script khởi động cả Backend và Frontend cùng lúc
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Khởi động Backend + Frontend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Khởi động Backend
Write-Host "[1] Đang khởi động Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; .\venv\Scripts\python.exe manage.py runserver"

# Chờ 3 giây
Start-Sleep -Seconds 3

# Khởi động Frontend
Write-Host "[2] Đang khởi động Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm start"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   THÀNH CÔNG!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  " -NoNewline -ForegroundColor White
Write-Host "http://localhost:8000" -ForegroundColor Cyan
Write-Host "Frontend: " -NoNewline -ForegroundColor White
Write-Host "http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Nhấn Ctrl+C trong mỗi terminal để dừng server" -ForegroundColor Yellow
Write-Host ""
