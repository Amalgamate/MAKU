# MAKU Digital Cooperative Platform — Requirements

**Project:** MAKU Digital Cooperative Platform  
**Client:** Merti Animal Key Users (MAKU), Merti, Isiolo County, Kenya  
**Prepared by:** Trends CORE Solutions  
**Delivery:** Web App + PWA (Phase 1–4), Mobile Admin App (Phase 5+)

---

## 1. Overview

MAKU is a farmer-led cooperative in Merti, Isiolo County, Kenya. The organisation manages livestock marketing, feedlots, borehole/water vouchers, honey/beekeeping, hides & skins, poultry, bones & horns, dairy/milk, environmental conservation, NGO/grant management, and community services. It operates with a staff complement and a registered membership base of smallholder farmers organised into Common Interest Groups (CIGs).

The platform is a **cloud-hosted, web-based management system** that digitalises all cooperative operations, plus a **public-facing website** for visibility, impact reporting, and partner engagement. A **Progressive Web App (PWA)** makes the system accessible offline and on low-bandwidth mobile devices in the field. A dedicated **Mobile Admin App** (React Native or equivalent) will be developed as a follow-on phase.

---

## 2. Delivery Approach — Modular Phased Build

The system is built and released in **modules**, allowing MAKU to gain value early and progressively. Each module is a self-contained deliverable that can be tested and used independently. Later modules build on earlier ones.

### Module Release Order

| Module | Name | Priority |
|--------|------|----------|
| M01 | Authentication & User Accounts | P0 — Foundation |
| M02 | Member Register | P0 — Core |
| M03 | CIG (Common Interest Group) Management | P1 |
| M04 | Roles, Permissions & Approval System | P1 |
| M05 | Livestock Marketing | P2 |
| M06 | Feedlot Management | P2 |
| M07 | Borehole & Water Vouchers | P2 |
| M08 | Purchases & Sales | P2 |
| M09 | Finance & Petty Cash | P2 |
| M10 | Procurement | P3 |
| M11 | Staff & Salary Management | P3 |
| M12 | Supplier Register | P3 |
| M13 | Honey & Beekeeping | P3 |
| M14 | Environmental Conservation | P3 |
| M15 | Hides & Skins | P3 |
| M16 | Poultry | P3 |
| M17 | Bones & Horns | P3 |
| M18 | Dairy / Milk | P3 |
| M19 | Document Centre | P3 |
| M20 | Smart Search | P3 |
| M21 | Communication (SMS/In-App) | P3 |
| M22 | NGO & Partner Management | P4 |
| M23 | Grants Pipeline | P4 |
| M24 | Project Management | P4 |
| M25 | Audit Trail | P1 — cross-cutting |
| M26 | Dashboard & Analytics | P2 — cross-cutting |
| M27 | Reports | P2 — cross-cutting |
| M28 | Public Website | P3 |
| M29 | PWA Shell & Offline Support | P1 — cross-cutting |
| M30 | Mobile Admin App (React Native) | Phase 5+ |

---

## 3. Module M01 — Authentication & User Accounts

### 3.1 Description
The authentication module is the entry point for all staff, admins, and (optionally) members who access the platform. It must be completed before any other module.

### 3.2 Functional Requirements

#### FR-M01-01: User Registration (Admin-initiated)
- An admin can create a new user account by providing: full name, email, phone number, role, and initial password.
- The system sends a welcome email/SMS with login credentials or a set-password link.
- Self-registration by staff/admin users is NOT open to the public.

#### FR-M01-02: Member Portal Registration (Member self-service)
- A MAKU member can register themselves via a public portal page.
- Required fields: full name, national ID or cooperative member number, phone number, sub-location/village, CIG affiliation (if known).
- Member accounts are placed in a **Pending** state until approved by an admin.
- Admin receives a notification on new member registration requests.

#### FR-M01-03: Login
- Email + password login for all user types.
- Phone number + OTP login option for members with limited email access.
- "Forgot password" flow via email or SMS OTP.
- Session timeout after configurable inactivity period (default: 30 minutes).

#### FR-M01-04: Multi-Factor Authentication (MFA)
- Optional MFA via SMS OTP for admin and finance roles.
- Configurable per role.

#### FR-M01-05: User Profile
- Each user has a profile page: name, photo, contact details, role, last login.
- Users can update their own profile and change password.
- Admin can edit any user profile.

#### FR-M01-06: Account Status Management
- Account states: Active, Pending, Suspended, Deactivated.
- Admin can change status, triggering notification to the user.
- Deactivated accounts are soft-deleted (data retained for audit).

#### FR-M01-07: Audit Logging for Auth Events
- All login attempts (success/failure), password changes, and account status changes are logged with timestamp, IP address, and user agent.

