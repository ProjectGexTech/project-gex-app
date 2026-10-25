@echo off
cd /d "%~dp0"
echo ============================================================
echo  GEX Football Prediction - ML Server
echo ============================================================
echo.

if exist "models\team_history.pkl" goto start_server

echo Models not found. Training now (this takes 2-5 minutes)...
echo.
python train.py
if %errorlevel% neq 0 goto train_error
echo.

:start_server
echo Starting FastAPI server on http://localhost:8000
echo Press Ctrl+C to stop.
echo.
python -m uvicorn app:app --host 0.0.0.0 --port 8000
pause
goto end

:train_error
echo.
echo ERROR: Training failed. Check the output above.
pause

:end
