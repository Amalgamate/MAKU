# MAKU Save/Create/Update Flow Audit

**Date:** 2026-07-10  
**Scope:** All modules under `apps/web-app/src/modules/` and `apps/api/src/modules/`  
**Method:** Full source-code read — every page component, hook, service, API controller cross-checked.

---

## 1. Summary Table

| Module | Page | Has mutation hook? | API endpoint exists? | Service method exists? | Issue found |
|--------|------|--------------------|---------------------|----------------------|-------------|
| **members** | MemberCreatePage | ✅ `useCreateMember` | ✅ `POST /v1/members` | ✅ `membersService.create` | None |
| **members** | MemberProfilePage (edit) | ✅ `useUpdateMember` | ✅ `PATCH /v1/members/:id` | ✅ `membersService.update` | None |
| **members** | MemberListPage (approve/reject) | ✅ `useApproveMember`, `useRejectMember` | ✅ `POST /v1/members/:id/approve`, `/reject` | ✅ | None |
| **cigs** | CigListPage (create) | ✅ `useCreateCig` | ✅ `POST /v1/cigs` | ✅ `cigsService.create` | None |
| **cigs** | CigDetailPage (update) | ✅ `useUpdateCig` | ✅ `PATCH /v1/cigs/:id` | ✅ `cigsService.update` | Minor: officer IDs entered as raw UUIDs — no member picker UI |
| **cigs** | CigDetailPage (meetings) | ✅ `useCreateMeeting`, `useUpdateMeeting`, `useDeleteMeeting` | ✅ all three endpoints | ✅ | None |
| **cigs** | CigDetailPage (documents) | ✅ `useUploadCigDocument`, `useDeleteCigDocument` | ✅ `POST /v1/cigs/:id/documents` | ✅ | MINOR: file stored as `/uploads/…` placeholder, not MinIO |
| **livestock** | LivestockPage | ✅ `useCreateLivestockTransaction` | ✅ `POST /v1/livestock` | ✅ `livestockService.create` | None |
| **feedlot** | FeedlotPage | ✅ inline `useMutation` | ❌ **No `/feedlot` endpoint in API** — no module registered | ❌ **Missing** | **CRITICAL: POST /feedlot returns 404** |
| **water-vouchers** | WaterVouchersPage (issue) | ✅ `useIssueVoucher` | ✅ `POST /v1/water-vouchers` | ✅ `waterVouchersService.create` | None |
| **water-vouchers** | WaterVouchersPage (mark used) | ✅ `useMarkVoucherUsed` | ✅ `PATCH /v1/water-vouchers/:id/use` | ✅ `waterVouchersService.markUsed` | None |
| **commodities** | CommoditiesPage | Read-only index — no form | N/A | N/A | Read-only ✓ |
| **commodities** | HoneyPage / DairyPage / HidesPage / PoultryPage / BonesPage / ConservationPage | ✅ `useCreateCommodityTransaction` | ✅ `POST /v1/commodities` | ✅ `commoditiesService.create` | None |
| **finance** | FinancePage (ledger tx) | ✅ `useCreateTransaction` | ✅ `POST /v1/finance/transactions` | ✅ `financeService.createTransaction` | None |
| **finance** | FinancePage (petty cash) | ✅ `useCreatePettyCash` | ✅ `POST /v1/finance/petty-cash` | ✅ `financeService.createPettyCash` | None |
| **purchases** | PurchasesSalesPage | ✅ `useCreatePurchase` | ✅ `POST /v1/purchases` | ✅ `purchasesService.create` | None |
| **procurement** | ProcurementPage (create) | ✅ `useCreateProcurement` | ✅ `POST /v1/procurement` | ✅ `procurementService.create` | None |
| **procurement** | ProcurementPage (status) | ✅ `useUpdateProcurementStatus` | ✅ `PATCH /v1/procurement/:id/status` | ✅ `procurementService.updateStatus` | None |
| **procurement** | ProcurementPage (quotes) | ✅ `useAddQuote` | ✅ `POST /v1/procurement/:id/quotes` | ✅ `procurementService.addQuote` | None |
| **staff** | StaffPage | ✅ `useCreateStaff` | ✅ `POST /v1/staff` | ✅ `staffService.create` | MINOR: no update UI on StaffPage (PATCH endpoint exists but no edit form) |
| **suppliers** | SuppliersPage (create) | ✅ `useCreateSupplier` | ✅ `POST /v1/suppliers` | ✅ `suppliersService.create` | MINOR: no update/edit UI (PATCH endpoint exists but no edit form in page) |
| **ngos** | NgosPage (create) | ✅ `useCreateNgo` | ✅ `POST /v1/ngos` | ✅ `ngosService.create` | None |
| **grants** | GrantsPage (create) | ✅ `useCreateGrant` | ✅ `POST /v1/grants` | ✅ `grantsService.create` | None |
| **grants** | GrantsPage (advance status) | ✅ `useUpdateGrant` | ✅ `PATCH /v1/grants/:id` | ✅ `grantsService.update` | None |
| **projects** | ProjectsPage (create) | ✅ `useCreateProject` | ✅ `POST /v1/projects` | ✅ `projectsService.create` | None |
| **projects** | ProjectsPage (update status/progress) | ✅ `useUpdateProject` | ✅ `PATCH /v1/projects/:id` | ✅ `projectsService.update` | None |
| **documents** | DocumentsPage (upload) | ✅ inline `useMutation` | ✅ reuses `POST /v1/cigs/:id/documents` | ✅ | MAJOR: upload requires selecting a CIG — no standalone org-level document endpoint |
| **communications** | CommunicationsPage (SMS) | ✅ inline `useMutation` → `POST /communications/sms` | ❌ **No `/communications/sms` endpoint in API** — directory exists but is empty | ❌ **Missing** | **CRITICAL: SMS send hits 404** — page shows notice but send button is still enabled if fields are filled |
| **audit** | AuditPage | Read-only — no form | ✅ `GET /v1/audit-logs` | N/A | MAJOR: response shape mismatch — see Problems #4 |
| **settings** | SettingsPage | Read-only index | N/A | N/A | Read-only ✓ |
| **settings** | UserManagementPage (create user) | ✅ `useCreateUser` | ✅ `POST /v1/users` | ✅ `usersAdminService.create` | None |
| **settings** | UserManagementPage (role/status update) | ✅ `useUpdateUserRoleStatus` | ✅ `PATCH /v1/users/:id/role-status` | ✅ `usersAdminService.updateRoleStatus` | None |
| **settings** | SystemSettingsPage | ✅ `handleSubmit(onSave)` | ❌ **No API call — saves to local Zustand store only** | N/A | MAJOR: org name/logo changes are client-only, not persisted to DB |
| **dashboard** | DashboardPage | Read-only — no form | ✅ `GET /v1/dashboard/kpis`, `GET /v1/dashboard/activity` | N/A | Read-only ✓ |

