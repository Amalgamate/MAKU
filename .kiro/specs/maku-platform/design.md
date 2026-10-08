# MAKU Digital Cooperative Platform — System Design

---

## 1. Architecture Overview

The platform is a **monorepo** containing three deliverables that share a common API:

```
maku-platform/
├── apps/
│   ├── web-public/   # React + TypeScript — public site (maku.trendscore.co.ke)
│   ├── web-app/      # React + TypeScript + PWA — management system (app.maku.trendscore.co.ke)
│   ├── mobile/       # React Native app (Phase 5+)
│   └── api/          # Node.js/NestJS REST API (api.maku.trendscore.co.ke)
├── packages/
│   ├── shared-types/ # TypeScript types shared across apps
│   ├── ui/           # Shared component library (used by both web apps)
│   └── utils/        # Shared utility functions
├── nginx/
│   └── conf.d/
│       └── maku.conf # All four subdomain configs
└── infra/            # Docker Compose files, Certbot, deploy scripts
```

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│                                                                 │
│   ┌───────────────────┐        ┌─────────────────────────┐     │
│   │  Web App + PWA    │        │   Mobile App (Phase 5)  │     │
│   │  React + Workbox  │        │   React Native / Expo   │     │
│   └─────────┬─────────┘        └────────────┬────────────┘     │
└─────────────┼───────────────────────────────┼──────────────────┘
              │  HTTPS/REST                   │  HTTPS/REST
┌─────────────┼───────────────────────────────┼──────────────────┐
│             ▼         API LAYER             ▼                  │
│   ┌─────────────────────────────────────────────────────┐      │
│   │              NestJS REST API                        │      │
│   │   Auth │ Members │ CIGs │ Finance │ Livestock ...   │      │
│   └──────────────────────┬──────────────────────────────┘      │
└──────────────────────────┼─────────────────────────────────────┘
                           │
┌──────────────────────────┼─────────────────────────────────────┐
│                 DATA & INTEGRATION LAYER                        │
│                          │                                      │
│   ┌──────────────────────▼──────────┐  ┌──────────────────┐   │
│   │         PostgreSQL DB           │  │  S3 File Storage │   │
│   └─────────────────────────────────┘  └──────────────────┘   │
│                                                                 │
│   External: M-Pesa │ Africa's Talking SMS │ SendGrid │ Maps    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Architecture (Web + PWA)

### 2.1 Tech Stack
- **React 18** with **TypeScript**
- **Vite** (build tool) with `vite-plugin-pwa` (Workbox under the hood)
- **React Router v6** for client-side routing
- **TanStack Query (React Query)** for server state, caching, and background sync
- **Zustand** for lightweight client-side state (auth, offline queue)
- **React Hook Form** + **Zod** for forms and validation
- **Tailwind CSS** for utility-first styling
- **Shadcn/ui** (Radix UI primitives) for accessible component primitives
- **Recharts** for dashboard charts
- **Leaflet.js** for GIS maps

### 2.2 Folder Structure (Web App)

```
apps/web/src/
├── app/                    # App shell, router, providers
├── modules/                # One folder per module
│   ├── auth/               # M01 - Login, register, forgot password
│   ├── members/            # M02 - Member register
│   ├── cigs/               # M03 - CIG management
│   ├── roles/              # M04 - Roles & permissions
│   ├── livestock/          # M05
│   ├── feedlot/            # M06
│   ├── water-vouchers/     # M07
│   ├── purchases-sales/    # M08
│   ├── finance/            # M09
│   ├── procurement/        # M10
│   ├── staff/              # M11
│   ├── suppliers/          # M12
│   ├── honey/              # M13
│   ├── conservation/       # M14
│   ├── hides-skins/        # M15
│   ├── poultry/            # M16
│   ├── bones-horns/        # M17
│   ├── dairy/              # M18
│   ├── documents/          # M19
│   ├── search/             # M20
│   ├── communications/     # M21
│   ├── ngo-partners/       # M22
│   ├── grants/             # M23
│   ├── projects/           # M24
│   ├── audit/              # M25
│   ├── dashboard/          # M26
│   ├── reports/            # M27
│   └── public-site/        # M28
├── shared/
│   ├── components/         # Global reusable UI components
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API client functions (per module)
│   ├── store/              # Zustand stores
│   └── utils/              # Helpers, formatters
└── pwa/
    ├── sw.ts               # Service worker config
    └── offline-queue.ts    # Offline action queue & sync
```

