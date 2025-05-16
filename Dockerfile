# Multi-stage build for optimized production container

# Build stage for frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Build stage for backend
FROM node:18-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production

# Final production image
FROM node:18-alpine
WORKDIR /app

# Install necessary system tools
RUN apk --no-cache add curl

# Copy frontend build files
COPY --from=frontend-build /app/build ./build

# Setup backend
WORKDIR /app/backend
COPY --from=backend-build /app/backend/node_modules ./node_modules
COPY backend .

# Add health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:${PORT:-5002}/api/health || exit 1

# Set production environment
ENV NODE_ENV=production

# Expose port
EXPOSE ${PORT:-5002}

# Optimize node.js for production
ENV NODE_OPTIONS="--max-old-space-size=512 --max-http-header-size=16384"

# Runtime user for security
USER node

# Command to run
CMD ["node", "server.js"]