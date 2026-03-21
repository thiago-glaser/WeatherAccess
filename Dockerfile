# Build stage
FROM node:20-alpine AS builder

# Install dependencies required for node-gyp (if any)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Build Next.js application
RUN npm run build

# Production stage
FROM node:20-slim AS runner

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production

# Copy built application from builder
# Next.js standalone build is preferred for production Docker images
# But we'll follow the pattern from travelaccess for consistency if possible
# TravelAccess copies .next, node_modules, public, etc.
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public
# WeatherAccess doesn't have a server.js, so we'll use next start
# or we can create a simple server.js if needed for consistency.
# For now, let's use next start.

# Generate self-signed certificate for HTTPS (for standalone mode)
RUN mkdir -p /app/certs && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /app/certs/server.key -out /app/certs/server.crt \
    -subj "/C=US/ST=State/L=City/O=WeatherAccess/CN=localhost"

# Create non-root user
RUN groupadd -g 1001 nodejs && \
    useradd -u 1001 -g nodejs -s /bin/bash -m nextjs

# Change ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
EXPOSE 443

# We'll use a simple start script or just next start
CMD ["npx", "next", "start", "-p", "3000"]
