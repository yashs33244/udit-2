#!/bin/bash

echo "Initializing MongoDB replica set..."

# Wait for MongoDB to be available
echo "Waiting for MongoDB to be available..."
until docker exec mongodb mongosh --quiet --eval "db.runCommand({ ping: 1 })" > /dev/null 2>&1; do
  echo "MongoDB is not available yet, waiting 2 seconds..."
  sleep 2
done

echo "MongoDB is available, initializing replica set..."

# Initialize replica set
docker exec mongodb mongosh --eval '
  rs.status().code === 94 && rs.initiate({
    _id: "rs0",
    members: [{ _id: 0, host: "localhost:27017" }]
  })
'

# Wait for replica set to initialize
echo "Waiting for replica set to become primary..."
until docker exec mongodb mongosh --quiet --eval "rs.isMaster().ismaster" | grep -q "true"; do
  echo "Waiting for replica set to become primary..."
  sleep 2
done

echo "MongoDB replica set initialized successfully!" 