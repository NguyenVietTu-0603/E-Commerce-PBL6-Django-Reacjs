# Script kích hoạt môi trường ảo Backend
# Sử dụng: .\activate_backend.ps1

Write-Host "🚀 Đang kích hoạt môi trường ảo Backend..." -ForegroundColor Green

Set-Location -Path "$PSScriptRoot\backend"

if (Test-Path ".\venv\Scripts\Activate.ps1") {
    & .\venv\Scripts\Activate.ps1
    Write-Host "✅ Đã kích hoạt venv backend!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📦 Kiểm tra phiên bản:" -ForegroundColor Cyan
    python --version
    Write-Host ""
    Write-Host "🔧 Để chạy server Django:" -ForegroundColor Yellow
    Write-Host "   python manage.py runserver" -ForegroundColor White
    Write-Host ""
    Write-Host "🔧 Để migrate database:" -ForegroundColor Yellow
    Write-Host "   python manage.py migrate" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "❌ Không tìm thấy venv! Vui lòng chạy:" -ForegroundColor Red
    Write-Host "   python -m venv venv" -ForegroundColor White
}
