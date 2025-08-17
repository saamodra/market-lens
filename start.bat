@echo off
echo 🚀 Starting Stock Analyzer...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.8+ first.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 16+ first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Start backend
echo 🐍 Starting Python FastAPI backend...
cd backend

REM Check if virtual environment exists
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install requirements if not already installed
echo 📥 Installing Python dependencies...
pip install -r requirements.txt

REM Check if .env file exists
if not exist ".env" (
    echo ⚠️  .env file not found. Creating from template...
    copy env.example .env
    echo 📝 Please edit .env file and add your Google AI API key
    echo 🔑 Get your API key from: https://makersuite.google.com/app/apikey
)

REM Start backend in background
echo 🚀 Starting backend server on http://localhost:8000
start "Backend Server" python run.py

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Go back to root directory
cd ..

REM Start frontend
echo ⚛️  Starting React frontend...
echo 📥 Installing frontend dependencies...
npm install

echo 🚀 Starting frontend server on http://localhost:5173
start "Frontend Server" npm run dev

echo.
echo 🎉 Stock Analyzer is starting up!
echo.
echo 📊 Backend API: http://localhost:8000
echo 📊 API Docs: http://localhost:8000/docs
echo 🌐 Frontend: http://localhost:5173
echo.
echo Both servers are now running in separate windows.
echo Close the windows to stop the servers.
pause
