#!/bin/bash

echo "Checking database status..."

# Check PostgreSQL
echo -e "\n--- PostgreSQL Status ---"
if docker ps | grep -q postgres; then
  echo "PostgreSQL container is running"
  
  # Try to connect to PostgreSQL
  docker exec postgres pg_isready -h localhost -p 5432 -U postgres
  if [ $? -eq 0 ]; then
    echo "PostgreSQL is accepting connections"
    
    # Check if tables are created
    echo "Checking PostgreSQL tables:"
    docker exec postgres psql -U postgres -d postgres -c "\dt public.*"
  else
    echo "PostgreSQL is not accepting connections"
  fi
else
  echo "PostgreSQL container is not running"
fi

# Check MongoDB
echo -e "\n--- MongoDB Status ---"
if docker ps | grep -q mongodb; then
  echo "MongoDB container is running"
  
  # Try to connect to MongoDB
  docker exec mongodb mongosh --quiet --eval "db.runCommand({ ping: 1 })"
  if [ $? -eq 0 ]; then
    echo "MongoDB is accepting connections"
    
    # Check replica set status
    echo "MongoDB replica set status:"
    docker exec mongodb mongosh --quiet --eval "rs.status().ok ? 'Replica Set is active' : 'Replica Set is NOT active'"
    
    # Check databases and collections
    echo "MongoDB databases:"
    docker exec mongodb mongosh --quiet --eval "show dbs"
    
    echo "Collections in uditdb:"
    docker exec mongodb mongosh uditdb --quiet --eval "show collections"
  else
    echo "MongoDB is not accepting connections"
  fi
else
  echo "MongoDB container is not running"
fi

echo -e "\n--- Backend Services Status ---"
docker ps | grep -E "nextjs-app|mongodb_be"

echo -e "\n--- Recent Logs ---"
echo "PostgreSQL recent errors:"
docker logs postgres 2>&1 | grep -i "error" | tail -5
echo -e "\nMongoDB recent logs:"
docker logs mongodb | tail -5
echo -e "\nMongoDB Backend recent logs:"
docker logs mongodb_be | tail -5
echo -e "\nNext.js recent logs:"
docker logs nextjs-app | tail -5 