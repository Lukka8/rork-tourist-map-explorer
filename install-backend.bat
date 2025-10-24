@echo off
REM Installation script for backend (Windows)

echo Installing backend dependencies...
cd server

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo npm is not installed. Please install Node.js first.
    exit /b 1
)

REM Create package.json
(
echo {
echo   "name": "tourist-map-backend",
echo   "version": "1.0.0",
echo   "description": "Express backend for Tourist Map app",
echo   "main": "index.js",
echo   "scripts": {
echo     "start": "node index.js",
echo     "dev": "nodemon index.js"
echo   },
echo   "dependencies": {
echo     "express": "^4.18.2",
echo     "cors": "^2.8.5",
echo     "mysql2": "^3.15.3",
echo     "bcryptjs": "^3.0.2",
echo     "jsonwebtoken": "^9.0.2",
echo     "dotenv": "^16.4.5"
echo   },
echo   "devDependencies": {
echo     "nodemon": "^3.0.1"
echo   }
echo }
) > package.json

echo package.json created

REM Install dependencies
call npm install

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Backend dependencies installed successfully!
    echo.
    echo To start the backend server:
    echo    cd server
    echo    npm run dev
    echo.
) else (
    echo Failed to install dependencies
    exit /b 1
)