### 3.3 Non-Functional Requirements
- Passwords hashed with bcrypt (min cost factor 12).
- JWT-based session tokens with refresh token rotation.
- HTTPS enforced; no credentials transmitted over plain HTTP.
- WCAG 2.1 AA accessible login pages.
- Login page must load within 2 seconds on a 3G connection.

---

## 4. Module M02 — Member Register

### 4.1 Description
A central registry of all MAKU cooperative members. This is the backbone of the system — most other modules reference member records.

### 4.2 Functional Requirements

#### FR-M02-01: Member Record
Each member record captures:
- Personal: full name, national ID, date of birth, gender, photo
- Contact: phone number(s), sub-location, village, GPS coordinates of homestead (optional)
- Cooperative: member number (auto-generated), registration date, CIG membership, share contributions
- Livestock: current herd size by type (cattle, goats, camels, sheep)
- Status: Active, Inactive, Deceased

#### FR-M02-02: Member Number Auto-Generation
- System auto-generates a unique member number on approval: format `MAKU-YYYY-NNNN`.

#### FR-M02-03: Member Search & Filter
- Search by name, member number, national ID, phone, CIG, sub-location.
- Filter by status, gender, CIG, registration year.
- Export filtered list to CSV or PDF.

#### FR-M02-04: Member Profile Page
- Dedicated page per member showing all record fields plus linked activity history (transactions, vouchers, marketing, loans).

#### FR-M02-05: Member Import
- Bulk import of existing members via CSV template.
- Import validation with error report before committing.

#### FR-M02-06: Member Verification
- Admin approves or rejects pending member registrations.
- Rejection includes a reason sent back to the applicant by SMS.

#### FR-M02-07: Duplicate Detection
- System flags potential duplicates on national ID or phone number on entry.

### 4.3 Non-Functional Requirements
- Member list must paginate; handle 10,000+ records without performance degradation.
- Photos stored in cloud object storage (e.g., S3-compatible).
- GPS coordinates displayed on a map (Leaflet.js or Google Maps).

---

## 5. Module M03 — CIG Management

### 5.1 Description
Manages Common Interest Groups (CIGs), which are sub-groupings of members by geography, commodity, or interest.

### 5.2 Functional Requirements

#### FR-M03-01: CIG Record
- CIG name, type (commodity/geography/mixed), registration date, location, chairperson, secretary, members list.

#### FR-M03-02: CIG Membership
- Assign/remove members from CIGs.
- A member can belong to multiple CIGs.

#### FR-M03-03: CIG Meetings
- Record CIG meetings: date, agenda, attendance, minutes, action items.

#### FR-M03-04: CIG Performance Dashboard
- View aggregate stats per CIG: member count, activity volumes, contributions.

---

## 6. Module M04 — Roles, Permissions & Approval System

### 6.1 Description
Defines who can do what in the system. Supports multi-level approval workflows for financial and sensitive operations.

### 6.2 Functional Requirements

#### FR-M04-01: Role Management
- Predefined roles: Super Admin, Admin, Finance Officer, Field Officer, CIG Coordinator, Member, Viewer.
- Custom roles can be created with granular permission sets.

#### FR-M04-02: Permission Scoping
- Permissions scoped to: module, action (view / create / edit / delete / approve), and data scope (own records / CIG / all).

#### FR-M04-03: Approval Workflows
- Configurable approval chains for: financial transactions above a threshold, procurement, grant disbursements, and member registration.
- Notifications sent to approvers at each step.
- Escalation if approval not actioned within a defined time.

#### FR-M04-04: Delegation
- An approver can delegate their approval authority to another user for a defined period.

---

## 7. Module M25 — Audit Trail (Cross-Cutting)

### 7.1 Description
Every create, update, and delete action across all modules is recorded with who did it, when, and what changed.

### 7.2 Functional Requirements

#### FR-M25-01: Immutable Log
- Audit records are append-only; no user (including Super Admin) can delete audit logs.

#### FR-M25-02: Log Fields
- Entity type, entity ID, action, previous value (JSON), new value (JSON), user ID, timestamp, IP address.

#### FR-M25-03: Audit Search & Filter
- Filter by user, date range, module, action type.
- Export to CSV.

---

## 8. Module M05 — Livestock Marketing

### 8.1 Functional Requirements
- Record livestock sale events: market date, location, seller (member), buyer, species, quantity, weight, price per unit, total amount.
- Integrate with M-Pesa for payment confirmation.
- Link transactions to member accounts.
- Generate market day summary reports.
- Track seasonal trends and price history.

---

## 9. Module M06 — Feedlot Management

