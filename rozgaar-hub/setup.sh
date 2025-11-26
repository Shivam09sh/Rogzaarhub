#!/bin/bash

# RozgaarHub Setup Script
# This script helps set up the project for new collaborators

echo "🚀 RozgaarHub Setup Script"
echo "=========================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed!"
    exit 1
fi

echo "✅ npm version: $(npm -v)"
echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Frontend dependency installation failed!"
    exit 1
fi

echo "✅ Frontend dependencies installed"
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

if [ $? -ne 0 ]; then
    echo "❌ Backend dependency installation failed!"
    exit 1
fi

cd ..
echo "✅ Backend dependencies installed"
echo ""

# Check for environment files
echo "🔍 Checking environment files..."

if [ ! -f "backend/.env" ]; then
    echo "⚠️  backend/.env not found!"
    if [ -f "backend/.env.example" ]; then
        echo "📋 Copying backend/.env.example to backend/.env..."
        cp backend/.env.example backend/.env
        echo "✅ Created backend/.env from example file"
        echo "✅ Database credentials are already configured!"
    else
        echo "❌ backend/.env.example not found! Please contact project owner."
        exit 1
    fi
else
    echo "✅ backend/.env exists"
fi

if [ ! -f ".env" ]; then
    echo "⚠️  .env not found!"
    if [ -f ".env.example" ]; then
        echo "📋 Copying .env.example to .env..."
        cp .env.example .env
        echo "✅ Created .env from example file"
    else
        echo "❌ .env.example not found! Please contact project owner."
        exit 1
    fi
else
    echo "✅ .env exists"
fi

echo ""
echo "✅ Setup Complete!"
echo ""
echo "📝 Next Steps:"
echo "1. Environment files are configured with shared database"
echo "2. Open TWO terminal windows:"
echo ""
echo "   Terminal 1 (Backend):"
echo "   $ cd backend"
echo "   $ npm run dev"
echo ""
echo "   Terminal 2 (Frontend):"
echo "   $ npm run dev"
echo ""
echo "3. Open http://localhost:8080 in your browser"
echo ""
echo "🎉 You're all set! Everyone shares the same database."
echo "📖 For detailed instructions, see SETUP.md"
echo ""
