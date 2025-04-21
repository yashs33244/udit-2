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

# Start MongoDB shell for local database
view_mongodb_local() {
  echo "Connecting to local MongoDB shell..."
  
  # Try connecting to MongoDB with docker exec
  if docker ps | grep -q mongodb; then
    echo "MongoDB collections:"
    docker exec -it mongodb mongosh --eval "db = db.getSiblingDB('uditdb'); db.getCollectionNames().forEach(c => print(c))"
    
    echo -e "\nEntering MongoDB shell (type 'exit' to quit):"
    docker exec -it mongodb mongosh uditdb
  else
    echo "Local MongoDB container is not running. Make sure to run setup.sh first."
    exit 1
  fi
}

# Connect to remote MongoDB Atlas
view_mongodb_remote() {
  # Read MongoDB URI from the environment file
  if [ -f "mongodb_be/.env" ]; then
    # Extract MongoDB URI from the .env file
    MONGODB_URI=$(grep "MONGODB_URI" mongodb_be/.env | cut -d'=' -f2-)
    
    if [ -z "$MONGODB_URI" ]; then
      echo "Error: Could not find MONGODB_URI in the .env file."
      exit 1
    fi
    
    # Check if mongosh is installed
    if command_exists mongosh; then
      echo "Connecting to remote MongoDB Atlas..."
      
      # Extract database name from the URI
      DB_NAME=$(echo "$MONGODB_URI" | sed -E 's/.*\/([^?]+)(\?.*)?$/\1/')
      if [ -z "$DB_NAME" ]; then
        DB_NAME="uditdb"  # Default database name if not found in URI
      fi
      
      echo "MongoDB collections in database '$DB_NAME':"
      mongosh "$MONGODB_URI" --eval "db.getCollectionNames().forEach(c => print(c))"
      
      echo -e "\nEntering MongoDB shell (type 'exit' to quit):"
      mongosh "$MONGODB_URI"
    else
      echo "MongoDB shell (mongosh) is not installed."
      echo "Please install MongoDB tools first:"
      echo "  For Mac: brew install mongodb-database-tools mongodb-community"
      echo "  For Ubuntu: sudo apt install mongodb-clients"
      exit 1
    fi
  else
    echo "Error: .env file not found in mongodb_be directory."
    exit 1
  fi
}

# Main script
if [ "$1" == "sql" ]; then
  start_prisma_studio
elif [ "$1" == "nosql-local" ]; then
  view_mongodb_local
elif [ "$1" == "nosql-remote" ]; then
  view_mongodb_remote
elif [ "$1" == "nosql" ]; then
  # Auto-detect if we should use remote or local
  if grep -q "mongodb+srv://" mongodb_be/.env; then
    view_mongodb_remote
  else
    view_mongodb_local
  fi
elif [ "$1" == "prisma-nosql" ]; then
  start_prisma_mongodb
else
  echo "Usage: ./view-db.sh [sql|nosql|nosql-local|nosql-remote|prisma-nosql]"
  echo "  sql          - Start Prisma Studio to view SQL database"
  echo "  nosql        - Connect to MongoDB shell (auto-detects local or remote)"
  echo "  nosql-local  - Connect to local MongoDB shell"
  echo "  nosql-remote - Connect to remote MongoDB Atlas"
  echo "  prisma-nosql - Start Prisma Studio to view MongoDB data"
fi 