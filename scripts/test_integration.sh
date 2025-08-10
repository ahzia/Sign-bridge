#!/bin/bash

# Test script for SignBridge backend and frontend integration
set -e

echo "🧪 Testing SignBridge Integration..."

# Test backend endpoints
echo "🔧 Testing backend endpoints..."

# Test simplify_text endpoint
echo "  - Testing simplify_text endpoint..."
RESPONSE=$(curl -s -X POST http://127.0.0.1:8000/simplify_text \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world"}' | jq -r '.simplified_text' 2>/dev/null || echo "ERROR")

if [[ "$RESPONSE" == "ERROR" ]]; then
    echo "    ❌ simplify_text endpoint failed"
    exit 1
else
    echo "    ✅ simplify_text endpoint working: $RESPONSE"
fi

# Test translate_signwriting endpoint
echo "  - Testing translate_signwriting endpoint..."
RESPONSE=$(curl -s -X POST http://127.0.0.1:8000/translate_signwriting \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello"}' | jq -r '.signwriting' 2>/dev/null || echo "ERROR")

if [[ "$RESPONSE" == "ERROR" ]]; then
    echo "    ❌ translate_signwriting endpoint failed"
    exit 1
else
    echo "    ✅ translate_signwriting endpoint working: $RESPONSE"
fi

# Test frontend accessibility
echo "🎨 Testing frontend accessibility..."
if curl -s http://localhost:5173/ >/dev/null 2>&1; then
    echo "  ✅ Frontend is accessible at http://localhost:5173"
else
    echo "  ❌ Frontend is not accessible"
    exit 1
fi

# Test Tauri app
echo "📱 Testing Tauri app..."
if pgrep -f "tauri dev" >/dev/null; then
    echo "  ✅ Tauri app is running"
else
    echo "  ❌ Tauri app is not running"
    exit 1
fi

echo ""
echo "🎉 All integration tests passed!"
echo ""
echo "📊 Summary:"
echo "  - Backend: ✅ Running on http://127.0.0.1:8000"
echo "  - Frontend: ✅ Running on http://localhost:5173"
echo "  - Tauri: ✅ Running"
echo "  - API Endpoints: ✅ Working"
echo ""
echo "🚀 SignBridge is ready to use!" 