### 9.1 Functional Requirements
- Record animals entering the feedlot: member, animal ID, species, weight in, date in.
- Track daily feeding costs, health records, weight gain.
- Record sale of animals out: weight out, price, buyer, profit/loss calculation.
- Allocate feedlot costs to individual animals.

---

## 10. Module M07 — Borehole & Water Voucher System

### 10.1 Functional Requirements
- Issue water vouchers to members (digital or printable).
- Track voucher usage at each borehole point.
- Manage borehole operator accounts.
- Report on water distribution by member, CIG, location.
- Flag unusual usage patterns.

---

## 11. Module M08 — Purchases & Sales

### 11.1 Functional Requirements
- Record all cooperative purchases from members and external suppliers.
- Record all cooperative sales to buyers and markets.
- Link to supplier register (M12) and member register (M02).
- Generate invoices and receipts.
- Track outstanding payments (debtors/creditors).

---

## 12. Module M09 — Finance & Petty Cash

### 12.1 Functional Requirements
- General ledger with chart of accounts.
- Record income and expense transactions.
- Petty cash float management: issue, record expenses, reconcile.
- Bank reconciliation.
- Monthly and annual financial summaries.
- Integrate with M-Pesa transaction imports.

---

## 13. Module M10 — Procurement

### 13.1 Functional Requirements
- Raise purchase requisitions.
- Three-quote process for procurement above threshold.
- Purchase order generation and approval.
- Goods received note.
- Link to Finance (M09) for payment processing.

---

## 14. Module M11 — Staff & Salary Management

### 14.1 Functional Requirements
- Staff register: personal details, role, department, employment date, salary grade.
- Monthly payroll calculation: base salary, allowances, deductions (NHIF, NSSF, PAYE).
- Generate payslips (PDF).
- Leave management: apply, approve, balance tracking.

---

## 15. Module M12 — Supplier Register

### 15.1 Functional Requirements
- Register and profile external suppliers: name, contacts, category, bank details, tax PIN.
- Rate suppliers after transactions.
- Track purchase history per supplier.

---

## 16. Commodity Modules (M13–M18)

Each commodity module (Honey/Beekeeping, Environmental Conservation, Hides & Skins, Poultry, Bones & Horns, Dairy/Milk) follows the same pattern:

### Common Requirements per Commodity Module
- Record production/collection from members (quantity, quality grade, price).
- Track processing and value addition steps.
- Record bulk sale to buyers.
- Profit/loss per commodity cycle.
- Link all transactions to member accounts.
- Seasonal performance charts.

---

## 17. Module M19 — Document Centre

### 17.1 Functional Requirements
- Upload, store, and organise documents (PDF, Word, Excel, images).
- Tag documents by type: policy, contract, report, permit, photo.
- Search by name, tag, date, uploader.
- Access control: some documents restricted by role.
- Version history for updated documents.

---

## 18. Module M20 — Smart Search

### 18.1 Functional Requirements
- Global search bar available on all pages.
- Full-text search across members, transactions, documents, CIGs.
- Results grouped by entity type.
- Recent searches saved per user.

---

## 19. Module M21 — Communication

### 19.1 Functional Requirements
- Send SMS to individual members, CIG groups, or all members.
- In-app notifications (bell icon).
- Email notifications for key events.
- Bulk SMS via Africa's Talking or similar SMS gateway.
- Communication log showing sent messages and delivery status.

---

## 20. Module M22 — NGO & Partner Management

### 20.1 Functional Requirements
- Register NGO/development partners: name, country, contacts, focus areas.
- Track partnership agreements, MoUs, reporting obligations.
- Partner-facing portal (read-only impact view).

---

## 21. Module M23 — Grants Pipeline

### 21.1 Functional Requirements
- Track grant opportunities: source, amount, deadline, status (prospecting/applied/awarded/closed).
- Store proposal documents.
- Awarded grants: track disbursements, expenditures, reporting deadlines.
- Dashboard showing pipeline value.

---

## 22. Module M24 — Project Management

### 22.1 Functional Requirements
- Create projects linked to grants or cooperative programs.
- Work breakdown structure: milestones, tasks, assignees, deadlines.
- Progress tracking with percentage completion.
- Budget vs. actual spend tracking.
- Project reports (auto-generated narrative + financial summary).

---

## 23. Module M26 — Dashboard & Analytics

### 23.1 Functional Requirements
- Role-specific dashboards (what you see depends on your role).
- KPI cards: active members, total livestock sold, revenue this month, grants pipeline value.
- Charts: member growth trend, revenue by commodity, borehole usage by location.
- GIS map overlay: member locations, borehole points, CIG areas.
- Export dashboard snapshot to PDF.

---

## 24. Module M27 — Reports

