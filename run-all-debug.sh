#!/bin/bash

# Set default options
REBUILD=true
FORCE_REBUILD=false
DETACHED=false
SHOW_LOGS=true

echo "Starting debug script for Docker setup..."

# Stop any running containers
echo "Stopping any running containers..."
docker-compose -f docker-compose-full.yml down

echo "Removing old containers and images to ensure clean state..."
docker system prune -f

# Build with detailed logs
echo "Building containers with verbose logging..."
BUILD_CMD="docker-compose -f docker-compose-full.yml build --progress=plain"
eval $BUILD_CMD

# Start the containers in attached mode to see all logs
echo "Starting all services in attached mode for debugging..."
docker-compose -f docker-compose-full.yml up

# Note: The script will stop here and show logs while running
# Press Ctrl+C to exit 