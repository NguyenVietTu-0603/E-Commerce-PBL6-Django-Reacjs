@echo off
REM Script kích hoạt môi trường ảo Backend (Windows CMD)

echo.
echo ^>^>^> Dang kich hoat moi truong ao Backend...
echo.

cd /d "%~dp0backend"

if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
    echo.
    echo ^>^>^> Da kich hoat venv backend!
    echo.
    echo --- Kiem tra phien ban ---
    python --version
    echo.
    echo --- De chay server Django ---
    echo     python manage.py runserver
    echo.
    echo --- De migrate database ---
    echo     python manage.py migrate
    echo.
) else (
    echo.
    echo [!] Khong tim thay venv! Vui long chay:
    echo     python -m venv venv
    echo.
)
