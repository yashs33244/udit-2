#!/bin/bash

# Stop any running containers
echo "Stopping any running containers..."
docker-compose down

# Install dependencies for MongoDB backend
echo "Installing dependencies for MongoDB backend..."
cd mongodb_be
npm install
cd ..

# Build MongoDB backend locally first to ensure it works
echo "Building MongoDB backend locally..."
cd mongodb_be
npx prisma generate
npm run build
cd ..

# Build and start Docker containers
echo "Building and starting MongoDB and backend services..."
docker-compose up -d --build

# Wait for the services to be ready
echo "Waiting for services to start..."
sleep 15

# Check if the MongoDB service is running
if docker ps | grep -q mongodb; then
  echo "MongoDB is running"
else
  echo "Error: MongoDB failed to start"
  exit 1
fi

# Check if the MongoDB backend service is running
if docker ps | grep -q mongodb_be; then
  echo "MongoDB Backend is running"
else
  echo "Error: MongoDB Backend failed to start"
  exit 1
fi

echo "Services are ready"
echo "MongoDB: mongodb://localhost:27017"
echo "MongoDB Backend: http://localhost:5001"

echo "Setup completed successfully" 