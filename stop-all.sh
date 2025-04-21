#!/bin/bash

echo "Stopping all services..."
docker-compose -f docker-compose-full.yml down

echo "Services stopped successfully!" 