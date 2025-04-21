FROM node:18-alpine

WORKDIR /app

# Install OpenSSL for Prisma 
RUN apk add --no-cache openssl openssl-dev libc6-compat

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of the code
COPY . .

# Build the application
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"] 