---

## 2. API Client Check

**File:** `apps/web-app/src/shared/services/api.client.ts`

| Property | Value | Assessment |
|----------|-------|------------|
| Base URL | `import.meta.env['VITE_API_URL'] ?? '/v1'` | ✅ Correct — defaults to relative `/v1` for same-origin proxy; overridable via env |
| Auth header | `Authorization: Bearer <accessToken>` injected by request interceptor | ✅ Correct pattern |
| Token source | `useAuthStore.getState().accessToken` | ✅ Reads from Zustand store outside React render cycle — correct |
| Token persistence | Access token is **not** persisted to localStorage (by design, `partialize` excludes it) | ✅ Intentional, reduces XSS risk |
| Cookie | `withCredentials: true` — sends HttpOnly refresh cookie on all requests | ✅ Correct |
| 401 auto-refresh | Implemented via response interceptor; queues failed requests while refreshing | ✅ Well-implemented |
| Refresh endpoint | `POST {BASE_URL}/auth/refresh` | ✅ Matches `auth.controller.ts` |
| Content-Type | `application/json` default; overridden to `multipart/form-data` for file uploads | ✅ Correct |
| Potential issue | After a page refresh, `accessToken` is `null` (not persisted). The first API call will 401 → trigger refresh → get new token. This is correct behavior but will cause a brief loading state on first page load if the refresh cookie is still valid. | MINOR |

