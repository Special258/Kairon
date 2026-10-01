# Kairon — Production Deployment Guide & Readiness Playbook

This document details the complete deployment procedure, environment configuration, container orchestration, and verification steps for taking **Kairon** to production.

---

## 1. Pre-Deployment Verification Status

All critical pre-flight checks have been automated and validated:

| Verification Item | Scope | Status | Notes |
|---|---|---|---|
| **Automated Test Suite** | Backend | **100% PASSED** (10/10) | Verified health, inference, explainability, rate limiting, and sanitization |
| **Production Build** | Frontend | **100% PASSED** | `tsc && vite build` bundled cleanly in under 22s |
| **Zero-Knowledge E2EE** | Client-Side | **ACTIVE** | `AES-256-GCM` + `PBKDF2-HMAC-SHA256` zero-knowledge browser cipher |
| **Progressive Web App (PWA)** | Mobile/Desktop | **CONFIGURED** | Offline Service Worker (`sw.js`), manifest, vector icons, touch navigation |
| **Containerization** | Full Stack | **READY** | Multi-stage frontend Nginx Dockerfile + non-root Python backend Dockerfile |
| **Security Posture** | Network/API | **HARDENED** | HSTS, CSP, X-Frame-Options: DENY, X-Content-Type: nosniff, 120 req/min rate limit |

---

## 2. Deployment Architecture Options

### Option A: Unified Container Orchestration (Docker Compose)
Best for: VPS (DigitalOcean, Linode, AWS EC2, Hetzner, GCP Compute Engine).

The project includes a root [`docker-compose.yml`](./docker-compose.yml) orchestrating the services over an isolated bridge network with health-dependent startup.

#### 1. Configure Production Environment
Create `.env` in the project root:
```env
SUPABASE_URL=https://your-project-ref.supabase.co
ALLOWED_ORIGINS=https://app.yourdomain.com,https://yourdomain.com
```

#### 2. Launch the Stack
```bash
docker compose up -d --build
```

#### 3. Verify Running Services
```bash
docker compose ps
docker compose logs -f backend
```
- Frontend will be serving on port `80` (or reverse proxied via Traefik/Certbot/Cloudflare).
- Backend ML API will be accessible on port `8000`.

---

### Option B: Cloud Split Deployment (Recommended for Serverless/SaaS)

#### 1. Backend ML API (Render / Fly.io / Railway / Cloud Run)
- **Repository Root Directory**: `backend`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 2`
- **Health Check Path**: `/api/health`
- **Environment Variables**:
  | Variable | Value / Description |
  |---|---|
  | `SUPABASE_URL` | `https://<your-project>.supabase.co` |
  | `ALLOWED_ORIGINS` | `https://your-frontend-domain.vercel.app` |
  | `ALLOW_DEV_ANONYMOUS` | `false` (enforces strict JWT validation) |
  | `PYTHON_VERSION` | `3.11.9` |

> *A pre-configured Blueprint is provided in [`render.yaml`](./render.yaml).*

#### 2. Frontend Web Application (Vercel / Netlify / Cloudflare Pages)
- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  | Variable | Value / Description |
  |---|---|
  | `VITE_AUTH_PROVIDER` | `supabase` |
  | `VITE_SUPABASE_URL` | `https://<your-project>.supabase.co` |
  | `VITE_SUPABASE_ANON_KEY` | `<your-public-anon-key>` |
  | `VITE_SUPABASE_REDIRECT_URL` | `https://your-frontend-domain.vercel.app/` |
  | `VITE_API_URL` | `https://your-backend-api.onrender.com` |

> *A pre-configured [`frontend/vercel.json`](./frontend/vercel.json) handles SPA client-side routing rewrites and security response headers.*

---

## 3. Production Security Checklist

1. **Authentication Mode**:
   Set `ALLOW_DEV_ANONYMOUS=false` on the production backend to mandate authentic Supabase RS256/ES256 JWKS tokens.
2. **CORS Whitelist**:
   Strictly restrict `ALLOWED_ORIGINS` to your production frontend URLs (do not leave wildcard `*`).
3. **SSL / TLS**:
   Enforce HTTPS on your custom domain using Cloudflare, Let's Encrypt, or your cloud provider's automatic SSL certificate.
4. **Rate Limiting**:
   The built-in sliding-window limiter enforces 120 reqs/min per client IP. Ensure your load balancer passes the true client IP via `X-Forwarded-For`.
5. **Zero-Knowledge Encryption Key**:
   Users should export their Master Encryption Key from **Settings & Security -> Export Master Key Backup (JWK)** to ensure recovery across new devices.

---

## 4. Post-Deployment Smoke Tests

Run these quick curl checks against your live production endpoints:

```bash
# 1. Check API Health & ML Pipeline Loaded
curl -f https://api.yourdomain.com/api/health

# 2. Check Security Posture & Headers
curl -I https://api.yourdomain.com/api/security/audit

# 3. Verify Model Diagnostics
curl -f https://api.yourdomain.com/api/model/metrics
```
