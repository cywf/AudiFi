# =============================================================================
# AudiFi Backend API Dockerfile
# Multi-stage build for production-optimized Node.js backend
#
# Compatible with:
# - Fly.io (primary production deployment)
# - Local Docker/Docker Compose development
# =============================================================================

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production=false

# Copy source code
COPY tsconfig.json ./
COPY drizzle.config.ts ./
COPY src ./src

# Build TypeScript
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S audifi && \
    adduser -S audifi -u 1001 -G audifi

WORKDIR /app

# Copy package files and install production dependencies plus drizzle-kit for migrations
COPY package*.json ./
RUN npm ci --only=production && \
    npm install drizzle-kit && \
    npm cache clean --force

# Copy built artifacts from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle.config.ts ./

# Change ownership to non-root user
RUN chown -R audifi:audifi /app

# Switch to non-root user
USER audifi

# Expose port (default 8080 for Fly.io, configurable via PORT env)
EXPOSE 8080

# Health check (works with both /api/v1/health and default port)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/v1/health || exit 1

# Set default environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Start the server
CMD ["node", "dist/index.js"]