**No critical issues** in the API client itself.

---

## 3. Problems Found

### PROBLEM 1 — Feedlot: Missing API endpoint
- **Module:** feedlot  
- **File:** `c:\Amalgamate\Projects\Trends CORE Apps\MAKU\apps\web-app\src\modules\feedlot\pages\FeedlotPage.tsx`  
- **Line:** ~53–57 (`createMutation`)  
- **Nature:** The Feedlot page calls `POST /feedlot` and `GET /feedlot`. There is **no feedlot module** registered in `app.module.ts` and **no feedlot directory** under `apps/api/src/modules/`. Every feedlot operation — intake, listing — will return `404 Not Found`.  
- **Severity:** **CRITICAL** — feedlot save is completely broken.

---

### PROBLEM 2 — Communications: Missing API endpoint
- **Module:** communications  
- **File:** `c:\Amalgamate\Projects\Trends CORE Apps\MAKU\apps\web-app\src\modules\communications\pages\CommunicationsPage.tsx`  
- **Lines:** ~64–77 (`sendMutation`), ~24–34 (`useSmsLogs`)  
- **Nature:** The page calls `POST /communications/sms` and `GET /communications/sms`. The API has a `communications/` directory under `apps/api/src/modules/` but it is **empty** — no controller, service, or module file exists. There is no `CommunicationsModule` in `app.module.ts`.  
  - Both requests will return `404`.  
  - The page has a notice about the SMS gateway not being configured, and the `onError` handler in `sendMutation` shows a graceful "not configured" toast — so the UX degrades somewhat gracefully. However, the `useSmsLogs` query silently catches the 404 and returns `[]`, which is acceptable.  
  - The Send SMS button becomes **enabled** as soon as the user fills in a message and selects a recipient, meaning it will attempt the broken request.  
- **Severity:** **CRITICAL** for SMS send; **MINOR** for logs (graceful fallback exists). Overall: **CRITICAL**.

---

### PROBLEM 3 — SystemSettingsPage: No persistence to database
- **Module:** settings  
- **File:** `c:\Amalgamate\Projects\Trends CORE Apps\MAKU\apps\web-app\src\modules\settings\pages\SystemSettingsPage.tsx`  
- **Lines:** ~53–60 (`onSave`)  
- **Nature:** The form saves org name, tagline, logo, and theme colour **only to a Zustand store** (`useOrgStore`). There is no `apiClient` call anywhere in this file. The store appears to use `localStorage` persistence (common Zustand pattern) — so it survives page reloads on the same browser, but:  
  - Settings are **not shared** across different users/devices.  
  - There is no API endpoint for system settings in any controller.  
  - The org name in the sidebar, reports, and printed documents will differ per-user.  
- **Severity:** **MAJOR** — settings save works locally but is not persisted to the database.

---

### PROBLEM 4 — AuditPage: Response shape mismatch (`total` vs `meta`)
- **Module:** audit  
- **File:** `c:\Amalgamate\Projects\Trends CORE Apps\MAKU\apps\web-app\src\modules\audit\pages\AuditPage.tsx`  
- **Lines:** ~26–33 (`useAuditLogs` query function)  
- **Nature:** The page types the API response as:
  ```ts
  apiClient.get<{ data: { data: AuditEntry[]; total: number }; message: string }>
  ```
  The API's `AuditController` returns `{ data, meta: { page, perPage, total, totalPages } }`, which after `TransformInterceptor` wrapping becomes:
  ```json
  { "data": { "data": [...], "meta": { "total": 200, ... } }, "message": "Success" }
  ```
  The frontend accesses `res.data.data` which returns `{ data: [...], meta: {...} }`. It then accesses `.total` on this object (in the summary text: `data?.total`), which will always be `undefined` because the total is at `.meta.total`, not `.total`.  
  - `data?.data` (the array) is correctly accessed.  
  - Only the total count display in the header is broken.  