### 2.3 PWA Strategy

- **App Shell Model:** The navigation chrome, sidebar, and header are cached immediately on install.
- **Caching Strategy:**
  - Static assets: Cache First
  - API reads (member list, CIG list): Stale-While-Revalidate with 5-min TTL
  - API writes: Network First; if offline → queue in IndexedDB
- **Offline Queue:** Mutations (create/update) that fail due to no network are stored in IndexedDB via Zustand + idb-keyval. On reconnection, the queue drains in order.
- **Install Prompt:** A custom install banner is shown after the second visit, dismissable.

### 2.4 Routing Structure

```
/                         → Dashboard (requires auth)
/login                    → Login page
/register                 → Member self-registration (public)
/forgot-password          → Forgot password

/members                  → Member list
/members/new              → Add member
/members/:id              → Member profile

/cigs                     → CIG list
/cigs/:id                 → CIG detail

/livestock                → Livestock marketing
/feedlot                  → Feedlot
/water-vouchers           → Water voucher management

/finance                  → Finance overview
/finance/petty-cash       → Petty cash
/finance/procurement      → Procurement

/staff                    → Staff management
/suppliers                → Supplier register

/commodities/honey        → Honey module
/commodities/conservation → Environmental conservation
/commodities/hides        → Hides & skins
/commodities/poultry      → Poultry
/commodities/bones        → Bones & horns
/commodities/dairy        → Dairy/milk

/documents                → Document centre
/communications           → SMS & notifications
/ngos                     → NGO management
/grants                   → Grants pipeline
/projects                 → Project management

/audit                    → Audit trail (admin only)
/reports                  → Reports
/settings                 → System settings
/settings/roles           → Role management
/settings/users           → User management

/public                   → Public website (separate layout)
/public/impact            → Impact page
/public/partners          → Partner page
/public/location          → GIS/location page
/public/find-maku         → Contact/find us
```

---

## 3. Backend Architecture (API)

### 3.1 Tech Stack
- **Node.js 20 LTS** with **NestJS** framework
- **TypeORM** as the ORM, with PostgreSQL
- **Passport.js** for authentication strategies (JWT, local)
- **class-validator** + **class-transformer** for DTO validation
- **Swagger/OpenAPI** auto-generated docs at `/api/docs`
- **Bull** (Redis-backed) for background job queues (bulk SMS, report generation, file processing)
- **Winston** for structured logging

### 3.2 API Module Structure

```
apps/api/src/
├── main.ts                 # Bootstrap
├── app.module.ts           # Root module
├── modules/
│   ├── auth/               # JWT strategy, guards, auth service
│   ├── users/              # User CRUD, profile
│   ├── members/            # Member register
│   ├── cigs/               # CIG management
│   ├── roles/              # Role & permission engine
│   ├── livestock/          # Livestock marketing
│   ├── feedlot/
│   ├── water-vouchers/
│   ├── purchases-sales/
│   ├── finance/
│   ├── procurement/
│   ├── staff/
│   ├── suppliers/
│   ├── commodities/        # Shared commodity base; sub-modules per commodity
│   ├── documents/
│   ├── communications/
│   ├── ngos/
│   ├── grants/
│   ├── projects/
│   ├── audit/
│   ├── dashboard/
│   └── reports/
├── shared/
│   ├── decorators/         # @CurrentUser, @Roles, @Audit
│   ├── guards/             # JwtAuthGuard, RolesGuard
│   ├── interceptors/       # AuditInterceptor, TransformInterceptor
│   ├── pipes/              # ValidationPipe
│   └── filters/            # Global exception filter
└── config/                 # Config service (env vars)
```

