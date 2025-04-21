# Udit Assignment

This project consists of a Next.js frontend and a MongoDB backend with a Docker setup for easy development and deployment.

## Setup Instructions

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)

### Quick Start

To run the entire application (MongoDB, MongoDB backend, and Next.js frontend) in Docker:

```bash
# Make scripts executable if needed
chmod +x setup.sh run-all.sh stop-all.sh view-db.sh

# Run everything in Docker
./run-all.sh
```

By default, this will:
- Start MongoDB on port 27017
- Start the MongoDB backend on port 5001
- Start the Next.js frontend on port 3000

### Hybrid Setup (Databases in Docker, Apps with npm)

For development, you can run the databases in Docker while running the backend and frontend directly with npm:

```bash
# Make scripts executable if needed
chmod +x run-hybrid.sh stop-hybrid.sh

# Run hybrid setup
./run-hybrid.sh
```

This will:
- Start MongoDB and PostgreSQL in Docker
- Run the MongoDB backend with npm run dev on port 5001
- Run the Next.js frontend with npm run dev on port 3000

To stop the hybrid setup:
```bash
./stop-hybrid.sh
```

### Available Scripts

- `setup.sh`: Sets up the MongoDB backend only (for development)
- `run-all.sh`: Runs MongoDB, MongoDB backend, and Next.js frontend in Docker
- `stop-all.sh`: Stops all Docker containers
- `view-db.sh`: Script to view database contents

#### run-all.sh Options

```bash
./run-all.sh [OPTIONS]
```

Options:
- `--rebuild`: Rebuild containers before starting
- `--force-rebuild`: Force rebuild from scratch (--no-cache)
- `--attached`: Run in attached mode (not detached)
- `--no-logs`: Don't follow logs after starting
- `--help`: Show help message

#### view-db.sh Options

```bash
./view-db.sh [sql|nosql|prisma-nosql]
```

Options:
- `sql`: Start Prisma Studio to view SQL database
- `nosql`: Connect to MongoDB shell to view NoSQL database
- `prisma-nosql`: Start Prisma Studio to view MongoDB data

## Accessing the Application

- Frontend: http://localhost:3000
- MongoDB Backend API: http://localhost:5001
- MongoDB: mongodb://localhost:27017

## Application Structure

- `udit-assignment/`: Next.js frontend
- `mongodb_be/`: MongoDB backend 
- `docker-compose.yml`: Docker Compose for MongoDB and MongoDB backend only
- `docker-compose-full.yml`: Docker Compose for MongoDB, MongoDB backend, and Next.js frontend 