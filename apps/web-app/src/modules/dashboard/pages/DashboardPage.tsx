import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Users, Beef, Droplets, TrendingUp, Clock,
  CheckCircle, Plus, AlertCircle,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, Badge, Spinner } from '@maku/ui';
import { useAuthStore } from '../../../shared/store/auth.store';
import { apiClient } from '../../../shared/services/api.client';
import { formatDate, formatCurrency } from '@maku/utils';
import type { DashboardKpis } from '@maku/shared-types';
import { MemberStatus } from '@maku/shared-types';

const SPECIES_COLORS: Record<string, string> = {
  cattle: '#92400e', goat: '#a33520', camel: '#b45309',
  sheep: '#854d0e', chicken: '#78350f', other: '#6b7280',
};

const STATUS_VARIANT: Record<MemberStatus, 'green' | 'yellow' | 'red' | 'gray'> = {
  [MemberStatus.ACTIVE]:   'green',
  [MemberStatus.PENDING]:  'yellow',
  [MemberStatus.INACTIVE]: 'gray',
  [MemberStatus.DECEASED]: 'red',
};

function useDashboardKpis() {
  return useQuery({
    queryKey: ['dashboard', 'kpis'],
    queryFn: async () => {
      const res = await apiClient.get<{ data: DashboardKpis; message: string }>('/dashboard/kpis');
      return res.data.data;
    },
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 5,
  });
}

