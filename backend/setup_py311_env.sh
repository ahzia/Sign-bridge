#!/bin/bash

# Create Python 3.11 virtual environment in py311_venv directory
python3.11 -m venv py311_venv

# Activate the virtual environment
source py311_venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install backend dependencies
pip install -r requirements.txt
