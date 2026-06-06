#!/usr/bin/env bash
set -euo pipefail

python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

echo "EasySign server environment ready. Run: uvicorn main:app --reload --port 8000"
