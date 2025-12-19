# Script chạy Frontend Development Server
# Sử dụng: .\run_frontend.ps1

Write-Host "🚀 Đang khởi động Frontend Dev Server..." -ForegroundColor Green

Set-Location -Path "$PSScriptRoot\frontend"

if (Test-Path ".\node_modules") {
    Write-Host "✅ Tìm thấy node_modules" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔄 Đang khởi động React dev server tại http://localhost:3000..." -ForegroundColor Cyan
    Write-Host ""
    
    npm start
} else {
    Write-Host "❌ Chưa cài đặt dependencies! Vui lòng chạy:" -ForegroundColor Red
    Write-Host "   npm install" -ForegroundColor White
}