### 3.3 Authentication Flow

```
Client                        API                          DB
  │                            │                            │
  │  POST /auth/login          │                            │
  │  { email, password }       │                            │
  ├──────────────────────────► │                            │
  │                            │  SELECT user WHERE email   │
  │                            ├──────────────────────────► │
  │                            │ ◄────────────────────────  │
  │                            │  bcrypt.compare(pwd, hash) │
  │                            │                            │
  │  { accessToken, refresh }  │                            │
  │ ◄──────────────────────────┤                            │
  │                            │                            │
  │  Subsequent requests:      │                            │
  │  Authorization: Bearer <t> │                            │
  ├──────────────────────────► │                            │
  │                            │  JwtAuthGuard validates    │
  │                            │  RolesGuard checks perms   │
  │  Response                  │                            │
  │ ◄──────────────────────────┤                            │
```

- **Access Token:** 15-minute expiry.
- **Refresh Token:** 7-day expiry, stored in HttpOnly cookie.
- **Refresh endpoint:** `POST /auth/refresh` — rotates the refresh token on every call.

### 3.4 Role & Permission Engine

Permissions are stored as a bitfield or as a join table (`role_permissions`). Each API endpoint is decorated with `@Roles(RoleEnum.ADMIN)` and `@Permissions(Permission.MEMBER_CREATE)`. The `RolesGuard` resolves the current user's effective permissions from their role(s) and enforces them.

### 3.5 Audit Interceptor

A global `AuditInterceptor` intercepts mutating HTTP methods (POST, PUT, PATCH, DELETE). It serialises the before/after state of the affected entity and writes an `AuditLog` record asynchronously (via a Bull queue) so it does not block the response.

---

## 4. Database Design (Key Entities — Phase 1)

### 4.1 Entity Relationship (Simplified — M01 & M02)

```
users
  id (uuid, PK)
  email (unique)
  phone
  password_hash
  full_name
  avatar_url
  status (active | pending | suspended | deactivated)
  role_id (FK → roles)
  member_id (FK → members, nullable — links staff user to member record)
  created_at
  updated_at
  last_login_at

roles
  id (uuid, PK)
  name
  description
  is_system (bool — system roles cannot be deleted)

role_permissions
  role_id (FK → roles)
  permission (varchar — e.g. 'members:create')

members
  id (uuid, PK)
  member_number (unique, e.g. MAKU-2026-0001)
  full_name
  national_id (unique)
  date_of_birth
  gender
  phone_primary
  phone_secondary
  sub_location
  village
  gps_lat
  gps_lng
  photo_url
  status (active | inactive | deceased | pending)
  registration_date
  approved_by (FK → users, nullable)
  approved_at
  share_contributions (decimal)
  cattle_count (int)
  goat_count (int)
  camel_count (int)
  sheep_count (int)
  created_at
  updated_at

member_cig_memberships
  member_id (FK → members)
  cig_id (FK → cigs)
  joined_date
  role_in_cig (member | chairperson | secretary | treasurer)
  PRIMARY KEY (member_id, cig_id)

cigs
  id (uuid, PK)
  name
  type (commodity | geography | mixed)
  registration_date
  sub_location
  chairperson_member_id (FK → members)
  secretary_member_id (FK → members)
  created_at

audit_logs
  id (uuid, PK)
  entity_type
  entity_id
  action (create | update | delete)
  previous_value (jsonb)
  new_value (jsonb)
  user_id (FK → users)
  ip_address
  user_agent
  created_at

refresh_tokens
  id (uuid, PK)
  user_id (FK → users)
  token_hash
  expires_at
  revoked_at
  created_at
```

---

## 5. Mobile App Architecture (Phase 5+)

### 5.1 Tech Stack
- **React Native** with **Expo** (managed workflow)
- **Expo Router** (file-based navigation)
- **TanStack Query** (same as web — shared query/mutation hooks via `packages/shared-types`)
- **WatermelonDB** for local SQLite database (offline-first)
- **Expo Secure Store** for token storage
- **Expo Camera** + **expo-barcode-scanner** for ID scanning
- **Expo Location** for GPS capture
- **Expo Notifications** for push notifications (via FCM / APNs)

