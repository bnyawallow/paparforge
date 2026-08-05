# Hostinger VPS & GitHub Actions Deployment Guide

This repository includes a highly optimized multi-stage **Dockerfile**, **Docker Compose** configuration, and an automated **GitHub Actions** CI/CD pipeline to build your app and push it directly to GitHub Container Registry (`ghcr.io`). You can then run and pull the updated image directly on your **Hostinger VPS**.

---

## 📁 Included Files Overview

1. **`Dockerfile`**: Multi-stage Docker build optimized for Node 20. It builds the client assets, keeps production dependencies lean, and serves via Express.
2. **`docker-compose.yml`**: Defines the application container service using the image `ghcr.io/bnyawallow/paparforge:main`, mapping persistent volumes and configured with labels for Traefik routing.
3. **`.dockerignore`**: Excludes `node_modules`, build outputs, and sensitive files from Docker contexts.
4. **`.github/workflows/deploy.yml`**: GitHub Actions workflow that automatically builds and pushes the updated Docker image to `ghcr.io/bnyawallow/paparforge:main` upon code pushes to `main`/`master` branches.

---

## 🚀 Setup & Automated Image Building

1. Push your repository to GitHub.
2. The GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically trigger on any push to `main` or `master` branches, building your Docker image and pushing it to **GHCR** as `ghcr.io/bnyawallow/paparforge:main`.

---

## 🖥️ Deploying on your Hostinger VPS

Since you have **Traefik** configured, you can deploy the app easily by setting up `docker-compose.yml` on your VPS.

### 1. Set Up Files on VPS
Create a directory for your project (e.g., `~/papar-studio`) on your Hostinger VPS, and copy the `docker-compose.yml` there:

```yaml
name: papar-studio

services:
  papar-studio:
    image: ghcr.io/bnyawallow/paparforge:main
    container_name: papar-studio
    restart: unless-stopped
    volumes:
      - ./papar_data:/app/papar_data
    env_file:
      - .env
    labels:
      - traefik.enable=true
      - traefik.http.routers.paparstudio.rule=Host(`paparstudio.creativefringe.digital`)
      - traefik.http.routers.paparstudio.entrypoints=websecure
      - traefik.http.routers.paparstudio.tls.certresolver=letsencrypt
      - traefik.http.services.paparstudio.loadbalancer.server.port=3000
```

### 2. Configure Environment Variables
Create a `.env` file next to your `docker-compose.yml` file on your VPS containing your production keys:

```env
PORT=3000
NODE_ENV=production
GEMINI_API_KEY=your_gemini_api_key_here
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Deploy/Update the Container

Run the following commands on your Hostinger VPS to authenticate with GHCR, pull the fresh image built by GitHub Actions, and launch the service:

```bash
# Login to GHCR (uses your GitHub username and Personal Access Token with write/read packages permission)
docker login ghcr.io

# Pull the latest main image
docker compose pull

# Start/Recreate the container in background mode
docker compose up -d --remove-orphans
```

