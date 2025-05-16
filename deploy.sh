#!/bin/bash

# Small Business CRM Production Deployment Script
echo "=== Starting CRM Deployment Process ==="
echo "Date: $(date)"

# Make script exit on any command failure
set -e

# Variables
APP_DIR="$(pwd)"
FRONTEND_DIR="$APP_DIR"
BACKEND_DIR="$APP_DIR/backend"
BUILD_DIR="$APP_DIR/build"
LOG_FILE="$APP_DIR/deploy.log"

# Log output to file
exec > >(tee -a $LOG_FILE)
exec 2>&1

echo "=== Environment Setup ==="
# Check if .env.production exists
if [ ! -f "$FRONTEND_DIR/.env.production" ]; then
    echo "ERROR: .env.production file not found!"
    echo "Please create .env.production with the required environment variables."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v)
echo "Using Node.js version: $NODE_VERSION"

# Check if MongoDB is running
echo "Checking MongoDB connection..."
if ! nc -z localhost 27017 > /dev/null 2>&1; then
    echo "Warning: MongoDB may not be running on the default port!"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Install dependencies
echo "=== Installing Dependencies ==="
echo "Installing frontend dependencies..."
cd $FRONTEND_DIR
npm install --production

echo "Installing backend dependencies..."
cd $BACKEND_DIR
npm install --production

# Build the frontend
echo "=== Building Frontend ==="
cd $FRONTEND_DIR
echo "Clearing previous build..."
rm -rf build
echo "Running optimized build..."
npm run build

# Validate build output
if [ ! -d "$BUILD_DIR" ]; then
    echo "ERROR: Build failed - build directory not found!"
    exit 1
fi

echo "=== Production Optimizations ==="
# Create optimized database indexes
echo "Optimizing database indexes..."
cd $BACKEND_DIR
# Optional: Add database index creation script here
# node scripts/create-indexes.js

# Run tests (optional)
if [ "$RUN_TESTS" = "true" ]; then
    echo "=== Running Tests ==="
    cd $FRONTEND_DIR
    npm test -- --watchAll=false
    cd $BACKEND_DIR
    npm test
fi

echo "=== Deployment Complete ==="
echo "The application is ready for deployment."
echo "You can now start the production server with:"
echo "cd $BACKEND_DIR && npm run prod"

# Optional: Auto-start the server
if [ "$AUTO_START" = "true" ]; then
    echo "=== Starting Production Server ==="
    cd $BACKEND_DIR
    NODE_ENV=production nohup node server.js > server.log 2>&1 &
    echo "Server started in background. Check server.log for details."
fi

echo "=== Deployment Finished: $(date) ==="

# Make the script executable
chmod +x deploy.sh