### 5.2 Sync Architecture
- WatermelonDB handles local writes immediately.
- A background sync worker reconciles local records with the API when connectivity is available.
- Conflict resolution strategy: **server wins** for financial data; **last-write-wins** with conflict flag for member data (reviewed by admin).

---

## 6. Infrastructure

### 6.1 VPS Deployment

All environments run on a **self-managed VPS** using Docker Compose. No cloud provider lock-in.

```
┌─────────────────────────────────────────────────────────────┐
│                      Managed VPS                            │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Nginx      │  │  API (Node)  │  │  PostgreSQL 16   │  │
│  │   Reverse    │  │  Docker      │  │  Docker          │  │
│  │   Proxy +    │  │  Container   │  │  Container       │  │
│  │   SSL (HTTPS)│  │              │  │                  │  │
│  └──────────────┘  └──────┬───────┘  └──────────────────┘  │
│                            │                                │
│  ┌──────────────┐  ┌───────▼───────┐  ┌────────────────┐  │
│  │  MinIO       │  │   Redis       │  │  Static Files  │  │
│  │  (S3-compat  │  │   (Cache +    │  │  (Web/PWA via  │  │
│  │   file store)│  │    Queues)    │  │   Nginx)       │  │
│  └──────────────┘  └───────────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Key services in Docker Compose:**
- `nginx` — reverse proxy, SSL termination (Let's Encrypt via Certbot), serves the built React/PWA static files
- `api` — NestJS application container
- `postgres` — PostgreSQL 16 database
- `redis` — Cache and Bull job queues
- `minio` — S3-compatible local object storage for documents and photos (can be swapped for Cloudflare R2 or Backblaze B2 later if needed)

**Domain structure (development/testing on Trends CORE subdomain):**

| URL | Purpose |
|-----|---------|
| `maku.trendscore.co.ke` | Public-facing website (impact, partners, find MAKU, news) + member self-registration. Login button here redirects to the app. |
| `app.maku.trendscore.co.ke` | Management system — all authenticated routes (admin, staff, field officers). |
| `api.maku.trendscore.co.ke` | REST API — consumed by both the public site and the management app. |
| `files.maku.trendscore.co.ke` | MinIO file storage (documents, member photos). |

> When the client's own domain is connected, this maps cleanly to:
> `maku.coop` / `app.maku.coop` / `api.maku.coop` / `files.maku.coop`
> Only Nginx config + env vars change — zero code changes needed.

**Nginx routing:**
- `maku.trendscore.co.ke` → serves the React public site static build
- `app.maku.trendscore.co.ke` → serves the React management app static build
- `api.maku.trendscore.co.ke` → proxies to NestJS API container (internal port 3000)
- `files.maku.trendscore.co.ke` → proxies to MinIO container (internal port 9000)

**Login flow (cross-domain):**
1. User visits `maku.trendscore.co.ke` (public site)
2. Clicks "Member Login" or "Staff Login"
3. Redirected to `app.maku.trendscore.co.ke/login`
4. After auth → lands on management dashboard
5. "Back to website" link returns to `maku.trendscore.co.ke`

### 6.2 Environments
- **Development:** Local Docker Compose on developer machine (same `docker-compose.yml` with dev overrides)
- **Staging:** VPS second Docker Compose stack (different port / subdomain), seeded with anonymised data
- **Production:** VPS primary Docker Compose stack, with daily `pg_dump` backups (compressed, rotated 30 days)

### 6.3 CI/CD Pipeline (GitHub Actions → VPS)
1. Push to feature branch → lint, type-check, unit tests
2. PR to `main` → integration tests, build check
3. Merge to `main` → build Docker image, push to registry (GitHub Container Registry or self-hosted), SSH into VPS and `docker compose pull && docker compose up -d`  (staging)
4. Tag release → same pipeline targets production stack (manual approval gate via GitHub Environment protection rule)

**Deployment script on VPS (`deploy.sh`):**
```bash
docker compose pull api
docker compose up -d --no-deps api
docker compose exec api npx typeorm migration:run  # run any pending DB migrations
```

---

## 7. Security Design

- **Transport:** HTTPS everywhere; HSTS enforced.
- **Auth:** JWT access tokens (15 min) + HttpOnly refresh cookie (7 days).
- **Secrets:** Environment variables via cloud secret manager; never in code.
- **Input Validation:** All API inputs validated at DTO level via class-validator.
- **SQL Injection:** Prevented by TypeORM parameterised queries.
- **XSS:** React escapes output by default; Content-Security-Policy header enforced.
- **CSRF:** SameSite cookie attribute on refresh token; CSRF token for cookie-based operations.
- **Rate Limiting:** Login endpoint throttled to 5 attempts per 10 minutes per IP.
- **File Uploads:** MIME type validation, size limit (10 MB), virus scan (ClamAV) before storage.
- **Audit:** All mutations logged immutably (Section 7, Audit Trail).

---

## 8. UI/UX Design Principles

- **Mobile-first:** All layouts start at 320px width; tablet and desktop are progressively enhanced.
- **Low-bandwidth mode:** Images lazy-loaded; skeleton screens instead of spinners; API calls batched.
- **Offline indicators:** Persistent banner when offline; sync progress shown on reconnect.
- **Accessibility:** Keyboard navigable; ARIA labels; colour contrast ratio ≥ 4.5:1; focus visible.
- **Language:** English primary; all UI strings externalised for future Swahili translation.
- **Branding:** MAKU colour palette applied via Tailwind CSS theme tokens (to be confirmed with client).

---

## 9. API Design Conventions

- **Base URL (dev/staging):** `https://api.maku.trendscore.co.ke/v1`
- **Base URL (production):** `https://api.maku.coop/v1` (configured via env var — no code change needed)
- **CORS allowed origins:** `https://maku.trendscore.co.ke`, `https://app.maku.trendscore.co.ke` (and production equivalents via env var)
- **Auth header:** `Authorization: Bearer <access_token>`
- **Response envelope:**
  ```json
  {
    "data": { ... },
    "meta": { "page": 1, "perPage": 25, "total": 342 },
    "message": "Success"
  }
  ```
