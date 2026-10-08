# Implementation Plan — MAKU Save/Create/Update Fixes

Generated from audit report at `.agents/tasks/save-audit.md`.  
Worktree: `c:\Amalgamate\Projects\Trends CORE Apps\MAKU`

---

## FEAT grouping overview

The 10 fixes split cleanly into 4 sequential features:

| FEAT | Fixes covered | Dependency |
|------|--------------|------------|
| FEAT-001 | 1 (Feedlot API) + 2 (Communications API) + 8 (Documents API) | none |
| FEAT-002 | 3 (Settings persistence — API + frontend) + 10 (Website logo) | needs API from FEAT-001 wired |
| FEAT-003 | 5 (Staff edit UI) + 6 (Suppliers edit UI) + 7 (CIG officer picker) | independent of FEAT-001/002 |
| FEAT-004 | 4 (Audit total count) + 9 (UsersAdminService type) + Documents frontend | FEAT-001 must exist |

---

## FEAT-001 — Three missing API modules (Feedlot, Communications, Documents)

### FIX 1 — Feedlot API module

**What the frontend expects** (from `FeedlotPage.tsx`):
- `GET /feedlot` → `{ data: FeedlotAnimal[], message }` (flat array, no meta needed for now)
- `POST /feedlot` body: `{ animalTag, species, memberId?, intakeDate, intakeWeightKg, dailyFeedCostKes?, notes? }`

**Files to create:** `apps/api/src/modules/feedlot/`
- `feedlot.entity.ts` — `feedlot_animals` table
- `dto/create-feedlot.dto.ts`
- `feedlot.service.ts`
- `feedlot.controller.ts` — `GET /feedlot`, `POST /feedlot`, `PATCH /feedlot/:id`
- `feedlot.module.ts`

**Entity fields** (derived from `FeedlotAnimal` interface in `FeedlotPage.tsx`):
```
id          uuid PK
animalTag   varchar(50)  NOT NULL
species     varchar(50)  default 'cattle'
memberId    uuid nullable FK reference only (no typeorm relation needed)
intakeDate  date NOT NULL
intakeWeightKg  decimal(10,2) NOT NULL
currentWeightKg decimal(10,2) nullable
dailyFeedCostKes decimal(10,2) default 0
status      enum('active','sold','died') default 'active'
saleDate    date nullable
salePriceKes decimal(12,2) nullable
notes       text nullable
createdAt   timestamptz
updatedAt   timestamptz
```

**Service methods:**
- `findAll(filters?: { status?: string; memberId?: string })` → `FeedlotAnimal[]`
- `create(dto, userId)` → saved entity
- `update(id, dto)` → updated entity (for PATCH, e.g. set currentWeightKg, status, saleDate)

**Controller pattern:** mirror `apps/api/src/modules/livestock/livestock.controller.ts`
- `@Controller('feedlot')`, `@ApiTags('Feedlot')`, `@ApiBearerAuth()`
- `GET /feedlot` — no auth roles (any authenticated user)
- `POST /feedlot` — `@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FIELD_OFFICER)`
- `PATCH /feedlot/:id` — same roles

**Module:** `TypeOrmModule.forFeature([FeedlotAnimal])`, export service.

**app.module.ts:** add `import { FeedlotModule }` and add to `imports` array after `LivestockModule`.

**Gotcha:** The `FeedlotPage.tsx` response type is `{ data: FeedlotAnimal[]; message: string }` — the TransformInterceptor wraps this correctly. Service returns flat array; controller maps to DTOs.

---

### FIX 2 — Communications API module

**What the frontend expects** (from `CommunicationsPage.tsx`):
- `POST /communications/sms` body: `{ message, recipients }` or similar
- `GET /communications/sms` → array of SMS log records

**Files to create:** `apps/api/src/modules/communications/`
- `sms-log.entity.ts` — `sms_logs` table
- `dto/send-sms.dto.ts`
- `communications.service.ts`
- `communications.controller.ts`
- `communications.module.ts`

