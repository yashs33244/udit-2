#!/bin/bash

echo "Stopping any running containers..."
docker-compose down

echo "Starting MongoDB and backend service only..."
docker-compose up -d

echo "Services started successfully!"
echo "MongoDB: mongodb://localhost:27017"
echo "MongoDB Backend: http://localhost:5001"
echo ""
echo "Check logs with: docker-compose logs -f" 