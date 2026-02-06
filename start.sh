#!/bin/bash

echo "======================================"
echo "HR ESS Application - Quick Start"
echo "======================================"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
    echo ""
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file from example..."
    cp .env.example .env
    echo "✅ .env file created"
    echo "⚠️  Please update .env with your configuration"
    echo ""
fi

# Build the application
echo "🔨 Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "======================================"
    echo "🚀 Starting HR ESS API Server..."
    echo "======================================"
    echo ""
    npm run dev
else
    echo "❌ Build failed. Please check errors above."
    exit 1
fi
