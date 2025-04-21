#!/bin/bash

# Set default options
REBUILD=false
MAX_WAIT=300  # Maximum wait time in seconds

# Parse command line options
while [[ $# -gt 0 ]]; do
  case $1 in
    --rebuild)
      REBUILD=true
      shift
      ;;
    --help)
      echo "Usage: $0 [OPTIONS]"
      echo "Options:"
      echo "  --rebuild        Rebuild containers for databases"
      echo "  --help           Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# Function to clean up
cleanup() {
  echo "Shutting down services..."
  # Find and kill any running npm processes
  pkill -f "npm run dev" 2>/dev/null || true
  # Stop Docker containers
  docker-compose -f docker-compose-hybrid.yml down
  echo "All services stopped."
  exit 0
}

# Set up trap for cleanup
trap cleanup INT TERM EXIT

# Stop any running database containers
echo "Stopping any running database containers..."
docker-compose -f docker-compose-hybrid.yml down

# Remove existing volumes if rebuilding
if $REBUILD; then
  echo "Removing existing volumes..."
  docker-compose -f docker-compose-hybrid.yml down -v
fi

# Build and start PostgreSQL container only
echo "Starting PostgreSQL container..."
docker-compose -f docker-compose-hybrid.yml up -d postgres

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
pg_ready=false
start_time=$(date +%s)
while ! $pg_ready; do
  current_time=$(date +%s)
  elapsed_time=$((current_time - start_time))
  
  if [ $elapsed_time -gt $MAX_WAIT ]; then
    echo "PostgreSQL did not become ready within $MAX_WAIT seconds."
    echo "Check container logs with: docker logs postgres"
    echo "Continuing anyway..."
    break
  fi
  
  if docker exec postgres pg_isready -h localhost -p 5432 -U postgres > /dev/null 2>&1; then
    echo "PostgreSQL is now ready!"
    pg_ready=true
  else
    echo "PostgreSQL is not available yet, waiting 5 seconds... (${elapsed_time}s elapsed)"
    sleep 5
  fi
done

# Create .env files with correct environment variables
echo "Setting up environment variables..."

# MongoDB backend .env
cat > mongodb_be/.env << EOL
PORT=5001
MONGODB_URI=mongodb+srv://udit:udit00712345678@cluster0.tnfs0tz.mongodb.net/uditdb
JWT_SECRET=your_jwt_secret_key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=yashs3324@gmail.com
EMAIL_PASS=avhszmzkkkfqjtwa
EMAIL_FROM=yashs3324@gmail.com
CLIENT_URL=http://localhost:3000
EOL

# Next.js frontend .env
cat > udit-assignment/.env << EOL
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres?schema=public

# API URL Configuration
NEXT_PUBLIC_MONGODB_BE_URL=http://localhost:5001
MONGODB_BE_URL=http://localhost:5001

# Build Configuration
PRISMA_HIDE_UPDATE_MESSAGE=true
SKIP_ENV_VALIDATION=true

# Email Configuration
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=yashs3324@gmail.com
EMAIL_SERVER_PASSWORD=avhszmzkkkfqjtwa
EMAIL_FROM=yashs3324@gmail.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOL

# Generate Prisma client for MongoDB backend
echo "Generating Prisma client for MongoDB backend..."
cd mongodb_be
npx prisma generate
cd ..

# Start MongoDB backend in one terminal
echo "Starting MongoDB backend on http://localhost:5001..."
cd mongodb_be
npm run dev &
MONGODB_BE_PID=$!
cd ..

# Wait for MongoDB backend to start
echo "Waiting for MongoDB backend to start..."
MAX_RETRIES=30
RETRY_COUNT=0
until curl -s http://localhost:5001/api/health >/dev/null 2>&1 || [ $RETRY_COUNT -ge $MAX_RETRIES ]; do
  echo "MongoDB backend is not ready yet, waiting 5 seconds... (Attempt $((RETRY_COUNT+1))/$MAX_RETRIES)"
  sleep 5
  RETRY_COUNT=$((RETRY_COUNT+1))
done

if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
  echo "Warning: Could not verify MongoDB backend health endpoint, but continuing anyway..."
else
  echo "MongoDB backend is now ready!"
fi

# Start Next.js frontend in another terminal
echo "Starting Next.js frontend on http://localhost:3000..."
cd udit-assignment
npm run dev &
NEXTJS_PID=$!
cd ..

echo ""
echo "===== ENVIRONMENT RUNNING ====="
echo "MongoDB: MongoDB Atlas (cloud)"
echo "PostgreSQL: postgresql://postgres:postgres@localhost:5432/postgres"
echo "MongoDB Backend API: http://localhost:5001"
echo "Next.js Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services..."

# Disable the EXIT trap to avoid double cleanup
trap - EXIT

# Function to cleanup on exit
cleanup_final() {
  echo "Shutting down services..."
  kill $MONGODB_BE_PID $NEXTJS_PID 2>/dev/null || true
  docker-compose -f docker-compose-hybrid.yml down
  echo "All services stopped."
  exit 0
}

# Set up trap to catch Ctrl+C
trap cleanup_final INT TERM

# Wait for any process to exit
wait 