- **Error format:**
  ```json
  {
    "statusCode": 422,
    "message": "Validation failed",
    "errors": [{ "field": "email", "message": "must be a valid email" }]
  }
  ```
- **Pagination:** `?page=1&perPage=25` query params on all list endpoints.
- **Filtering:** `?status=active&gender=female` — field=value query params.
- **Sorting:** `?sortBy=created_at&sortOrder=DESC`.
- **Versioning:** URL path versioning (`/v1`, `/v2`) — breaking changes get a new version.

---

## 10. Phased Delivery Plan

### Phase 1 — Foundation (Weeks 1–6)
- Project scaffold (monorepo, CI/CD, environments)
- M01: Authentication & User Accounts
- M02: Member Register
- M25: Audit Trail
- M29: PWA Shell

### Phase 2 — Core Operations (Weeks 7–14)
- M03: CIG Management
- M04: Roles & Permissions
- M05: Livestock Marketing
- M07: Borehole & Water Vouchers
- M26: Dashboard (initial KPIs)
- M27: Reports (initial)

### Phase 3 — Finance & Commodities (Weeks 15–24)
- M06: Feedlot
- M08: Purchases & Sales
- M09: Finance & Petty Cash
- M10: Procurement
- M11: Staff & Salaries
- M12: Supplier Register
- M13–M18: All Commodity Modules
- M19: Document Centre
- M20: Smart Search
- M21: Communication

### Phase 4 — NGO, Grants & Public Site (Weeks 25–32)
- M22: NGO & Partner Management
- M23: Grants Pipeline
- M24: Project Management
- M28: Public Website

### Phase 5 — Mobile Admin App (Months 9–12)
- M30: React Native Mobile App (all core modules)
