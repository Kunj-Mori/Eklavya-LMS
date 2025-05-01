# Build stage
FROM node:20-alpine AS builder

# Install dependencies including OpenSSL
RUN apk add --no-cache libc6-compat openssl openssl-dev

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy prisma schema
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install production dependencies only
COPY --from=builder /app/package.json /app/package-lock.json ./
RUN npm ci --only=production

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Copy necessary config files
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/postcss.config.mjs ./
COPY --from=builder /app/tailwind.config.ts ./

# Generate Prisma Client in production
RUN npx prisma generate

# Expose port 3000
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Start the application
CMD ["npm", "start"]