**Entity fields:**
```
id           uuid PK
recipient    varchar(20) nullable (phone or group label)
message      text NOT NULL
status       enum('sent','failed','pending') default 'pending'
sentAt       timestamptz nullable
sentBy       uuid nullable (userId from JWT)
memberCount  int nullable
errorMessage varchar(500) nullable
createdAt    timestamptz
```

**Service pattern:** reference `apps/api/src/modules/audit/audit.service.ts` (simple repo + log pattern)
- `sendSms(dto, userId)` — create log entry with status 'pending', attempt Africa's Talking if `AT_API_KEY` + `AT_USERNAME` env vars set, update status to 'sent'/'failed'. Never throw — always return the log entry.
- `getLogs()` → recent 100 log entries ordered by `createdAt DESC`

**Controller:**
- `@Controller('communications')`, `@ApiTags('Communications')`, `@ApiBearerAuth()`
- `POST /communications/sms` — `@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FIELD_OFFICER)`
- `GET /communications/sms` — `@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)`

**Gotcha:** AT SDK (`africastalking`) may not be in `package.json`. Use conditional `await import('africastalking')` — if it throws (missing dep), catch and mark status 'failed'. This way the endpoint returns 200 with a failed log rather than 500.

**app.module.ts:** add `CommunicationsModule` after `AuditModule`.

---

### FIX 8 — Documents API module

**What the updated frontend will expect:**
- `GET /documents?category=&page=1&perPage=50` → `{ data: DocumentItem[], meta: {...}, message }`
- `POST /documents` (multipart) → created document

**Files to create:** `apps/api/src/modules/documents/`
- `document.entity.ts` — `documents` table
- `dto/create-document.dto.ts`
- `documents.service.ts`
- `documents.controller.ts`
- `documents.module.ts`

**Entity fields:**
```
id          uuid PK
title       varchar(255) NOT NULL
category    varchar(50) default 'other'
fileUrl     varchar(500) NOT NULL
fileSize    int nullable
mimeType    varchar(100) nullable
year        int nullable
description text nullable
uploadedBy  uuid nullable
cigId       uuid nullable  (optional FK to cig — nullable for org-level docs)
createdAt   timestamptz
updatedAt   timestamptz
```

**Service:** `findAll(filters)` with pagination returning `{ data, total }`, `create(dto)` upserts the record (no actual file storage — fileUrl is the client-provided URL or a placeholder path).

**Controller:**
- `@Controller('documents')`, `@ApiBearerAuth()`
- `GET /documents` — authenticated, returns `{ data, meta }`
- `POST /documents` — `@Roles(SUPER_ADMIN, ADMIN, FIELD_OFFICER)`

**app.module.ts:** add `DocumentsModule` after `StaffModule`.

---

## FEAT-002 — System settings persistence + website logo

### FIX 3 — Settings API module

**Files to create:** `apps/api/src/modules/settings/`
- `org-settings.entity.ts`
- `settings.service.ts`
- `settings.controller.ts`
- `settings.module.ts`

**Entity — single-row pattern:**
```
id           varchar(5) PK default '1' (always '1')
orgName      varchar(200) NOT NULL default 'MAKU'
tagline      varchar(500) nullable
logoUrl      varchar(500) nullable
primaryColor varchar(20) default '#7e2710'
updatedAt    timestamptz
```

**Service:**
- `getOrgSettings()` — findOne `id='1'`; if not found, insert default row and return.
- `updateOrgSettings(dto)` — upsert on `id='1'` via TypeORM `save()`.

**Controller:**
- `GET /settings/org` — `@Public()` so the public site and unauthenticated code can read it
- `PATCH /settings/org` — `@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)` + `@ApiBearerAuth()`

**Import path for `@Public()`:** `../../shared/decorators/public.decorator`

