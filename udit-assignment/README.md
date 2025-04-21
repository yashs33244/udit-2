# SQL vs NoSQL Database Operations Demo

This project demonstrates the differences between SQL (PostgreSQL) and NoSQL (MongoDB) databases through a user management system with email verification for account operations.

## Features

- User registration with email verification
- User login
- Account updates with email verification
- Account deletion with email verification
- Side-by-side comparison of SQL and NoSQL operations
- Docker Compose setup for easy deployment

## Technology Stack

- **Frontend**: Next.js with App Router, React, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **ORM**: Prisma (for both PostgreSQL and MongoDB)
- **Databases**: 
  - PostgreSQL (SQL)
  - MongoDB (NoSQL)
- **Containerization**: Docker & Docker Compose

## Database Comparison

The application demonstrates the differences between SQL and NoSQL databases across seven key parameters:

1. **Data Structure/Schema**: SQL uses rigid, predefined schemas while NoSQL offers flexible, schema-less design
2. **Query Language**: SQL uses standardized SQL language while NoSQL uses database-specific query methods
3. **Scalability**: SQL primarily scales vertically while NoSQL is designed for horizontal scaling
4. **ACID Compliance**: SQL is fully ACID compliant while NoSQL often sacrifices some ACID properties
5. **Performance**: SQL is optimized for complex queries while NoSQL is optimized for high throughput
6. **Flexibility**: SQL is less flexible with changes while NoSQL is highly adaptable
7. **Use Cases**: SQL is ideal for financial systems while NoSQL is better for content management and real-time analytics

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (for local development)

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/yourusername/sql-nosql-demo.git
   cd sql-nosql-demo
   \`\`\`

2. Run the setup script:
   \`\`\`bash
   chmod +x script.sh
   ./script.sh
   \`\`\`

   This script will:
   - Create a `.env` file with default values
   - Start Docker containers for the application, PostgreSQL, and MongoDB
   - Run Prisma migrations
   - Start the application

3. Access the application at http://localhost:3000

### Manual Setup

If you prefer to set up manually:

1. Create a `.env` file with the following content:
   \`\`\`
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
   \`\`\`

2. Start Docker Compose:
   \`\`\`bash
   docker-compose up -d
   \`\`\`

3. Run Prisma migrations:
   \`\`\`bash
   docker-compose exec app npx prisma migrate dev --name init
   \`\`\`

## Project Structure

\`\`\`
├── app/                  # Next.js App Router
│   ├── api/              # API routes
│   │   ├── sql/          # SQL API endpoints
│   │   └── nosql/        # NoSQL API endpoints
│   ├── sql/              # SQL UI pages
│   ├── nosql/            # NoSQL UI pages
│   └── page.tsx          # Home page
├── components/           # React components
├── lib/                  # Utility functions
├── prisma/               # Prisma schema and migrations
├── docker-compose.yml    # Docker Compose configuration
├── Dockerfile            # Docker configuration
├── script.sh             # Setup script
└── README.md             # Project documentation
\`\`\`

## Email Verification

The application simulates email verification for:
- Account creation
- Account updates
- Account deletion

In a production environment, you would configure a real email service by updating the `.env` file with your SMTP credentials.

## Development

For local development:

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Generate Prisma client:
   \`\`\`bash
   npx prisma generate
   \`\`\`

3. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## License

This project is licensed under the MIT License.
