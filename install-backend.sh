#!/bin/bash

# Installation script for backend

echo "📦 Installing backend dependencies..."
cd server

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js first."
    exit 1
fi

# Create package.json if it doesn't exist
cat > package.json << 'EOF'
{
  "name": "tourist-map-backend",
  "version": "1.0.0",
  "description": "Express backend for Tourist Map app",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "mysql2": "^3.15.3",
    "bcryptjs": "^3.0.2",
    "jsonwebtoken": "^9.0.2",
    "dotenv": "^16.4.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
EOF

echo "✅ package.json created"

# Install dependencies
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Backend dependencies installed successfully!"
    echo ""
    echo "🚀 To start the backend server:"
    echo "   cd server"
    echo "   npm run dev"
    echo ""
else
    echo "❌ Failed to install dependencies"
    exit 1
fi
