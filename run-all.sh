#!/bin/bash

# Set default options
REBUILD=false
FORCE_REBUILD=false
DETACHED=true
SHOW_LOGS=true

# Parse command line options
while [[ $# -gt 0 ]]; do
  case $1 in
    --rebuild)
      REBUILD=true
      shift
      ;;
    --force-rebuild)
      FORCE_REBUILD=true
      shift
      ;;
    --attached)
      DETACHED=false
      shift
      ;;
    --no-logs)
      SHOW_LOGS=false
      shift
      ;;
    --help)
      echo "Usage: $0 [OPTIONS]"
      echo "Options:"
      echo "  --rebuild        Rebuild containers before starting"
      echo "  --force-rebuild  Force rebuild from scratch (--no-cache)"
      echo "  --attached       Run in attached mode (not detached)"
      echo "  --no-logs        Don't follow logs after starting"
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

# Stop any running containers
echo "Stopping any running containers..."
docker-compose -f docker-compose-full.yml down

# Clean Docker environment if force rebuilding
if $FORCE_REBUILD; then
  echo "Cleaning Docker environment..."
  docker system prune -f
fi

# Check if the Docker images already exist
MONGODB_BE_IMAGE_EXISTS=$(docker images -q udit-new-mongodb_be 2> /dev/null)
NEXTJS_IMAGE_EXISTS=$(docker images -q udit-new-nextjs-app 2> /dev/null)

# If rebuild flag is set or images don't exist, build the images
if $FORCE_REBUILD; then
  echo "Forcing rebuild of all containers from scratch..."
  BUILD_CMD="docker-compose -f docker-compose-full.yml build --no-cache --progress=plain"
  eval $BUILD_CMD
elif $REBUILD || [ -z "$MONGODB_BE_IMAGE_EXISTS" ] || [ -z "$NEXTJS_IMAGE_EXISTS" ]; then
  echo "Building containers..."
  BUILD_CMD="docker-compose -f docker-compose-full.yml build"
  eval $BUILD_CMD
else
  echo "Using existing container images..."
fi

# Start the containers
echo "Starting all services..."
if $DETACHED; then
  docker-compose -f docker-compose-full.yml up -d
else
  docker-compose -f docker-compose-full.yml up
  exit 0
fi

# Wait for the services to be ready
echo "Waiting for services to start..."
sleep 10

# Check if all containers are running
MONGODB_RUNNING=$(docker ps | grep mongodb | wc -l)
MONGODB_BE_RUNNING=$(docker ps | grep mongodb_be | wc -l)
NEXTJS_RUNNING=$(docker ps | grep nextjs-app | wc -l)

# Print service status
echo "Service status:"
echo "MongoDB: $([ $MONGODB_RUNNING -gt 0 ] && echo 'Running' || echo 'Failed')"
echo "MongoDB Backend: $([ $MONGODB_BE_RUNNING -gt 0 ] && echo 'Running' || echo 'Failed')"
echo "Next.js Frontend: $([ $NEXTJS_RUNNING -gt 0 ] && echo 'Running' || echo 'Failed')"

# Check if all services are running
if [ $MONGODB_RUNNING -gt 0 ] && [ $MONGODB_BE_RUNNING -gt 0 ] && [ $NEXTJS_RUNNING -gt 0 ]; then
  echo "All services are running successfully!"
  echo "MongoDB: mongodb://localhost:27017"
  echo "MongoDB Backend: http://localhost:5001"
  echo "Next.js Frontend: http://localhost:3000"
else
  echo "Some services failed to start. Please check the logs."
  docker-compose -f docker-compose-full.yml logs
  exit 1
fi

# Show logs if requested
if $SHOW_LOGS; then
  echo "Following logs (press Ctrl+C to stop)..."
  docker-compose -f docker-compose-full.yml logs -f
fi 