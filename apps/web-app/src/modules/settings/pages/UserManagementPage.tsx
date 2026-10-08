import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  UserPlus, X, Shield, ChevronDown, AlertTriangle,
} from 'lucide-react';
import { Button, Input, Card, Badge, Avatar, Spinner } from '@maku/ui';
import { formatDateTime } from '@maku/utils';
import { useUserList, useCreateUser, useUpdateUserRoleStatus, useDeactivateUser } from '../hooks/useUsers';
import { useAuthStore } from '../../../shared/store/auth.store';
import { UserRole, UserStatus } from '@maku/shared-types';
import type { UserProfile } from '@maku/shared-types';

// ─── Role config ─────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]:    'Super Admin',
  [UserRole.ADMIN]:          'Admin',
  [UserRole.FINANCE_OFFICER]:'Finance Officer',
  [UserRole.FIELD_OFFICER]:  'Field Officer',
  [UserRole.CIG_COORDINATOR]:'CIG Coordinator',
  [UserRole.MEMBER]:         'Member',
  [UserRole.VIEWER]:         'Viewer',
};

const ROLE_DESC: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]:    'Full system access',
  [UserRole.ADMIN]:          'Manage members, CIGs, operations',
  [UserRole.FINANCE_OFFICER]:'Finance & procurement access',
  [UserRole.FIELD_OFFICER]:  'Register members, record field data',
  [UserRole.CIG_COORDINATOR]:'Manage assigned CIGs',
  [UserRole.MEMBER]:         'Member portal access only',
  [UserRole.VIEWER]:         'Read-only access',
};

const STATUS_VARIANT: Record<UserStatus, 'green' | 'yellow' | 'red' | 'gray'> = {
  [UserStatus.ACTIVE]:      'green',
  [UserStatus.PENDING]:     'yellow',
  [UserStatus.SUSPENDED]:   'red',
  [UserStatus.DEACTIVATED]: 'gray',
};

// ─── Create user form schema ──────────────────────────────────────────────────

const createSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email:    z.string().email('Enter a valid email'),
  phone:    z.string().regex(/^(\+?254|0)7\d{8}$/, 'Enter a valid Kenyan mobile number'),
  role:     z.nativeEnum(UserRole),
  password: z.string().min(8, 'Minimum 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
type CreateForm = z.infer<typeof createSchema>;

// ─── Inline role/status editor ────────────────────────────────────────────────

function UserRoleStatusEditor({
  user,
  currentUserId,
}: {
  user: UserProfile;
  currentUserId: string;
}) {
  const updateMutation = useUpdateUserRoleStatus();
  const deactivateMutation = useDeactivateUser();
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const isSelf = user.id === currentUserId;

  return (
    <div className="flex items-center gap-2">
      {/* Role selector */}
      <div className="relative">
        <select
          value={user.role}
          disabled={isSelf}
          onChange={(e) =>
            updateMutation.mutate({ id: user.id, data: { role: e.target.value as UserRole } })
          }
          className="appearance-none rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 pr-7 text-xs font-medium text-gray-700 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={`Role for ${user.fullName}`}
        >
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <ChevronDown size={11} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>

      {/* Status selector */}
      <div className="relative">
        <select
          value={user.status}
          disabled={isSelf}
          onChange={(e) =>
            updateMutation.mutate({ id: user.id, data: { status: e.target.value as UserStatus } })
          }
          className="appearance-none rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 pr-7 text-xs font-medium text-gray-700 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={`Status for ${user.fullName}`}
        >
          {Object.values(UserStatus).map((s) => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>
        <ChevronDown size={11} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>

      {/* Deactivate */}
      {!isSelf && user.status !== UserStatus.DEACTIVATED && (
        confirmDeactivate ? (
          <div className="flex gap-1">
            <button
              onClick={() => {
                deactivateMutation.mutate(user.id);
                setConfirmDeactivate(false);
              }}
              className="rounded-lg bg-red-100 px-2 py-1 text-[10px] font-medium text-red-700 hover:bg-red-200 transition-colors"
            >
              Confirm
            </button>
            <button
              onClick={() => setConfirmDeactivate(false)}
              className="rounded-lg bg-gray-100 px-2 py-1 text-[10px] text-gray-600 hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDeactivate(true)}
            title="Deactivate account"
            className="rounded-lg p-1.5 text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <X size={13} />
          </button>
        )
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function UserManagementPage() {
  const [showCreate, setShowCreate] = useState(false);
  const currentUser = useAuthStore((s) => s.user);

  const { data, isLoading } = useUserList();
  const createMutation = useCreateUser();

  const users = data?.data ?? [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { role: UserRole.FIELD_OFFICER },
  });

  function onSubmit(values: CreateForm) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...payload } = values;
    createMutation.mutate(payload, {
      onSuccess: () => {
        reset();
        setShowCreate(false);
      },
    });
  }

  // Group users by role for display
  const roleGroups: Partial<Record<UserRole, UserProfile[]>> = {};
  users.forEach((u) => {
    if (!roleGroups[u.role]) roleGroups[u.role] = [];
    roleGroups[u.role]!.push(u);
  });

  return (
    <div className="page-container max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
            <Shield size={20} />
          </div>
          <div>
            <h1 className="section-heading">User Management</h1>
            <p className="text-sm text-gray-500">
              {users.length} user{users.length !== 1 ? 's' : ''} · manage roles and access
            </p>
          </div>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <UserPlus size={14} /> Add User
        </Button>
      </div>

      {/* Role reference card */}
      <Card>
        <h2 className="font-semibold text-gray-800 text-sm mb-3">Role Reference</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(ROLE_LABELS).map(([role, label]) => (
            <div key={role} className="flex items-start gap-2 rounded-lg bg-gray-50 px-3 py-2">
              <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-brand-600" />
              <div>
                <p className="text-xs font-semibold text-gray-800">{label}</p>
                <p className="text-[10px] text-gray-500">{ROLE_DESC[role as UserRole]}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Users table */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : (
        <Card padding="none">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 text-sm">System Users</h2>
          </div>
          <table className="min-w-full divide-y divide-gray-50 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['User', 'Role', 'Status', 'Last Login', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-warm-50 transition-colors">
                  {/* User */}
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.fullName} src={u.avatarUrl} size="sm" />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {u.fullName}
                          {u.id === currentUser?.id && (
                            <span className="ml-1.5 rounded-full bg-brand-100 px-1.5 py-0.5 text-[9px] font-bold text-brand-700 uppercase">You</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-5 py-3">
                    <span className="text-xs font-medium text-gray-700">
                      {ROLE_LABELS[u.role]}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3">
                    <Badge variant={STATUS_VARIANT[u.status]}>{u.status}</Badge>
                  </td>

                  {/* Last login */}
                  <td className="px-5 py-3 text-xs text-gray-400">
                    {u.lastLoginAt ? formatDateTime(u.lastLoginAt) : 'Never'}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3">
                    <UserRoleStatusEditor user={u} currentUserId={currentUser?.id ?? ''} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* ── Create User Modal ────────────────────────────────────────── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                  <UserPlus size={16} />
                </div>
                <h2 className="font-semibold text-gray-900">Add System User</h2>
              </div>
              <button
                onClick={() => { setShowCreate(false); reset(); }}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="px-6 py-5 space-y-4">
              <Input
                label="Full name"
                required
                error={errors.fullName?.message}
                {...register('fullName')}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Email address"
                  type="email"
                  autoComplete="off"
                  required
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Input
                  label="Phone number"
                  type="tel"
                  hint="e.g. 0712345678"
                  required
                  error={errors.phone?.message}
                  {...register('phone')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('role')}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
                >
                  {Object.entries(ROLE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label} — {ROLE_DESC[value as UserRole]}
                    </option>
                  ))}
                </select>
                {errors.role && <p className="mt-1 text-xs text-red-600">{errors.role.message}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Temporary password"
                  type="password"
                  autoComplete="new-password"
                  required
                  hint="Min 8 characters"
                  error={errors.password?.message}
                  {...register('password')}
                />
                <Input
                  label="Confirm password"
                  type="password"
                  autoComplete="new-password"
                  required
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />
              </div>

              <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2">
                <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-600" />
                <p className="text-xs text-amber-700">
                  The user will log in with this temporary password. They should change it on first login.
                </p>
              </div>

              <div className="flex gap-3 pt-1">
                <Button type="submit" loading={createMutation.isPending} className="flex-1">
                  Create User
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => { setShowCreate(false); reset(); }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
