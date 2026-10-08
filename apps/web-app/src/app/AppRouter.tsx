import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { Spinner } from '@maku/ui';

// ─── Auth ────────────────────────────────────────────────────────────────────
const LoginPage = lazy(() => import('../modules/auth/pages/LoginPage'));
const ForgotPasswordPage = lazy(() => import('../modules/auth/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../modules/auth/pages/ResetPasswordPage'));
const MemberSelfRegisterPage = lazy(() => import('../modules/auth/pages/MemberSelfRegisterPage'));
const UserProfilePage = lazy(() => import('../modules/auth/pages/UserProfilePage'));

// ─── Dashboard ───────────────────────────────────────────────────────────────
const DashboardPage = lazy(() => import('../modules/dashboard/pages/DashboardPage'));

// ─── Members ─────────────────────────────────────────────────────────────────
const MemberListPage = lazy(() => import('../modules/members/pages/MemberListPage'));
const MemberCreatePage = lazy(() => import('../modules/members/pages/MemberCreatePage'));
const MemberProfilePage = lazy(() => import('../modules/members/pages/MemberProfilePage'));

// ─── CIGs ────────────────────────────────────────────────────────────────────
const CigListPage = lazy(() => import('../modules/cigs/pages/CigListPage'));
const CigDetailPage = lazy(() => import('../modules/cigs/pages/CigDetailPage'));

// ─── Operations ──────────────────────────────────────────────────────────────
const LivestockPage = lazy(() => import('../modules/livestock/pages/LivestockPage'));
const FeedlotPage = lazy(() => import('../modules/feedlot/pages/FeedlotPage'));
const WaterVouchersPage = lazy(() => import('../modules/water-vouchers/pages/WaterVouchersPage'));

// ─── Commodities ─────────────────────────────────────────────────────────────
const CommoditiesPage = lazy(() => import('../modules/commodities/pages/CommoditiesPage'));
const HoneyPage = lazy(() => import('../modules/commodities/pages/HoneyPage'));
const ConservationPage = lazy(() => import('../modules/commodities/pages/ConservationPage'));
const HidesPage = lazy(() => import('../modules/commodities/pages/HidesPage'));
const PoultryPage = lazy(() => import('../modules/commodities/pages/PoultryPage'));
const BonesPage = lazy(() => import('../modules/commodities/pages/BonesPage'));
const DairyPage = lazy(() => import('../modules/commodities/pages/DairyPage'));

// ─── Finance ─────────────────────────────────────────────────────────────────
const FinancePage        = lazy(() => import('../modules/finance/pages/FinancePage'));
const PurchasesSalesPage = lazy(() => import('../modules/purchases/pages/PurchasesSalesPage'));
const ProcurementPage    = lazy(() => import('../modules/procurement/pages/ProcurementPage'));

// ─── People ──────────────────────────────────────────────────────────────────
const StaffPage     = lazy(() => import('../modules/staff/pages/StaffPage'));
const SuppliersPage = lazy(() => import('../modules/suppliers/pages/SuppliersPage'));

// ─── Partnerships ────────────────────────────────────────────────────────────
const NgosPage = lazy(() => import('../modules/ngos/pages/NgosPage'));
const GrantsPage = lazy(() => import('../modules/grants/pages/GrantsPage'));
const ProjectsPage = lazy(() => import('../modules/projects/pages/ProjectsPage'));

// ─── Tools ───────────────────────────────────────────────────────────────────
const DocumentsPage = lazy(() => import('../modules/documents/pages/DocumentsPage'));
const CommunicationsPage = lazy(() => import('../modules/communications/pages/CommunicationsPage'));
const AuditPage = lazy(() => import('../modules/audit/pages/AuditPage'));
const ReportsPage = lazy(() => import('../modules/reports/pages/ReportsPage'));

// ─── Settings ────────────────────────────────────────────────────────────────
const SettingsPage = lazy(() => import('../modules/settings/pages/SettingsPage'));
const UserManagementPage = lazy(() => import('../modules/settings/pages/UserManagementPage'));
const SystemSettingsPage = lazy(() => import('../modules/settings/pages/SystemSettingsPage'));

function PageLoader() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

export function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ── Public ─────────────────────────────────────────────────────── */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/register" element={<MemberSelfRegisterPage />} />

        {/* ── Protected — wrapped in AppLayout ───────────────────────────── */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard & Reports */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/reports" element={<ReportsPage />} />

          {/* Members */}
          <Route path="/members" element={<MemberListPage />} />
          <Route path="/members/new" element={<MemberCreatePage />} />
          <Route path="/members/:id" element={<MemberProfilePage />} />

          {/* CIGs */}
          <Route path="/cigs" element={<CigListPage />} />
          <Route path="/cigs/:id" element={<CigDetailPage />} />

          {/* Operations */}
          <Route path="/livestock" element={<LivestockPage />} />
          <Route path="/feedlot" element={<FeedlotPage />} />
          <Route path="/water-vouchers" element={<WaterVouchersPage />} />

          {/* Commodities */}
          <Route path="/commodities" element={<CommoditiesPage />} />
          <Route path="/commodities/honey" element={<HoneyPage />} />
          <Route path="/commodities/conservation" element={<ConservationPage />} />
          <Route path="/commodities/hides" element={<HidesPage />} />
          <Route path="/commodities/poultry" element={<PoultryPage />} />
          <Route path="/commodities/bones" element={<BonesPage />} />
          <Route path="/commodities/dairy" element={<DairyPage />} />

          {/* Finance */}
          <Route path="/finance" element={<FinancePage />} />
          <Route path="/finance/petty-cash" element={<FinancePage />} />
          <Route path="/finance/purchases" element={<PurchasesSalesPage />} />
          <Route path="/procurement" element={<ProcurementPage />} />

          {/* People */}
          <Route path="/staff" element={<StaffPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />

          {/* Partnerships */}
          <Route path="/ngos" element={<NgosPage />} />
          <Route path="/grants" element={<GrantsPage />} />
          <Route path="/projects" element={<ProjectsPage />} />

          {/* Tools */}
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/communications" element={<CommunicationsPage />} />
          <Route path="/audit" element={<AuditPage />} />

          {/* Settings */}
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/users" element={<UserManagementPage />} />
          <Route path="/settings/system" element={<SystemSettingsPage />} />

          {/* Profile */}
          <Route path="/profile" element={<UserProfilePage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