- **Severity:** **MINOR** — audit log rows display correctly; only the total count in the heading shows nothing.

---

### PROBLEM 5 — UsersAdminService: Response shape type mismatch
- **Module:** settings / users  
- **File:** `c:\Amalgamate\Projects\Trends CORE Apps\MAKU\apps\web-app\src\modules\settings\services\users.service.ts`  
- **Lines:** ~24–30 (`list` method)  
- **Nature:** The service declares:
  ```ts
  async list(page, perPage): Promise<UsersListResponse>
  ```
  where `UsersListResponse` is `{ data: UserProfile[]; meta: {...}; message: string }`.  
  The API returns (after TransformInterceptor): `{ data: { data: [...], meta: {...} }, message: 'Success' }`.  
  `res.data.data` = `{ data: [...], meta: {...} }` — the shape is correct and functional.  
  However, the declared type `UsersListResponse` includes a `message` field that won't be present, and is missing the `message` field at the right level. The actual returned object is functionally fine because the `UserManagementPage` only accesses `data?.data` and `data?.meta`. **No runtime bug, but type annotation is misleading.**  
- **Severity:** **MINOR** — type-only issue, no runtime breakage.

---

### PROBLEM 6 — CigDetailPage: CIG Officers require raw UUID input
- **Module:** cigs  
- **File:** `c:\Amalgamate\Projects\Trends CORE Apps\MAKU\apps\web-app\src\modules\cigs\pages\CigDetailPage.tsx`  
- **Lines:** ~250–260 (officer UUID inputs in edit form)  
- **Nature:** The edit form for Chairperson, Secretary, and Treasurer member IDs shows plain text inputs expecting raw UUIDs, with a note "A member picker will be added in a future update." This is a UI gap — users must know the member UUID to assign officers. The API endpoint and schema are complete.  
- **Severity:** **MINOR** — functional but very poor UX.

---

### PROBLEM 7 — DocumentsPage: No standalone document endpoint
- **Module:** documents  
- **File:** `c:\Amalgamate\Projects\Trends CORE Apps\MAKU\apps\web-app\src\modules\documents\pages\DocumentsPage.tsx`  
- **Lines:** ~99–115 (`uploadMutation`), ~62–80 (`useDocuments`)  
- **Nature:** The Document Centre aggregates documents by iterating all CIG IDs and fetching `/cigs/:id/documents` for each. Upload also requires selecting a CIG as the parent. There is **no standalone `/documents` endpoint** for org-level documents.  
  - Upload is broken if no CIG is selected (`disabled={!selectedFile || !selectedCigId}` prevents submission but gives no explanation).  
  - There is no way to upload a document that doesn't belong to a CIG (e.g., board minutes, annual reports at the org level).  
  - The iteration approach causes N+1 API calls on load.  
- **Severity:** **MAJOR** — architectural limitation. Upload only works for CIG-linked docs; org-level docs are unsupported.

---

### PROBLEM 8 — StaffPage: No edit form
- **Module:** staff  
- **File:** `c:\Amalgamate\Projects\Trends CORE Apps\MAKU\apps\web-app\src\modules\staff\pages\StaffPage.tsx`  
- **Nature:** The page has a create form (working). There is no edit form for updating staff details, changing status, or terminating a staff member. The API has `PATCH /v1/staff/:id` and `PATCH /v1/staff/:id/terminate`, and `staffService.update` exists. The UI just doesn't expose it.  
- **Severity:** **MAJOR** — updates and terminations are impossible from the UI.

---

