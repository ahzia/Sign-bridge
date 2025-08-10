#!/bin/bash

# Production build script for SignBridge
# Builds backend executable and bundles it with Tauri app

set -e

echo "🚀 Building SignBridge for Production..."

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Step 1: Build the backend executable
echo "🔧 Building backend executable..."
python3 scripts/build_backend.py

# Step 2: Build the Tauri app
echo "🎨 Building Tauri app..."
cd frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Build the Tauri app
echo "🔨 Building Tauri app..."
npm run build

echo "🎉 Production build complete!"
echo ""
echo "📦 Built app location: frontend/src-tauri/target/release/bundle/"
echo "🔧 Backend is bundled with the app - no external dependencies required!"
echo ""
echo "✅ Ready for Windows Store deployment!" 