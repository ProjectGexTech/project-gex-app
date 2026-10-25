@echo off
echo ============================================================
echo  GEX Football Prediction - Python Setup
echo ============================================================
echo.
echo Installing Python dependencies...
pip install -r "%~dp0requirements.txt"
if %errorlevel% neq 0 (
    echo.
    echo ERROR: pip install failed. Make sure Python 3.9+ is installed.
    pause
    exit /b 1
)
echo.
echo Setup complete! Run start.bat to train the model and start the server.
pause