### PROBLEM 9 — SuppliersPage: No edit/update form
- **Module:** suppliers  
- **File:** `c:\Amalgamate\Projects\Trends CORE Apps\MAKU\apps\web-app\src\modules\suppliers\pages\SuppliersPage.tsx`  
- **Nature:** The page has a create form (working). There is no edit form for updating supplier details, and no way to deactivate a supplier from the UI. The API has `PATCH /v1/suppliers/:id` and `DELETE /v1/suppliers/:id`, and `suppliersService.update` and `suppliersService.deactivate` exist.  
- **Severity:** **MAJOR** — updates are impossible from the UI; supplier cards are display-only after creation.

---

### PROBLEM 10 — CommunicationsPage: Audit log endpoint wrong
- **Module:** communications  
- **File:** `c:\Amalgamate\Projects\Trends CORE Apps\MAKU\apps\web-app\src\modules\communications\pages\CommunicationsPage.tsx`  
- **Lines:** ~24–34 (`useSmsLogs`)  
- **Nature:** The query hits `/communications/sms` (GET) to load SMS history. This endpoint doesn't exist. The `catch { return []; }` silently suppresses the 404. If the backend is later built, the endpoint structure must match.  
- **Severity:** **MINOR** (graceful fallback) — but clarified as **CRITICAL** when combined with Problem 2.

---

## 4. Recommendations (Priority Order)

### P0 — Fix immediately (broken saves)

1. **Build the Feedlot API module** — create `apps/api/src/modules/feedlot/` with a NestJS controller (`GET /feedlot`, `POST /feedlot`), service, entity, and register it in `app.module.ts`. The frontend entity shape is defined in `FeedlotPage.tsx` (inline interface). Until this is done, feedlot intake always fails silently (the `onError` handler shows a toast).

2. **Build the Communications API module** — create `apps/api/src/modules/communications/` with at minimum `POST /communications/sms` (enqueue/log SMS attempt) and `GET /communications/sms` (return log). Wire it to Africa's Talking (or stub it). The directory exists but is completely empty. The send button needs to show the correct "not configured" message without hitting a 404.

### P1 — Persistent data integrity

3. **Persist SystemSettings to the database** — create a `system-settings` API endpoint (`GET /settings`, `PATCH /settings`) and update `SystemSettingsPage.onSave()` to call it. The current Zustand-only approach means org branding diverges between users. A settings entity with a single-row pattern is sufficient.

4. **Fix AuditPage total count display** — change `data?.total` to `data?.meta?.total` (or adjust the response type annotation) so the header shows the correct entry count.

### P2 — Missing UI for existing API capabilities

5. **Add Staff edit/terminate form** — the API already supports `PATCH /v1/staff/:id` and `PATCH /v1/staff/:id/terminate`. Add an edit drawer or modal to `StaffPage.tsx` using `staffService.update`.

6. **Add Supplier edit/deactivate UI** — the API already supports `PATCH /v1/suppliers/:id` and `DELETE /v1/suppliers/:id`. Add an edit modal to `SuppliersPage.tsx`.

7. **Add CIG officer member picker** — replace the raw UUID text inputs in `CigDetailPage.tsx` with a searchable member dropdown (the `useMemberList` hook is already used elsewhere in the codebase).

### P3 — Architectural improvements

8. **Create a standalone `/documents` endpoint** — move the Document Centre away from CIG-specific storage. Implement a `documents` table/controller for org-level documents. Or expose a compound query endpoint that aggregates. The current N+1 pattern degrades on large CIG counts.

9. **Fix `UsersAdminService.list()` response type** — clean up the `UsersListResponse` type to correctly reflect the unwrapped shape (without the extra `message` field). Low risk, just noise.

10. **Add `from` date filter support to AuditPage** — the filter control renders a date input and sets `filters.from`, but the audit controller only accepts `from` as a plain date query string. Verify the controller's service correctly applies a `createdAt >= from` filter (functional check recommended).
