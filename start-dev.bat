@echo off
echo 🚀 Starting Campus Utility Development Server...
echo.

echo 📦 Starting Backend Server...
cd server
start "Backend Server" cmd /k "npm start"

echo ⏳ Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo 🌐 Starting Frontend Development Server...
cd ..
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ✅ Development servers starting...
echo.
echo 📱 Frontend: http://localhost:5173
echo 🔧 Backend:  http://localhost:5000
echo.
echo 📝 Check both terminal windows for any errors
echo 🔄 If you see "Failed to fetch", check the backend terminal
echo.
echo Press any key to exit...
pause >nul
