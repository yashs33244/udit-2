#!/bin/bash

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Start prisma studio in a new terminal window
start_prisma_studio() {
  echo "Starting Prisma Studio for SQL database..."
  cd udit-assignment
  npx prisma studio
}

# Start Prisma MongoDB Studio 
start_prisma_mongodb() {
  echo "Starting Prisma Studio for MongoDB..."
  cd mongodb_be
  npx prisma studio
}

# Start MongoDB shell
view_mongodb() {
  echo "Connecting to MongoDB shell..."
  
  # Try connecting to MongoDB with docker exec
  if docker ps | grep -q mongodb; then
    echo "MongoDB collections:"
    docker exec -it mongodb mongosh --eval "db = db.getSiblingDB('uditdb'); db.getCollectionNames().forEach(c => print(c))"
    
    echo -e "\nEntering MongoDB shell (type 'exit' to quit):"
    docker exec -it mongodb mongosh uditdb
  else
    echo "MongoDB container is not running. Make sure to run setup.sh first."
    exit 1
  fi
}

# Main script
if [ "$1" == "sql" ]; then
  start_prisma_studio
elif [ "$1" == "nosql" ]; then
  view_mongodb
elif [ "$1" == "prisma-nosql" ]; then
  start_prisma_mongodb
else
  echo "Usage: ./view-db.sh [sql|nosql|prisma-nosql]"
  echo "  sql          - Start Prisma Studio to view SQL database"
  echo "  nosql        - Connect to MongoDB shell to view NoSQL database"
  echo "  prisma-nosql - Start Prisma Studio to view MongoDB data"
fi 