@echo off
setlocal
title AI Image Classifier — One-Click Runner

:: ─── Check for Python ──────────────────────────────────────────
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed. Please install Python 3.9+ from python.org.
    pause
    exit /b
)

:: ─── Setup Virtual Environment ────────────────────────────────
if not exist "venv" (
    echo [INFO] Creating virtual environment...
    python -m venv venv
)

:: ─── Activate and Install ────────────────────────────────────
echo [INFO] Activating virtual environment...
call venv\Scripts\activate

echo [INFO] Checking dependencies...
pip install -r requirements.txt --quiet

:: ─── Start the Application ─────────────────────────────────
echo [INFO] Starting AI Image Classifier...
echo [INFO] Open your browser at http://localhost:5000
echo.
python app.py

pause
