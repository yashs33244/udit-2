#!/bin/bash

echo "Initializing databases..."

# Function to wait for PostgreSQL
wait_for_postgres() {
  echo "Waiting for PostgreSQL to be ready..."
  until docker exec postgres pg_isready -h localhost -p 5432 -U postgres > /dev/null 2>&1; do
    echo "PostgreSQL is not available yet, retrying in 5 seconds..."
    sleep 5
  done
  echo "PostgreSQL is now ready!"
}

# Function to initialize MongoDB replica set
init_mongodb_replicaset() {
  echo "Initializing MongoDB replica set..."
  
  # Simple script to initialize replica set
  docker exec mongodb mongosh --eval '
    rs.status().ok || rs.initiate({
      _id: "rs0",
      members: [{ _id: 0, host: "localhost:27017" }]
    })
  '
  
  # Wait for replica set to be ready
  echo "Waiting for MongoDB replica set to be ready..."
  until docker exec mongodb mongosh --quiet --eval 'rs.status().ok' | grep -q "true"; do
    echo "MongoDB replica set not ready yet, retrying in 5 seconds..."
    sleep 5
  done
  echo "MongoDB replica set is now ready!"
}

# 1. Wait for services to start
echo "Waiting for all services to be running..."
until [ "$(docker ps -q -f name=postgres)" ] && [ "$(docker ps -q -f name=mongodb)" ]; do
  echo "Waiting for database containers to start..."
  sleep 5
done

# 2. Wait for PostgreSQL to be ready
wait_for_postgres

# 3. Initialize MongoDB replica set
init_mongodb_replicaset

# 4. Run Prisma migrations for Next.js frontend
echo "Running Prisma migrations for PostgreSQL database..."
docker exec nextjs-app npx prisma db push --schema=/app/prisma/schema.prisma --accept-data-loss

# 5. Check databases
echo "PostgreSQL tables:"
docker exec postgres psql -U postgres -d postgres -c "\dt public.*"

echo "MongoDB collections in uditdb:"
docker exec mongodb mongosh --quiet uditdb --eval "show collections"

echo "Database initialization completed successfully!" 