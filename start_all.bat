@echo off
echo.
echo ========================================
echo    Khoi dong Backend + Frontend
echo ========================================
echo.
echo [1] Backend dang khoi dong...
start /B "Backend" cmd /k "cd /d %~dp0backend && venv\Scripts\python.exe manage.py runserver"

timeout /t 3 >nul

echo [2] Frontend dang khoi dong...
start /B "Frontend" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo ========================================
echo   THANH CONG!
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Nhan Ctrl+C trong moi terminal de dung server
echo.
pause
