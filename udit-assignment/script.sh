#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting SQL vs NoSQL Demo Application...${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    cat > .env << EOL
# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=sqlnosqldemo

# MongoDB
MONGO_INITDB_ROOT_USERNAME=mongodb
MONGO_INITDB_ROOT_PASSWORD=mongodb
MONGO_INITDB_DATABASE=sqlnosqldemo

# Prisma
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/sqlnosqldemo
MONGODB_URL=mongodb://mongodb:mongodb@mongodb:27017/sqlnosqldemo?authSource=admin

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email (for production)
# EMAIL_SERVER_HOST=smtp.example.com
# EMAIL_SERVER_PORT=587
# EMAIL_SERVER_USER=user
# EMAIL_SERVER_PASSWORD=password
# EMAIL_FROM=noreply@example.com
EOL
    echo -e "${GREEN}.env file created successfully.${NC}"
fi

# Start Docker Compose
echo -e "${YELLOW}Starting Docker Compose...${NC}"
docker-compose up -d

# Wait for databases to be ready
echo -e "${YELLOW}Waiting for databases to be ready...${NC}"
sleep 10

# Run Prisma migrations
echo -e "${YELLOW}Running Prisma migrations...${NC}"
docker-compose exec app npx prisma migrate dev --name init

echo -e "${GREEN}Application is now running!${NC}"
echo -e "${GREEN}Access the application at: http://localhost:3000${NC}"
echo -e "${YELLOW}To stop the application, run: docker-compose down${NC}"
