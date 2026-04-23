# Production Deployment Guide

## 1) Prerequisites

- Docker Engine + Docker Compose
- GitHub repository for CI

## 2) Environment setup

1. Duplicate `.env.prod.example` as `.env.prod`.
2. Fill strong JWT secrets and optional provider keys.

## 3) Build and run with Docker Compose

From repository root:

```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build
```

Services:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5001`
- Backend health: `http://localhost:5001/health`

## 4) Stop services

```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml down
```

## 5) CI pipeline

GitHub Actions workflow at `.github/workflows/ci.yml` runs on push and PR:

- Backend: install + build
- Frontend: install + build

## 6) Next recommended hardening

- Configure reverse proxy (Nginx/Caddy) with TLS
- Add image/container registry publish step in CI
- Add deploy job (SSH/Kubernetes/App Service)
- Add automated DB backup job for MongoDB