**app.module.ts:** add `SettingsModule` after `WebsiteModule`.

**Frontend — `apps/web-app/src/modules/settings/`:**

1. Create `hooks/useOrgSettings.ts`:
   - `useOrgSettings()` — `useQuery` GET `/settings/org`
   - `useUpdateOrgSettings()` — `useMutation` PATCH `/settings/org`
   - Invalidates query key `['org-settings']`

2. Update `pages/SystemSettingsPage.tsx`:
   - Import and call `useOrgSettings()` to hydrate form `defaultValues`
   - On `onSave()`: call both `org.setName/setTagline(...)` (Zustand, for immediate sidebar update) **and** `updateOrgSettings.mutate(...)` (API persistence)
   - Logo: on `handleLogoFile`, also call `updateOrgSettings.mutate({ logoUrl: base64url })` after Zustand update. Note: for now logoUrl is stored as base64 data URL since there's no file storage endpoint — this matches the existing `org.logoUrl` approach.
   - Show a "Saving…" / "Saved" state from the mutation status.

3. Update `store/org.store.ts`: add a `hydrate(settings)` action that sets all fields at once. Call `useOrgSettings` in the app root (e.g. `AppShell` or equivalent) and call `org.hydrate(data)` on success, so sidebar always reflects the database value.

**Gotcha:** The `org.logoUrl` in `WebsiteBuilderPage.tsx` `GlobalSettings` reads from `useOrgStore`. After Fix 3, `useOrgStore` will be hydrated from the API on app load, so the logo will automatically flow through — no change needed to `WebsiteBuilderPage.tsx`.

### FIX 10 — Website logo (depends on Fix 3)

**Analysis:** `PublicLayout.tsx` already reads `settings?.logoUrl` from `useCmsSettings()` which calls `GET /website/settings`. The `WebsiteSettings` entity has a `logoUrl` field. `WebsiteService.updateSettings(data)` already does `Object.assign(s, data)` which will persist any `logoUrl` passed to it.

**The gap:** `GlobalSettings` panel passes `logoUrl: org.logoUrl` to `updateWebsiteSettings` mutation already. Once Fix 3 makes `org.logoUrl` come from the DB (via hydration), the logo will be correct on the public site too.

**Action needed:** Verify that `WebsiteService.updateSettings` is called with `logoUrl` — it is (line `updateMutation.mutate({ siteName, tagline, footerText, primaryColor, logoUrl: org.logoUrl })`). No code change needed in the website module itself. The public site already reads `settings?.logoUrl` from `useCmsSettings()`. **Fix 10 is satisfied by Fix 3's hydration.**

---

## FEAT-003 — UI gaps: Staff edit, Suppliers edit, CIG officer picker

### FIX 5 — Staff edit/terminate modal

**File:** `apps/web-app/src/modules/staff/pages/StaffPage.tsx`

**What already exists:**
- `useUpdateStaff(id)` hook already in `useStaff.ts` — calls `staffService.update(id, data)` → PATCH `/v1/staff/:id`
- `staffService.update()` already in `staff.service.ts`
- Need to add `useTerminateStaff` hook — calls PATCH `/v1/staff/:id/terminate` with body `{ endDate }`

**Add to `hooks/useStaff.ts`:**
```ts
export function useTerminateStaff(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (endDate: string) => staffService.terminate(id, endDate),
    onSuccess: () => { qc.invalidateQueries({ queryKey: keys.all }); toast.success('Staff member terminated'); },
    onError: () => toast.error('Termination failed'),
  });
}
```

**Add to `staff.service.ts`:**
```ts
async terminate(id: string, endDate: string): Promise<StaffMember> {
  const res = await apiClient.patch<ApiResponse<StaffMember>>(`/staff/${id}/terminate`, { endDate });
  return res.data.data;
}
```

