import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Download, Users, Beef, Droplets, Landmark, TrendingUp, FileText } from 'lucide-react';
import { Card, Spinner, Badge } from '@maku/ui';
import { formatDate, formatCurrency } from '@maku/utils';
import { apiClient } from '../../../shared/services/api.client';
import type { DashboardKpis } from '@maku/shared-types';

// ─── Data hooks ───────────────────────────────────────────────────────────────

function useAllData(from?: string, to?: string) {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to)   params.set('to', to);

  const kpis = useQuery({
    queryKey: ['reports', 'kpis'],
    queryFn: async () => {
      const res = await apiClient.get<{ data: DashboardKpis; message: string }>('/dashboard/kpis');
      return res.data.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const livestock = useQuery({
    queryKey: ['reports', 'livestock', from, to],
    queryFn: async () => {
      const res = await apiClient.get<{ data: { totalTransactions: number; totalAnimals: number; totalValue: number; totalCommission: number; totalProceeds: number; bySpecies: Record<string, { count: number; animals: number; value: number }> }; message: string }>(
        `/livestock/summary?${params}`,
      );
      return res.data.data;
    },
  });

  const vouchers = useQuery({
    queryKey: ['reports', 'vouchers', from, to],
    queryFn: async () => {
      const res = await apiClient.get<{ data: { totalIssued: number; totalLitresAllocated: number; totalLitresUsed: number; totalCost: number; byStatus: Record<string, number> }; message: string }>(
        `/water-vouchers/summary?${params}`,
      );
      return res.data.data;
    },
  });

  const finance = useQuery({
    queryKey: ['reports', 'finance', from, to],
    queryFn: async () => {
      const res = await apiClient.get<{ data: { totalIncome: number; totalExpense: number; netBalance: number; transactionCount: number; byCategory: Record<string, { income: number; expense: number }> }; message: string }>(
        `/finance/transactions/summary?${params}`,
      );
      return res.data.data;
    },
  });

  return { kpis, livestock, vouchers, finance };
}

// ─── Report section card ──────────────────────────────────────────────────────

function ReportSection({ title, icon, children, loading }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; loading?: boolean;
}) {
  return (
    <Card padding="none">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
          {icon}
        </div>
        <h2 className="font-semibold text-gray-800 text-sm">{title}</h2>
      </div>
      {loading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : (
        <div className="px-5 py-4">{children}</div>
      )}
    </Card>
  );
}

function StatRow({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="text-right">
        <span className="text-sm font-semibold text-gray-900">{value}</span>
        {sub && <p className="text-[10px] text-gray-400">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const { kpis, livestock, vouchers, finance } = useAllData(from || undefined, to || undefined);

  function downloadJson(name: string, data: unknown) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `maku-${name}-${new Date().toISOString().slice(0,10)}.json`;
    a.click(); URL.revokeObjectURL(url);
  }

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
            <BarChart3 size={20} />
          </div>
          <div>
            <h1 className="section-heading">Reports</h1>
            <p className="text-sm text-gray-500">Summary across all modules — filter by date range</p>
          </div>
        </div>

        {/* Date filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-xs text-gray-500 font-medium">From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs focus:border-brand-600 focus:outline-none" />
          <label className="text-xs text-gray-500 font-medium">To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs focus:border-brand-600 focus:outline-none" />
          {(from || to) && (
            <button onClick={() => { setFrom(''); setTo(''); }}
              className="text-xs text-brand-700 hover:underline">Clear</button>
          )}
        </div>
      </div>

      {/* ── Membership report ──────────────────────────────────────────── */}
      <ReportSection title="Membership" icon={<Users size={16} />} loading={kpis.isLoading}>
        <div className="space-y-0">
          <StatRow label="Total members registered" value={kpis.data?.members.total ?? '—'} />
          <StatRow label="Active members" value={kpis.data?.members.active ?? '—'} />
          <StatRow label="Pending approval" value={kpis.data?.members.pending ?? '—'} />
          <StatRow label="Common Interest Groups" value={kpis.data?.members.cigs ?? '—'} />
        </div>
        <div className="mt-3 flex gap-2">
          <a href="/v1/members/export" download
            className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors">
            <Download size={12} /> Export member list (CSV)
          </a>
        </div>
      </ReportSection>

      {/* ── Livestock report ───────────────────────────────────────────── */}
      <ReportSection title="Livestock Marketing" icon={<Beef size={16} />} loading={livestock.isLoading}>
        {livestock.data && (
          <>
            <div className="space-y-0 mb-4">
              <StatRow label="Total transactions" value={livestock.data.totalTransactions} />
              <StatRow label="Total animals sold" value={livestock.data.totalAnimals} />
              <StatRow label="Total sale value" value={`KES ${livestock.data.totalValue.toLocaleString()}`} />
              <StatRow label="MAKU commission earned" value={`KES ${livestock.data.totalCommission.toLocaleString()}`} />
              <StatRow label="Member proceeds" value={`KES ${livestock.data.totalProceeds.toLocaleString()}`} />
            </div>

            {Object.keys(livestock.data.bySpecies).length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">By species</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(livestock.data.bySpecies).map(([sp, d]) => (
                    <div key={sp} className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
                      <p className="text-xs font-semibold text-gray-700 capitalize">{sp}</p>
                      <p className="text-[11px] text-gray-500">{d.animals} animals · KES {d.value.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => downloadJson('livestock', livestock.data)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200">
              <Download size={12} /> Export JSON
            </button>
          </>
        )}
      </ReportSection>

      {/* ── Water vouchers report ──────────────────────────────────────── */}
      <ReportSection title="Water Vouchers" icon={<Droplets size={16} />} loading={vouchers.isLoading}>
        {vouchers.data && (
          <div className="space-y-0">
            <StatRow label="Total vouchers issued" value={vouchers.data.totalIssued} />
            <StatRow label="Litres allocated" value={`${vouchers.data.totalLitresAllocated.toLocaleString()} L`} />
            <StatRow label="Litres actually used" value={`${vouchers.data.totalLitresUsed.toLocaleString()} L`}
              sub={vouchers.data.totalLitresAllocated > 0 ? `${((vouchers.data.totalLitresUsed / vouchers.data.totalLitresAllocated) * 100).toFixed(1)}% utilisation` : undefined} />
            <StatRow label="Total voucher cost" value={`KES ${vouchers.data.totalCost.toLocaleString()}`} />
            <StatRow label="Currently active (issued)" value={vouchers.data.byStatus['issued'] ?? 0} />
            <StatRow label="Used" value={vouchers.data.byStatus['used'] ?? 0} />
          </div>
        )}
      </ReportSection>

      {/* ── Finance report ─────────────────────────────────────────────── */}
      <ReportSection title="Finance Summary" icon={<Landmark size={16} />} loading={finance.isLoading}>
        {finance.data && (
          <>
            <div className="space-y-0 mb-4">
              <StatRow label="Total income" value={`KES ${finance.data.totalIncome.toLocaleString()}`} />
              <StatRow label="Total expenses" value={`KES ${finance.data.totalExpense.toLocaleString()}`} />
              <StatRow
                label="Net balance"
                value={`KES ${finance.data.netBalance.toLocaleString()}`}
              />
              <StatRow label="Total transactions" value={finance.data.transactionCount} />
            </div>

            {Object.keys(finance.data.byCategory).length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">By category</p>
                <div className="space-y-1">
                  {Object.entries(finance.data.byCategory)
                    .sort((a, b) => (b[1].income + b[1].expense) - (a[1].income + a[1].expense))
                    .map(([cat, vals]) => (
                      <div key={cat} className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 capitalize">{cat.replace(/_/g, ' ')}</span>
                        <div className="flex gap-3">
                          {vals.income > 0 && <span className="text-green-600">+{vals.income.toLocaleString()}</span>}
                          {vals.expense > 0 && <span className="text-red-500">-{vals.expense.toLocaleString()}</span>}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <button onClick={() => downloadJson('finance', finance.data)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200">
              <Download size={12} /> Export JSON
            </button>
          </>
        )}
      </ReportSection>

      {/* ── Monthly growth chart ───────────────────────────────────────── */}
      {kpis.data?.memberGrowth && kpis.data.memberGrowth.length > 0 && (
        <ReportSection title="Member Growth Trend" icon={<TrendingUp size={16} />}>
          <div className="space-y-1">
            {kpis.data.memberGrowth.map((r) => (
              <div key={r.month} className="flex items-center gap-3">
                <span className="w-20 text-xs text-gray-500 shrink-0">{r.month}</span>
                <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-4 bg-brand-600 rounded-full transition-all"
                    style={{ width: `${Math.min((r.count / Math.max(...kpis.data!.memberGrowth.map((x) => x.count))) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-700 w-6 text-right">{r.count}</span>
              </div>
            ))}
          </div>
        </ReportSection>
      )}

      {/* PDF/Excel note */}
      <Card>
        <div className="flex items-start gap-3">
          <FileText size={16} className="mt-0.5 shrink-0 text-gray-400" />
          <div>
            <p className="text-sm font-semibold text-gray-800">PDF & Excel export</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Formatted PDF reports and Excel exports are available via the JSON download buttons above.
              Scheduled email delivery and printable templates are on the roadmap.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
