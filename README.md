# MAKU Digital Cooperative Platform

**Client:** Merti Animal Key Users (MAKU), Merti, Isiolo County, Kenya  
**Built by:** Trends CORE Solutions

---

## Structure

```
maku-platform/
├── apps/
│   ├── api/          NestJS REST API          → api.maku.trendscore.co.ke
│   ├── web-app/      React + PWA mgmt system  → app.maku.trendscore.co.ke
│   └── web-public/   React public website     → maku.trendscore.co.ke
├── packages/
│   ├── shared-types/ TypeScript types (shared)
│   ├── ui/           Shared UI components
│   └── utils/        Shared utility functions
└── infra/
    ├── nginx/        Nginx config (4 subdomains)
    ├── postgres/     DB init SQL
    └── scripts/      deploy.sh, backup.sh, init-letsencrypt.sh
```

---

## Prerequisites

- Node.js 20+
- pnpm 12+ — install: `npm install -g pnpm`
- Docker Desktop (for local Postgres, Redis, MinIO)

---

## Quick Start (Development)

### 1. Install dependencies
```bash
pnpm install
# If prompted about build scripts:
pnpm approve-builds @nestjs/core bcrypt esbuild
```

### 2. Set up environment variables
```bash
cp apps/api/.env.example apps/api/.env
cp apps/web-app/.env.example apps/web-app/.env.local
cp apps/web-public/.env.example apps/web-public/.env.local
# Edit each file with your local values
```

### 3. Start infrastructure (Postgres, Redis, MinIO)
```bash
docker compose up -d postgres redis minio
```

### 4. Start the API
```bash
pnpm dev:api
# Runs on http://localhost:3000
# Swagger docs: http://localhost:3000/api/docs
```

### 5. Start the web apps
```bash
# In separate terminals:
pnpm dev:app      # Management app → http://localhost:5174
pnpm dev:public   # Public site    → http://localhost:5173
```

---

## Typecheck
```bash
# Each app directory:
cd apps/api      && tsc --noEmit
cd apps/web-app  && tsc --noEmit
cd apps/web-public && tsc --noEmit
```

---

## Production Deploy

Pushes to `main` build the web bundles and API image in GitHub Actions, then
transfer them over the existing passwordless SSH deployment key. On the first
server deployment, MAKU generates protected database, Redis, MinIO, and JWT
secrets, initializes the empty database schema once, and requests a Let's
Encrypt certificate for `maku.trendscore.co.ke` and
`app.maku.trendscore.co.ke`. The existing host Nginx serves both sites and
proxies `/v1` to the API.

The GitHub repository needs Actions secrets `DEPLOY_HOST`, `DEPLOY_USER`, and
`DEPLOY_SSH_KEY`. Production `.env` files stay on the server and are excluded
from source sync.

### Automated backups (add to cron on VPS)
```bash
0 2 * * * /path/to/maku/infra/scripts/backup.sh
```

---

## Module Build Order (Phases)

| Phase | Modules | Status |
|-------|---------|--------|
| 1 | Auth (M01), Members (M02), Audit (M25), PWA (M29) | 🔨 In progress |
| 2 | CIGs, Roles, Livestock, Water Vouchers, Dashboard | ⬜ Next |
| 3 | Finance, Commodities, Documents, Communications | ⬜ Planned |
| 4 | NGOs, Grants, Projects, Public Website | ⬜ Planned |
| 5 | React Native Mobile App | ⬜ Planned |
