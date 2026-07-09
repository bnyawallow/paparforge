# ==========================================
# STAGE 1: Builder
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies) to compile the app
RUN npm ci || npm install

# Copy configuration and source files
COPY . .

# Set build-time arguments for Vite client-side configuration
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# Run the full-stack build pipeline:
# 1. 'vite build' -> builds the client static bundle into dist/
# 2. 'esbuild server.ts' -> bundles backend code into dist/server.cjs
RUN npm run build

# ==========================================
# STAGE 2: Production Runner
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

# Standard production environment flags
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
ENV PAPAR_DIR=/app/papar_data

# Copy package manifests to install production dependencies
COPY package.json package-lock.json* ./

# Install only production-grade runtime dependencies
RUN npm ci --omit=dev || npm install --omit=dev

# Copy only the compiled outputs from the builder stage
COPY --from=builder /app/dist ./dist

# Ensure the persistent directory exists for published WebAR pages
RUN mkdir -p /app/papar_data

# Expose the web-facing port
EXPOSE 3000

# Run the pre-compiled server entry point directly with Node
CMD ["node", "dist/server.cjs"]