function useRecentActivity() {
  return useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: async () => {
      const res = await apiClient.get<{ data: { recentMembers: Array<{ id: string; fullName: string; memberNumber: string | null; status: MemberStatus; registrationDate: string }> }; message: string }>('/dashboard/activity');
      return res.data.data;
    },
    staleTime: 1000 * 60 * 2,
  });
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: kpis, isLoading: kpisLoading } = useDashboardKpis();
  const { data: activity } = useRecentActivity();

  const memberGrowthData = kpis?.memberGrowth ?? [];
  const speciesData = kpis?.livestock.bySpecies ?? [];

  return (
    <div className="page-container space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="section-heading">
          Welcome back, {user?.fullName.split(' ')[0]} 👋
        </h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Here&apos;s what&apos;s happening with MAKU today.
        </p>
      </div>

      {/* ── KPI cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: 'Total Members',
            value: kpis?.members.total,
            sub: kpis ? `${kpis.members.active} active` : undefined,
            icon: <Users size={20} className="text-brand-700" />,
            bg: 'bg-brand-50',
            to: '/members',
          },
          {
            label: 'Pending Approval',
            value: kpis?.members.pending,
            sub: kpis?.members.pending ? 'awaiting review' : 'all up to date',
            icon: <Clock size={20} className="text-amber-600" />,
            bg: 'bg-amber-50',
            to: '/members',
          },
          {
            label: 'Livestock (Month)',
            value: kpis?.livestock.thisMonth.animals,
            sub: kpis ? `KES ${kpis.livestock.thisMonth.value.toLocaleString()}` : undefined,
            icon: <Beef size={20} className="text-orange-600" />,
            bg: 'bg-orange-50',
            to: '/livestock',
          },
          {
            label: 'Vouchers (Month)',
            value: kpis?.waterVouchers.thisMonth.issued,
            sub: kpis ? `${kpis.waterVouchers.thisMonth.litres.toLocaleString()} L` : undefined,
            icon: <Droplets size={20} className="text-blue-600" />,
            bg: 'bg-blue-50',
            to: '/water-vouchers',
          },
        ].map((k) => (
          <Link key={k.label} to={k.to}>
            <Card padding="sm" className="hover:border-gray-300 hover:shadow-md transition-all cursor-pointer h-full">
              <div className={`mb-3 inline-flex rounded-xl p-2.5 ${k.bg}`}>{k.icon}</div>
              {kpisLoading || k.value === undefined ? (
                <div className="h-8 flex items-center"><Spinner size="sm" /></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900 leading-tight">
                  {typeof k.value === 'number' ? k.value.toLocaleString() : k.value}
                </p>
              )}
              <p className="text-xs font-medium text-gray-700 mt-0.5">{k.label}</p>
              {k.sub && <p className="text-[11px] text-gray-400 mt-0.5">{k.sub}</p>}
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ── Member growth chart ──────────────────────────────────── */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800 text-sm">Member Growth (6 months)</h2>
            <Link to="/members" className="text-xs text-brand-700 hover:underline">View all →</Link>
          </div>
          {memberGrowthData.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-sm text-gray-400">
              Not enough data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={memberGrowthData} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
                <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                  formatter={(v) => [v, 'Members registered']}
                />
                <Bar dataKey="count" fill="#a33520" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* ── Livestock by species ─────────────────────────────────── */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800 text-sm">Livestock by Species (All Time)</h2>
            <Link to="/livestock" className="text-xs text-brand-700 hover:underline">View all →</Link>
          </div>
          {speciesData.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center gap-2 text-sm text-gray-400">
              <Beef size={24} className="text-gray-300" />
              No livestock transactions yet
              <Link to="/livestock">
                <button className="mt-1 inline-flex items-center gap-1 rounded-lg bg-brand-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-800">
                  <Plus size={12} /> Record first sale
                </button>
              </Link>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={speciesData} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
                <XAxis dataKey="species" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                  formatter={(v, name) => [v, name === 'animals' ? 'Animals sold' : 'Value (KES)']}
                />
                <Bar dataKey="animals" radius={[4, 4, 0, 0]}>
                  {speciesData.map((entry) => (
                    <Cell key={entry.species} fill={SPECIES_COLORS[entry.species] ?? '#6b7280'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ── Recent members ───────────────────────────────────────── */}
        <Card padding="none">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 text-sm">Recent Registrations</h2>
            <Link to="/members" className="text-xs text-brand-700 hover:underline font-medium">View all →</Link>
          </div>
          {!activity?.recentMembers?.length ? (
            <div className="py-8 text-center text-sm text-gray-400">No members yet</div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {activity.recentMembers.map((m) => (
                <li key={m.id}>
                  <Link to={`/members/${m.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-xs font-semibold">
                      {m.fullName.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{m.fullName}</p>
                      <p className="text-xs text-gray-400">{m.memberNumber ?? 'Pending'} · {formatDate(m.registrationDate)}</p>
                    </div>
                    <Badge variant={STATUS_VARIANT[m.status]}>{m.status}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* ── Quick actions + build progress ───────────────────────── */}
        <div className="space-y-4">
          <Card>
            <h2 className="font-semibold text-gray-800 text-sm mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Add Member',       to: '/members/new',      icon: <Users size={14} className="text-brand-700" /> },
                { label: 'Record Sale',      to: '/livestock',        icon: <Beef size={14} className="text-orange-600" /> },
                { label: 'Issue Voucher',    to: '/water-vouchers',   icon: <Droplets size={14} className="text-blue-600" /> },
                { label: 'Pending Members',  to: '/members',          icon: <CheckCircle size={14} className="text-amber-600" /> },
              ].map((a) => (
                <Link
                  key={a.label}
                  to={a.to}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2.5 text-xs font-medium text-gray-700 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 transition-all"
                >
                  {a.icon}{a.label}
                </Link>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="font-semibold text-gray-800 text-sm mb-3">Build Progress</h2>
            <div className="space-y-2.5">
              {[
                { phase: 'Phase 1 — Auth, Members, CIGs', pct: 100, color: 'bg-green-500' },
                { phase: 'Phase 2 — Livestock, Vouchers, Finance', pct: 100, color: 'bg-brand-600' },
                { phase: 'Phase 3 — Staff, Commodities, Procurement', pct: 100, color: 'bg-purple-500' },
                { phase: 'Phase 4 — NGOs, Grants, Projects, Reports', pct: 100, color: 'bg-amber-500' },
              ].map((p) => (
                <div key={p.phase}>
                  <div className="flex items-center justify-between text-[11px] text-gray-600 mb-1">
                    <span>{p.phase}</span>
                    <span className="font-semibold">{p.pct}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-100">
                    <div className={`h-1.5 rounded-full transition-all ${p.color}`} style={{ width: `${p.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
