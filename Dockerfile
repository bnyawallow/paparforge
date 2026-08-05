# Stage 1: Build stage
FROM node:20-slim AS builder

# Install C++ build tools required for native modules (e.g., better-sqlite3)
RUN apt-get update && apt-get install -y python3 make g++ --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package manifests and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build application
COPY . .
RUN npm run build

# Stage 2: Production runtime
FROM node:20-slim AS runner

ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

# Copy package manifests
COPY package*.json ./

# Install production dependencies only (building native C++ bindings if needed)
RUN apt-get update && apt-get install -y python3 make g++ --no-install-recommends \
    && npm ci --only=production \
    && apt-get purge -y python3 make g++ \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

# Copy compiled assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/index.html ./index.html

# Ensure directories exist for persistent database and published WebAR scenes
RUN mkdir -p /app/dist/papar /app/data

EXPOSE 3000

# Health check to ensure Express server responds
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => res.statusCode === 200 ? process.exit(0) : process.exit(1))"

CMD ["node", "dist/server.cjs"]
