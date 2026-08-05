# Hostinger VPS & GitHub Actions Deployment Guide

This repository includes a multi-stage **Dockerfile**, **Docker Compose** setup, and an automated **GitHub Actions** CI/CD pipeline to deploy the application to your **Hostinger VPS**.

---

## 📁 Included Files Overview

1. **`Dockerfile`**: Multi-stage Docker build optimized for Node 20 with C++ compilation support for native modules (such as `better-sqlite3`).
2. **`docker-compose.yml`**: Defines the application container service with persistent volume mappings for published WebAR HTML scenes (`ar_papar_data`) and SQLite data (`ar_sqlite_data`).
3. **`.dockerignore`**: Excludes `node_modules`, build outputs, and sensitive files from Docker contexts.
4. **`.github/workflows/deploy.yml`**: GitHub Actions workflow that automatically builds the Docker image, pushes it to GitHub Container Registry (`ghcr.io`), connects via SSH to your Hostinger VPS, and deploys/restarts the application seamlessly.

---

## 🔑 Step 1: Configure GitHub Repository Secrets

In your GitHub Repository, navigate to **Settings** > **Secrets and variables** > **Actions**, and add the following repository secrets:

| Secret Name | Description / Example Value |
| :--- | :--- |
| `HOSTINGER_HOST` | Your Hostinger VPS IP address (e.g., `185.185.185.185` or domain name) |
| `HOSTINGER_USER` | SSH Username (e.g., `root` or custom sudo user) |
| `HOSTINGER_SSH_KEY` | Private SSH Key contents (PEM format) with access to your VPS |
| `HOSTINGER_SSH_PORT` | *(Optional)* Custom SSH Port (default: `22`) |
| `GEMINI_API_KEY` | *(Optional)* Your Google Gemini API Key |
| `APP_URL` | Your live production domain URL (e.g., `https://ar.yourdomain.com`) |
| `VITE_SUPABASE_URL` | *(Optional)* Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | *(Optional)* Your Supabase anonymous public key |
| `JWT_SECRET` | Secret key used for signing authentication JWT tokens |

---

## 🖥️ Step 2: One-Time Hostinger VPS Setup

1. **SSH into your Hostinger VPS**:
   ```bash
   ssh root@<YOUR_HOSTINGER_VPS_IP>
   ```

2. **Install Docker and Docker Compose** (if not already installed):
   ```bash
   # Update package index and install curl
   apt-get update && apt-get install -y curl

   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh

   # Enable and start Docker service
   systemctl enable --now docker
   ```

3. **(Recommended) Setup Nginx Reverse Proxy with SSL (Let's Encrypt)**:
   
   Install Nginx and Certbot:
   ```bash
   apt-get install -y nginx certbot python3-certbot-nginx
   ```

   Create an Nginx configuration file for your site at `/etc/nginx/sites-available/ar-forge`:
   ```nginx
   server {
       server_name ar.yourdomain.com; # Replace with your actual domain

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
           client_max_body_size 50M;
       }
   }
   ```

   Enable the site and obtain a free SSL certificate:
   ```bash
   ln -s /etc/nginx/sites-available/ar-forge /etc/nginx/sites-enabled/
   nginx -t
   systemctl reload nginx

   # Obtain SSL certificate
   certbot --nginx -d ar.yourdomain.com
   ```

---

## 🚀 Step 3: Trigger Deployment

Simply push your code to the `main` or `master` branch:

```bash
git add .
git commit -m "Configure Docker & Hostinger VPS deployment"
git push origin main
```

The **GitHub Actions pipeline** will automatically trigger, build the Docker image, push it to GHCR, and execute the SSH deployment commands on your Hostinger VPS.

---

## 🛠️ Manual Deployment (Without GitHub Actions)

If you prefer to deploy manually directly on your VPS:

```bash
# Clone the repository on your VPS
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git ~/ar-forge
cd ~/ar-forge

# Create a .env file
cp .env.example .env
# Edit .env with your production values

# Build and start containers
docker compose up -d --build
```
