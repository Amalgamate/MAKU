# MAKU Digital Cooperative Platform — Implementation Tasks

> Tasks are ordered by module priority. Start with Phase 1 (M01 + M02) and work progressively.
> Each task maps to a concrete file, feature, or configuration deliverable.

---

## PHASE 1 — Foundation

### T01: Project Scaffold

- [ ] T01-01: Initialise monorepo with pnpm workspaces (apps/web, apps/api, apps/mobile, packages/shared-types, packages/ui, packages/utils)
- [ ] T01-02: Configure root `tsconfig.json` with path aliases for all packages
- [ ] T01-03: Set up ESLint + Prettier across all workspaces (shared config)
- [ ] T01-04: Create `apps/api` — initialise NestJS project with TypeScript
- [ ] T01-05: Create `apps/web-public` — Vite + React + TypeScript (public-facing site at `maku.trendscore.co.ke`)
- [ ] T01-05b: Create `apps/web-app` — Vite + React + TypeScript (management system at `app.maku.trendscore.co.ke`)
- [ ] T01-05c: Configure shared `packages/ui` component library used by both web apps
- [ ] T01-06: Create `docker-compose.yml` for local development (API + PostgreSQL + Redis + MinIO)
- [ ] T01-06b: Create `docker-compose.prod.yml` override for production (Nginx + SSL + all services)
- [ ] T01-06c: Create `nginx/conf.d/maku.conf` with:
  - `maku.trendscore.co.ke` → public site static files
  - `app.maku.trendscore.co.ke` → management app static files
  - `api.maku.trendscore.co.ke` → proxy to API container
  - `files.maku.trendscore.co.ke` → proxy to MinIO container
  - SSL config (Let's Encrypt / Certbot) for all four subdomains
  - CORS headers on the API proxy block
- [ ] T01-07: Configure `.env.example` files for api and web with all required environment variables
- [ ] T01-08: Set up GitHub Actions CI pipeline: lint → type-check → test on PR
- [ ] T01-09: Set up GitHub Actions CD pipeline: staging deploy on merge to main; production on release tag
- [ ] T01-10: Configure Swagger/OpenAPI on the API at `/api/docs`

---

### T02: M01 — Authentication & User Accounts (API)

- [ ] T02-01: Create `users` table migration with all fields from design doc
- [ ] T02-02: Create `roles` and `role_permissions` table migrations
- [ ] T02-03: Create `refresh_tokens` table migration
- [ ] T02-04: Implement `UsersModule` with CRUD service and repository
- [ ] T02-05: Implement `RolesModule` — seed default system roles (Super Admin, Admin, Finance Officer, Field Officer, CIG Coordinator, Member, Viewer)
- [ ] T02-06: Implement `AuthModule` with local (email+password) Passport strategy
- [ ] T02-07: Implement JWT access token generation (15-min expiry)
- [ ] T02-08: Implement refresh token rotation with HttpOnly cookie (7-day expiry)
- [ ] T02-09: Implement `POST /auth/login` endpoint
- [ ] T02-10: Implement `POST /auth/refresh` endpoint
- [ ] T02-11: Implement `POST /auth/logout` (revoke refresh token)
- [ ] T02-12: Implement `POST /auth/forgot-password` — generate OTP, send via SMS (Africa's Talking) or email (SendGrid)
- [ ] T02-13: Implement `POST /auth/reset-password` — validate OTP, update password
- [ ] T02-14: Implement `POST /users` — admin creates user (sends welcome email/SMS)
- [ ] T02-15: Implement `GET /users` with pagination, filter by role/status
- [ ] T02-16: Implement `GET /users/:id`, `PATCH /users/:id`, `DELETE /users/:id` (soft delete)
- [ ] T02-17: Implement account status change endpoint `PATCH /users/:id/status`
- [ ] T02-18: Implement `JwtAuthGuard` and `RolesGuard` as global guards
- [ ] T02-19: Implement rate limiting on `/auth/login` (5 attempts / 10 min / IP)
- [ ] T02-20: Write unit tests for AuthService (login, token generation, refresh rotation)

---

### T03: M01 — Authentication & User Accounts (Web App)

- [ ] T03-01: Create the app shell layout (sidebar nav, top bar, content area) in `apps/web/src/app/`
- [ ] T03-02: Build `LoginPage` — email + password form with validation (React Hook Form + Zod)
- [ ] T03-03: Build `ForgotPasswordPage` — email/phone input, OTP entry, new password form
- [ ] T03-04: Build `MemberSelfRegisterPage` (public route) — registration form for members
- [ ] T03-05: Implement Zustand `authStore` — stores access token, user profile, hydrates from localStorage
- [ ] T03-06: Implement axios API client with request interceptor (attach Bearer token) and response interceptor (auto-refresh on 401)
- [ ] T03-07: Implement protected route wrapper — redirects unauthenticated users to `/login`
- [ ] T03-08: Build `UserProfilePage` — view and edit own profile, change password
- [ ] T03-09: Build `UserManagementPage` (admin) — list, create, edit, deactivate users
- [ ] T03-10: Build `RoleManagementPage` (admin) — list roles, create custom role, assign permissions
- [ ] T03-11: Ensure login page is WCAG 2.1 AA compliant (keyboard nav, ARIA, colour contrast)
- [ ] T03-12: Add "You are offline" banner using `navigator.onLine` and online/offline events

---

### T04: M02 — Member Register (API)

- [ ] T04-01: Create `members` table migration
- [ ] T04-02: Create `member_cig_memberships` join table migration
- [ ] T04-03: Implement `MembersModule` with full CRUD service
- [ ] T04-04: Implement member number auto-generation: `MAKU-YYYY-NNNN` sequence
- [ ] T04-05: Implement `POST /members` — create member (admin) or self-register (public, sets status=pending)
- [ ] T04-06: Implement `GET /members` — paginated list with search (name, member_number, national_id, phone) and filters (status, gender, cig, year)
- [ ] T04-07: Implement `GET /members/:id` — full member profile with linked activity summary
- [ ] T04-08: Implement `PATCH /members/:id` — update member fields
- [ ] T04-09: Implement `POST /members/:id/approve` — approve pending member, trigger SMS notification
- [ ] T04-10: Implement `POST /members/:id/reject` — reject with reason, trigger SMS notification
- [ ] T04-11: Implement duplicate detection: query for matching national_id or phone on create
- [ ] T04-12: Implement bulk import endpoint `POST /members/import` — accept CSV, validate, return error report, commit on confirmation
- [ ] T04-13: Implement photo upload endpoint `POST /members/:id/photo` — upload to S3, store URL
- [ ] T04-14: Implement `GET /members/export` — export filtered list to CSV
- [ ] T04-15: Write unit tests for MembersService (number generation, duplicate detection, approval flow)

---

### T05: M02 — Member Register (Web App)

- [ ] T05-01: Build `MemberListPage` — paginated table with search bar and filter panel, export button
- [ ] T05-02: Build `MemberCreatePage` — full member form with all fields, photo upload, GPS capture (browser Geolocation API)
- [ ] T05-03: Build `MemberProfilePage` — all member details, activity history tabs, edit mode
- [ ] T05-04: Build `MemberApprovalQueue` component — list of pending members with approve/reject actions
- [ ] T05-05: Build bulk import UI — CSV upload, validation error table, confirm/cancel
- [ ] T05-06: Add Leaflet map component to member profile showing GPS homestead location
- [ ] T05-07: Ensure all forms have accessible error messages and keyboard navigation

---

### T06: M25 — Audit Trail (Cross-Cutting)

- [ ] T06-01: Create `audit_logs` table migration
- [ ] T06-02: Implement `AuditModule` with append-only service
- [ ] T06-03: Create global `AuditInterceptor` — intercepts POST/PUT/PATCH/DELETE, serialises before/after, queues log write via Bull
- [ ] T06-04: Implement `GET /audit-logs` — paginated, filter by user/date/module/action (admin only)
- [ ] T06-05: Implement `GET /audit-logs/export` — CSV export
- [ ] T06-06: Build `AuditLogPage` (admin only) in web app — filterable table with detail drawer

---

### T07: M29 — PWA Shell & Offline Support

- [ ] T07-01: Install and configure `vite-plugin-pwa` with Workbox in `apps/web`
- [ ] T07-02: Create `manifest.webmanifest` with MAKU branding (name, icons, theme colour, display standalone)
- [ ] T07-03: Configure Workbox caching strategies: Cache First for assets, Stale-While-Revalidate for API GETs
- [ ] T07-04: Implement offline queue in `apps/web/src/pwa/offline-queue.ts` using IndexedDB (idb-keyval) — stores failed mutations with endpoint + payload
- [ ] T07-05: Implement sync-on-reconnect: drain queue when `navigator.onLine` becomes true
- [ ] T07-06: Create offline banner component that shows/hides based on connectivity
- [ ] T07-07: Create sync status indicator showing pending offline actions count
- [ ] T07-08: Test PWA install flow on Android Chrome and iOS Safari
- [ ] T07-09: Run Lighthouse PWA audit; achieve score ≥ 90

---

## PHASE 2 — Core Operations

### T08: M03 — CIG Management

- [ ] T08-01: Create `cigs` table migration
- [ ] T08-02: Implement `CigsModule` with CRUD API endpoints
- [ ] T08-03: Implement `GET /cigs/:id/members` — list all members of a CIG
- [ ] T08-04: Implement `POST /cigs/:id/members/:memberId` — add member to CIG
- [ ] T08-05: Implement CIG meetings sub-resource CRUD
- [ ] T08-06: Build `CigListPage`, `CigDetailPage`, `CigMeetingsTab` in web app

---

### T09: M04 — Roles, Permissions & Approval System

- [ ] T09-01: Implement custom role creation and permission assignment API
- [ ] T09-02: Implement approval workflow engine: configurable chains stored in DB
- [ ] T09-03: Implement approval notification dispatch (SMS + in-app) on each step
- [ ] T09-04: Implement delegation endpoint `POST /approvals/delegate`
- [ ] T09-05: Build approval inbox UI — pending items for current user

---

### T10: M05 — Livestock Marketing

- [ ] T10-01: Create livestock transactions table migration
- [ ] T10-02: Implement `LivestockModule` CRUD API
- [ ] T10-03: Implement M-Pesa Daraja API integration for payment confirmation webhook
- [ ] T10-04: Build `LivestockMarketingPage` — entry form, transactions list, market day summary

---

### T11: M07 — Borehole & Water Vouchers

- [ ] T11-01: Create water vouchers and borehole points table migrations
- [ ] T11-02: Implement `WaterVouchersModule` API
- [ ] T11-03: Implement voucher issuance with printable PDF generation (PDFKit or Puppeteer)
- [ ] T11-04: Build `WaterVouchersPage` — issue, track, and report on vouchers

---

### T12: M26 — Dashboard (Initial)

- [ ] T12-01: Implement `DashboardModule` API — aggregate KPI endpoints
- [ ] T12-02: Build `DashboardPage` with KPI cards (active members, transactions this month, etc.)
- [ ] T12-03: Add Recharts line chart for member growth trend
- [ ] T12-04: Add Leaflet overview map with member location clusters

---

### T13: M27 — Reports (Initial)

- [ ] T13-01: Implement report generation service with pre-built report templates
- [ ] T13-02: Implement PDF export using Puppeteer or PDFKit
- [ ] T13-03: Implement Excel export using ExcelJS
- [ ] T13-04: Build `ReportsPage` with pre-built report list and export buttons

---

## PHASE 3 — Finance & Commodities

### T14: M06 — Feedlot Management
- [ ] T14-01: Schema, API, and UI for feedlot animal intake, daily records, and sale

### T15: M08 — Purchases & Sales
- [ ] T15-01: Schema, API, and UI for cooperative purchase and sale records, invoice/receipt generation

### T16: M09 — Finance & Petty Cash
- [ ] T16-01: Chart of accounts, general ledger, petty cash float management
- [ ] T16-02: M-Pesa transaction import (CSV from M-Pesa statement)
- [ ] T16-03: Bank reconciliation UI

### T17: M10 — Procurement
- [ ] T17-01: Requisition → quotes → PO → GRN workflow with approval integration

### T18: M11 — Staff & Salaries
- [ ] T18-01: Staff register, payroll calculation, payslip PDF generation, leave management

### T19: M12 — Supplier Register
- [ ] T19-01: Supplier CRUD, purchase history, rating system

### T20: M13–M18 — Commodity Modules
- [ ] T20-01: Honey & Beekeeping — production, processing, sale
- [ ] T20-02: Environmental Conservation — activity and impact tracking
- [ ] T20-03: Hides & Skins — collection, grading, sale
- [ ] T20-04: Poultry — flock management, production, sale
- [ ] T20-05: Bones & Horns — collection and sale
- [ ] T20-06: Dairy/Milk — daily collection per member, chilling, sale

### T21: M19 — Document Centre
- [ ] T21-01: File upload to S3, tagging, versioning, role-based access
- [ ] T21-02: Document search and preview UI

### T22: M20 — Smart Search
- [ ] T22-01: Global search API endpoint — full-text search across members, transactions, documents
- [ ] T22-02: Global search UI component in top nav bar

### T23: M21 — Communication
- [ ] T23-01: Africa's Talking SMS bulk send integration
- [ ] T23-02: In-app notification bell with unread count
- [ ] T23-03: Communication log UI

---

## PHASE 4 — NGO, Grants & Public Site

### T24: M22 — NGO & Partner Management
- [ ] T24-01: NGO register CRUD, partnership tracking, partner portal view

### T25: M23 — Grants Pipeline
- [ ] T25-01: Grant opportunity tracking, proposal storage, disbursement tracking, pipeline dashboard

### T26: M24 — Project Management
- [ ] T26-01: Project CRUD, milestones, tasks, budget tracking, progress reports

### T27: M28 — Public Website
- [ ] T27-01: Create separate public layout in web app (no auth required)
- [ ] T27-02: Build `ImpactPage` — statistics, photo gallery, success stories
- [ ] T27-03: Build `PartnersPage` — partnership CTA, contact form, downloadable reports
- [ ] T27-04: Build `LocationPage` — Leaflet map with MAKU operational areas and borehole points
- [ ] T27-05: Build `FindMAKUPage` — contact details, directions, office hours
- [ ] T27-06: Build CMS for admin to update public site content (rich text editor)
- [ ] T27-07: SEO meta tags, Open Graph, sitemap.xml

---

## PHASE 5 — Mobile Admin App

### T28: M30 — React Native App Setup
- [ ] T28-01: Initialise `apps/mobile` with Expo (managed workflow), TypeScript
- [ ] T28-02: Configure Expo Router for file-based navigation
- [ ] T28-03: Set up WatermelonDB with schema mirroring core entities
- [ ] T28-04: Implement Expo Secure Store for token storage
- [ ] T28-05: Implement biometric login (Expo LocalAuthentication)
- [ ] T28-06: Configure push notifications (Expo Notifications + FCM/APNs)

### T29: M30 — Mobile Core Features
- [ ] T29-01: Login screen with biometric option
- [ ] T29-02: Dashboard home screen with KPI cards
- [ ] T29-03: Member list screen — search and filter
- [ ] T29-04: Member detail screen — view and edit
- [ ] T29-05: Add member screen — form with camera (photo) + GPS capture
- [ ] T29-06: Approve member screen — offline-capable
- [ ] T29-07: Livestock transaction capture screen — offline-capable
- [ ] T29-08: Water voucher issuance screen — offline-capable
- [ ] T29-09: Offline sync engine — queue, conflict detection, sync on reconnect
- [ ] T29-10: Notification inbox screen

### T30: M30 — Mobile Distribution
- [ ] T30-01: Configure EAS Build for Android APK and iOS IPA
- [ ] T30-02: Set up Google Play Console listing
- [ ] T30-03: OTA updates via Expo Updates

---

## Cross-Cutting Tasks (Any Phase)

- [ ] TX-01: Set up error monitoring (Sentry) on API and web app
- [ ] TX-02: Set up uptime monitoring and alerting (e.g., UptimeRobot or Checkly)
- [ ] TX-03: Write API integration tests for each module on completion
- [ ] TX-04: Perform OWASP security review before each phase deployment
- [ ] TX-05: Conduct user acceptance testing with MAKU staff at end of Phase 1 and Phase 2
- [ ] TX-06: Create user training documentation for each module
- [ ] TX-07: Set up automated database backup schedule and test restore procedure