**`StaffPage.tsx` changes:**
- Add state: `editingStaff: StaffMember | null`
- Add edit button (pencil icon) on each table row
- Add an edit modal (same pattern as the existing create modal) with fields: `fullName, role, department, phone, email`
- Add a "Terminate" button in the modal footer with double-click confirmation (same `deletingMemberId` pattern used in CigDetailPage — single click sets `confirmTerminateId`, second click confirms)
- Wire `useUpdateStaff(editingStaff.id)` on save, `useTerminateStaff(editingStaff.id)` on terminate
- The table already has 8 columns; add a 9th "Actions" column with an edit button

**Schema for edit form:** same fields as create, all optional except `fullName` and `role`.

---

### FIX 6 — Suppliers edit/deactivate modal

**File:** `apps/web-app/src/modules/suppliers/pages/SuppliersPage.tsx`

**What already exists:**
- `useUpdateSupplier(id)` hook in `useSuppliers.ts`
- `suppliersService.update()` and `.deactivate()` in `suppliers.service.ts`
- No `useDeactivateSupplier` hook — add it.

**Add to `hooks/useSuppliers.ts`:**
```ts
export function useDeactivateSupplier(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => suppliersService.deactivate(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: keys.all }); toast.success('Supplier deactivated'); },
    onError: () => toast.error('Deactivation failed'),
  });
}
```

**`SuppliersPage.tsx` changes:**
- Add state: `editingSupplier: Supplier | null`
- Add an "Edit" button on each supplier card (pencil icon, top-right of card)
- Add an edit modal with fields: `name, contactName, phone, email, category, physicalAddress`
- Add "Deactivate" button in modal footer with double-confirm pattern
- Wire `useUpdateSupplier(editingSupplier.id)` on save, `useDeactivateSupplier(editingSupplier.id)` on deactivate

---

### FIX 7 — CIG officer member picker

**File:** `apps/web-app/src/modules/cigs/pages/CigDetailPage.tsx`

**What already exists:**
- `useMemberList(filters)` from `../../members/hooks/useMembers` — already imported in `FeedlotPage.tsx` showing the pattern
- The three text inputs for `chairpersonMemberId`, `secretaryMemberId`, `treasurerMemberId` with UUID validation in `editSchema`

**Change:**
- Add `memberSearch` state and `useMemberList({ search: memberSearch, status: MemberStatus.ACTIVE, page: 1, perPage: 50 })`
- Replace each UUID text input with a `<select>` (same searchable select pattern as `FeedlotPage.tsx` — search input + `<select size={3}>`)
- Keep the `z.string().uuid().optional().or(z.literal(''))` schema validation unchanged
- If member list fails to load (error state), fall back to plain text input for the UUID

**Import to add:**
```ts
import { useMemberList } from '../../members/hooks/useMembers';
import { MemberStatus } from '@maku/shared-types';
```
(MemberStatus is already imported in CigDetailPage.tsx)

---

## FEAT-004 — Minor type/display fixes + Documents frontend update

### FIX 4 — Audit total count

**File:** `apps/web-app/src/modules/audit/pages/AuditPage.tsx`

**Change 1:** Fix the response type:
```ts
// Old:
apiClient.get<{ data: { data: AuditEntry[]; total: number }; message: string }>
// New:
apiClient.get<{ data: { data: AuditEntry[]; meta: { page: number; perPage: number; total: number; totalPages: number } }; message: string }>
```

**Change 2:** The query returns `res.data.data` which is `{ data: AuditEntry[], meta: {...} }`.
In the component, update the display line:
```ts
// Old: data?.total
// New: data?.meta?.total
```

**Change 3:** `const logs = data?.data ?? [];` is already correct.

---

### FIX 9 — UsersAdminService response type

**File:** `apps/web-app/src/modules/settings/services/users.service.ts`

