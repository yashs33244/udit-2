FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install OpenSSL for Prisma and PostgreSQL client
RUN apk add --no-cache openssl libc6-compat postgresql-client

# Copy package.json and package-lock.json
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable Next.js telemetry during the build
ENV NEXT_TELEMETRY_DISABLED 1

# Temporarily ignore TypeScript errors during build
ENV NEXT_SKIP_TYPE_CHECK true

# Generate Prisma client
RUN npx prisma generate

# Apply migrations (in production, you might want to do this separately)
RUN npx prisma db push --accept-data-loss

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Install PostgreSQL client for startup script
RUN apk add --no-cache postgresql-client

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Set the correct permission for NextJS
USER nextjs

EXPOSE 3000

ENV PORT 3000

# Add a startup script to wait for database
COPY --from=builder /app/startup.sh ./
RUN chmod +x ./startup.sh

CMD ["./startup.sh"]