### 24.1 Functional Requirements
- Pre-built reports for each module (e.g., Member Register Report, Market Day Summary, Monthly Financial Report).
- Custom report builder: pick fields, apply filters, choose format (table/chart).
- Schedule reports for automated email delivery.
- Export to PDF and Excel.

---

## 25. Module M28 — Public Website

### 25.1 Functional Requirements
- **Impact Page:** MAKU's story, key statistics (members, livestock sold, value), photo gallery, success stories.
- **NGO/Partner Page:** Partnership opportunities, contact form, downloadable impact reports.
- **Location/GIS Page:** Map showing MAKU's operational area, borehole locations, market sites.
- **Find MAKU:** Contact details, directions, office hours.
- **News & Updates:** Blog/announcements section.
- CMS for admin to update content without code changes.
- Optimised for low-bandwidth / mobile-first.

---

## 26. Module M29 — PWA Shell & Offline Support

### 26.1 Functional Requirements
- Web app installable as a PWA on Android and iOS home screens.
- Service worker caches key pages and data for offline access.
- Offline-capable forms: member registration, transaction entry — data queued and synced when online.
- "You are offline" indicator with clear sync status.
- Push notifications for approvals and alerts (where browser supports).

### 26.2 Non-Functional Requirements
- Lighthouse PWA score ≥ 90.
- App shell loads in < 3 seconds on 3G.
- Background sync on reconnection.

---

## 27. Module M30 — Mobile Admin App (Phase 5+)

### 27.1 Description
A dedicated mobile application for MAKU administrators and field officers. Built with **React Native** to target both Android and iOS from a single codebase.

### 27.2 Functional Requirements
- Full authentication (M01) including biometric login (fingerprint/face ID).
- Member register: view, search, add, and approve member profiles from the field.
- Transaction capture: livestock marketing, water vouchers, commodity collection — offline-first.
- Push notifications for approvals, alerts, and messages.
- Dashboard with key KPIs.
- Camera integration: capture member photos, scan national IDs (OCR assist).
- GPS capture: record member homestead location.
- Sync engine: queue actions offline, conflict resolution on sync.

### 27.3 Non-Functional Requirements
- Supports Android 8+ and iOS 14+.
- APK distributed via Google Play (and potentially a direct download link for field devices).
- App size < 30 MB initial download.
- All sensitive data encrypted on device (AES-256).

---

## 28. Integrations

| Integration | Purpose | Module(s) |
|------------|---------|-----------|
| M-Pesa (Daraja API) | Payment collection & confirmation | M05, M07, M08, M09 |
| Africa's Talking (or Twilio) | SMS notifications & OTP | M01, M21 |
| Google Maps / Leaflet.js | GIS mapping | M02, M07, M26, M28 |
| Email (SendGrid / SES) | Transactional email | M01, M21, M27 |
| Cloud Storage (S3-compatible) | Documents & photos | M02, M19 |
| OCR (optional) | National ID scanning in mobile app | M30 |

---

## 29. Technology Stack (Proposed)

| Layer | Technology |
|-------|-----------|
| Frontend (Web) | React + TypeScript |
| PWA | Workbox / Vite PWA plugin |
| Mobile App | React Native (Expo managed workflow) |
| Backend API | Node.js + Express (or NestJS) |
| Database | PostgreSQL |
| Auth | JWT + Refresh Tokens, bcrypt |
| File Storage | MinIO (self-hosted, S3-compatible) |
| Hosting | Managed VPS — Docker Compose + Nginx |
| CI/CD | GitHub Actions |

---

## 30. Non-Functional Requirements (System-Wide)

- **Performance:** API responses < 500ms at p95 under normal load.
- **Availability:** 99.5% uptime SLA; maintenance windows communicated 48 hrs in advance.
- **Security:** OWASP Top 10 mitigations applied; data encrypted at rest and in transit.
- **Scalability:** Architecture supports horizontal scaling.
- **Accessibility:** WCAG 2.1 AA on all public and authenticated pages.
- **Localisation:** English primary; Swahili support in later phase.
- **Browser Support:** Chrome, Firefox, Safari, Edge (last 2 major versions); mobile Chrome/Safari.
- **Data Residency:** Preference for Kenya-region or Africa-region cloud hosting where available.
- **Backup:** Automated daily database backups retained for 30 days.

---

## 31. Success Criteria

- All active MAKU members registered and searchable within 30 days of go-live.
- All livestock market transactions recorded digitally within 60 days of go-live.
- Finance module reconciled monthly with zero manual spreadsheet dependency within 90 days.
- PWA used by field officers for offline data capture within 60 days.
- Mobile Admin App available on Google Play within Phase 5 timeline.
- Zero critical security vulnerabilities in production at any time.
