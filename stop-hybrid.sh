#!/bin/bash

echo "Stopping all hybrid services..."

# Find and kill npm processes
echo "Stopping npm processes..."
pkill -f "npm run dev" 2>/dev/null || echo "No npm processes found"

# Wait a moment for processes to terminate
sleep 2

# Check if any npm run dev processes are still running
if pgrep -f "npm run dev" > /dev/null; then
  echo "Some npm processes didn't terminate gracefully, forcing termination..."
  pkill -9 -f "npm run dev" 2>/dev/null || echo "No npm processes found"
fi

# Stop Docker containers
echo "Stopping Docker containers..."
docker-compose -f docker-compose-hybrid.yml down

echo "All hybrid services stopped successfully!" 