**Change:** Fix `UsersListResponse` to match actual API shape after `TransformInterceptor` unwrapping:
```ts
// The service calls: apiClient.get<{ data: UsersListResponse; message: string }>
// And returns: res.data.data  ← this is the inner { data: UserProfile[], meta: {...} }
// So UsersListResponse should be:
export interface UsersListResponse {
  data: UserProfile[];
  meta: { page: number; perPage: number; total: number; totalPages: number };
  // remove the message field — it's at the outer wrapper level, not here
}
```

---

### Documents frontend update (FIX 8 frontend, depends on FEAT-001)

**File:** `apps/web-app/src/modules/documents/pages/DocumentsPage.tsx`

**Changes:**
1. Replace the N+1 `useDocuments` hook with a direct `GET /documents` call:
```ts
function useDocuments(filters: { category?: string; page?: number } = {}) {
  return useQuery({
    queryKey: ['documents', 'all', filters],
    queryFn: async () => {
      const p = new URLSearchParams();
      if (filters.category) p.set('category', filters.category);
      const res = await apiClient.get<{ data: { data: DocumentItem[]; meta: Meta }; message: string }>(`/documents?${p}`);
      return res.data.data;
    },
    staleTime: 1000 * 60 * 2,
  });
}
```

2. Update `uploadMutation` to POST to `/documents` (no `selectedCigId` required — make it optional):
- Change `disabled={!selectedFile || !selectedCigId}` to `disabled={!selectedFile}`
- Post to `/documents` with optional `cigId` field

3. Remove the `useQuery(['cigs-list-for-docs'])` if it's only for the mandatory CIG selector. Keep it but make CIG selection optional.

4. In the table, the `cigName` column can now show '—' for org-level docs; no change needed there.

---

## Build and verification commands

All are run from the monorepo root `c:\Amalgamate\Projects\Trends CORE Apps\MAKU`:

```bash
# TypeCheck API
pnpm typecheck:api

# TypeCheck web-app
pnpm typecheck:app

# TypeCheck public
pnpm typecheck:public

# Build all
pnpm build:all
```

For runtime testing, start dev servers with `pnpm dev` and verify:
- POST `/v1/feedlot` returns 201 (not 404)
- POST `/v1/communications/sms` returns 200/201 (not 404)  
- GET `/v1/settings/org` returns org settings
- PATCH `/v1/settings/org` persists to DB
- Staff edit modal opens, PATCH succeeds
- Supplier edit modal opens, PATCH succeeds
- CIG officer picker shows member names not raw UUIDs
- Audit page shows entry count in header

---

## Key decisions and rationale

1. **FeedlotAnimal entity name in TypeORM** — use class name `FeedlotAnimal` (not `FeedlotEntry` as the spec suggests) to match the `FeedlotAnimal` interface in `FeedlotPage.tsx`. Table name `feedlot_animals`.

2. **Communications — no actual AT SDK install** — use conditional dynamic import to keep the endpoint functional even if `africastalking` npm package is absent. The log entry is always created; AT delivery is best-effort.

3. **Settings logoUrl stored as base64** — no file upload API/MinIO exists. The existing `org.logoUrl` in Zustand already stores base64 data URLs (from `FileReader.readAsDataURL`). We persist this same base64 string to the DB. This is consistent with existing behaviour, avoids adding new infrastructure.

4. **Fix 10 via Fix 3 hydration** — `PublicLayout.tsx` already reads `logoUrl` from `useCmsSettings()` (website module). `WebsiteBuilderPage GlobalSettings` already passes `org.logoUrl` to `updateWebsiteSettings`. Once `org.logoUrl` is hydrated from the org settings API (Fix 3), the logo will flow through without any additional changes.

5. **Documents endpoint returns flat array with meta** — matching the `{ data, meta }` pattern used by livestock, audit, and procurement. Frontend currently expects a flat array but the new hook reads `.data.data` which is the array.

6. **Staff terminate double-confirm** — use the same `confirmTerminateId` state pattern (single-click sets, second-click executes) as used in `CigDetailPage.tsx` for member removal. Consistent UX.
