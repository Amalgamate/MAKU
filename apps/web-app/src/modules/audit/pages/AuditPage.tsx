import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Shield, Search } from 'lucide-react';
import { Badge, Card, Spinner } from '@maku/ui';
import { formatDateTime } from '@maku/utils';
import { apiClient } from '../../../shared/services/api.client';

interface AuditEntry {
  id: string;
  entityType: string;
  entityId: string;
  action: 'create' | 'update' | 'delete';
  userId: string | null;
  userFullName: string | null;
  ipAddress: string | null;
  createdAt: string;
  previousValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
}

const ACTION_VARIANT = { create: 'green', update: 'blue', delete: 'red' } as const;

function useAuditLogs(filters: Record<string, string>) {
  const params = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, v]) => v)));
  return useQuery({
    queryKey: ['audit', filters],
    queryFn: async () => {
      const res = await apiClient.get<{ data: { data: AuditEntry[]; meta: { page: number; perPage: number; total: number; totalPages: number } }; message: string }>(
        `/audit-logs?${params}&page=1&perPage=50`,
      );
      return res.data.data;
    },
    staleTime: 1000 * 30,
  });
}

export default function AuditPage() {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const { data, isLoading } = useAuditLogs(filters);
  const [expanded, setExpanded] = useState<string | null>(null);

  const logs = data?.data ?? [];

  return (
    <div className="page-container space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
          <Shield size={20} />
        </div>
        <div>
          <h1 className="section-heading">Audit Trail</h1>
          <p className="text-sm text-gray-500">
            Immutable log of every action — who did what and when.
            {data?.meta?.total ? ` ${data.meta.total.toLocaleString()} entries.` : ''}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select
          onChange={(e) => setFilters((f) => ({ ...f, action: e.target.value }))}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 focus:border-brand-600 focus:outline-none"
        >
          <option value="">All actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
        </select>

        <select
          onChange={(e) => setFilters((f) => ({ ...f, entityType: e.target.value }))}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 focus:border-brand-600 focus:outline-none"
        >
          <option value="">All modules</option>
          {['Member','User','Cig','LivestockTransaction','WaterVoucher','FinanceTransaction','Supplier','PurchaseTransaction','ProcurementOrder'].map((t) => (
            <option key={t} value={t}>{t.replace(/([A-Z])/g, ' $1').trim()}</option>
          ))}
        </select>

        <input
          type="date"
          onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700"
        />
      </div>

      {/* Log table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Timestamp', 'User', 'Action', 'Module', 'Record ID', 'IP Address', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading && (
              <tr><td colSpan={7} className="py-10 text-center"><Spinner className="mx-auto" /></td></tr>
            )}
            {!isLoading && logs.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <Shield size={28} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm text-gray-400">No audit entries yet — actions will appear here as the system is used.</p>
                </td>
              </tr>
            )}
            {logs.map((log) => (
              <>
                <tr
                  key={log.id}
                  className="hover:bg-warm-50 cursor-pointer transition-colors"
                  onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                >
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {formatDateTime(log.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-medium text-gray-800">{log.userFullName ?? 'System'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={ACTION_VARIANT[log.action] ?? 'gray'}>{log.action}</Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {log.entityType.replace(/([A-Z])/g, ' $1').trim()}
                  </td>
                  <td className="px-4 py-3 font-mono text-[10px] text-gray-400">
                    {log.entityId.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{log.ipAddress ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-brand-700">
                    {expanded === log.id ? '▲' : '▼'}
                  </td>
                </tr>
                {expanded === log.id && (
                  <tr key={`${log.id}-detail`} className="bg-gray-50">
                    <td colSpan={7} className="px-6 py-3">
                      <div className="grid gap-4 sm:grid-cols-2 text-xs">
                        {log.previousValue && (
                          <div>
                            <p className="font-semibold text-gray-600 mb-1">Before</p>
                            <pre className="rounded-lg bg-white border border-gray-200 p-3 text-[10px] text-gray-600 overflow-auto max-h-40">
                              {JSON.stringify(log.previousValue, null, 2)}
                            </pre>
                          </div>
                        )}
                        {log.newValue && (
                          <div>
                            <p className="font-semibold text-gray-600 mb-1">After</p>
                            <pre className="rounded-lg bg-white border border-gray-200 p-3 text-[10px] text-gray-600 overflow-auto max-h-40">
                              {JSON.stringify(log.newValue, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
