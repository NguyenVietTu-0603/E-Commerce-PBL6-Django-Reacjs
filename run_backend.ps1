# Script chạy Backend Server
# Sử dụng: .\run_backend.ps1

Write-Host "🚀 Đang khởi động Backend Server..." -ForegroundColor Green

Set-Location -Path "$PSScriptRoot\backend"

if (Test-Path ".\venv\Scripts\python.exe") {
    Write-Host "✅ Tìm thấy virtual environment" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔄 Đang khởi động Django server tại http://localhost:8000..." -ForegroundColor Cyan
    Write-Host ""
    
    & .\venv\Scripts\python.exe manage.py runserver
} else {
    Write-Host "❌ Không tìm thấy venv! Vui lòng chạy:" -ForegroundColor Red
    Write-Host "   .\setup_backend.ps1" -ForegroundColor White
}
