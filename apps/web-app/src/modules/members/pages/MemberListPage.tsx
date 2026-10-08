import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UserPlus, Search, Download, Upload, ChevronLeft, ChevronRight,
  X, Users,
} from 'lucide-react';
import { Button, Badge, Spinner } from '@maku/ui';
import { formatDate } from '@maku/utils';
import { useMemberList, useImportMembers } from '../hooks/useMembers';
import { membersService } from '../services/members.service';
import { MemberApprovalQueue } from '../components/MemberApprovalQueue';
import { useCigList } from '../../cigs/hooks/useCigs';
import type { MemberListFilters } from '@maku/shared-types';
import { MemberStatus, Gender } from '@maku/shared-types';

const statusVariant: Record<MemberStatus, 'green' | 'yellow' | 'red' | 'gray'> = {
  [MemberStatus.ACTIVE]:   'green',
  [MemberStatus.PENDING]:  'yellow',
  [MemberStatus.INACTIVE]: 'gray',
  [MemberStatus.DECEASED]: 'red',
};

const ALL = '';

export default function MemberListPage() {
  const navigate = useNavigate();

  // ── Filter state ──────────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [committedSearch, setCommittedSearch] = useState('');
  const [status, setStatus] = useState<string>(ALL);
  const [gender, setGender] = useState<string>(ALL);
  const [cigId, setCigId] = useState<string>(ALL);
  const [page, setPage] = useState(1);
  const perPage = 25;

  const filters: MemberListFilters = {
    search: committedSearch || undefined,
    status: status ? (status as MemberStatus) : undefined,
    gender: gender ? (gender as Gender) : undefined,
    cigId: cigId || undefined,
    page,
    perPage,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  };

  const { data, isLoading } = useMemberList(filters);
  const { data: cigs = [] } = useCigList();
  const importMutation = useImportMembers();

  const members = data?.data ?? [];
  const meta = data?.meta;

  // Active filter count (for badge)
  const activeFilters = [status, gender, cigId].filter(Boolean).length;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setCommittedSearch(search);
    setPage(1);
  }

  function clearFilters() {
    setSearch('');
    setCommittedSearch('');
    setStatus(ALL);
    setGender(ALL);
    setCigId(ALL);
    setPage(1);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) importMutation.mutate(file);
    e.target.value = '';
  }

  return (
    <div className="page-container space-y-4">

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="section-heading">Member Register</h1>
          {meta && (
            <p className="text-sm text-gray-500 mt-0.5">
              {meta.total.toLocaleString()} member{meta.total !== 1 ? 's' : ''}
              {activeFilters > 0 && (
                <span className="ml-2 text-brand-600 font-medium">
                  ({activeFilters} filter{activeFilters !== 1 ? 's' : ''} active)
                </span>
              )}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={membersService.exportUrl(filters)}
            download
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Download size={14} /> Export CSV
          </a>
          <label className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
            <Upload size={14} />
            {importMutation.isPending ? 'Importing…' : 'Import CSV'}
            <input type="file" accept=".csv" className="sr-only" onChange={handleImport} />
          </label>
          <Link to="/members/new">
            <Button size="sm">
              <UserPlus size={14} /> Add Member
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Pending approvals ─────────────────────────────────────────── */}
      <MemberApprovalQueue />

      {/* ── Import result ─────────────────────────────────────────────── */}
      {importMutation.isSuccess && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-800">
          Import complete: <strong>{importMutation.data.imported}</strong> imported,{' '}
          <strong>{importMutation.data.skipped}</strong> skipped.
          {importMutation.data.errors.length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer font-medium">
                {importMutation.data.errors.length} row errors
              </summary>
              <ul className="mt-1 space-y-0.5 text-xs text-red-700">
                {importMutation.data.errors.map((e) => (
                  <li key={e.row}>Row {e.row}: {e.reason}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      {/* ── Search + filters ──────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 space-y-3">
        {/* Search row */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, national ID, phone, member no."
              className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-9 pr-3 text-sm focus:border-brand-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-600/20"
            />
          </div>
          <Button type="submit" size="sm" variant="secondary">Search</Button>
          {(committedSearch || activeFilters > 0) && (
            <Button type="button" size="sm" variant="ghost" onClick={clearFilters}>
              <X size={14} /> Clear all
            </Button>
          )}
        </form>

        {/* Filter row */}
        <div className="flex flex-wrap gap-2">
          {/* Status */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-medium text-gray-500 shrink-0">Status</label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
            >
              <option value={ALL}>All statuses</option>
              {Object.values(MemberStatus).map((s) => (
                <option key={s} value={s} className="capitalize">{s}</option>
              ))}
            </select>
          </div>

          {/* Gender */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-medium text-gray-500 shrink-0">Gender</label>
            <select
              value={gender}
              onChange={(e) => { setGender(e.target.value); setPage(1); }}
              className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
            >
              <option value={ALL}>All genders</option>
              {Object.values(Gender).map((g) => (
                <option key={g} value={g} className="capitalize">{g}</option>
              ))}
            </select>
          </div>

          {/* CIG */}
          {cigs.length > 0 && (
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-medium text-gray-500 shrink-0">CIG</label>
              <select
                value={cigId}
                onChange={(e) => { setCigId(e.target.value); setPage(1); }}
                className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20 max-w-[200px]"
              >
                <option value={ALL}>All CIGs</option>
                {cigs.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Active filter pills */}
          {status && (
            <button
              onClick={() => { setStatus(ALL); setPage(1); }}
              className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-1 text-xs font-medium text-brand-700 hover:bg-brand-200 transition-colors"
            >
              {status} <X size={11} />
            </button>
          )}
          {gender && (
            <button
              onClick={() => { setGender(ALL); setPage(1); }}
              className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-1 text-xs font-medium text-brand-700 hover:bg-brand-200 transition-colors"
            >
              {gender} <X size={11} />
            </button>
          )}
          {cigId && (
            <button
              onClick={() => { setCigId(ALL); setPage(1); }}
              className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-1 text-xs font-medium text-brand-700 hover:bg-brand-200 transition-colors"
            >
              <Users size={11} />
              {cigs.find((c) => c.id === cigId)?.name ?? 'CIG'}
              <X size={11} />
            </button>
          )}
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Member No.', 'Full Name', 'Phone', 'Sub-location', 'CIGs', 'Status', 'Registered', ''].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading && (
              <tr>
                <td colSpan={8} className="py-12 text-center">
                  <Spinner className="mx-auto" />
                </td>
              </tr>
            )}
            {!isLoading && members.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <UserPlus size={28} className="text-gray-300" />
                    <p className="text-sm text-gray-400">
                      {committedSearch || activeFilters > 0
                        ? 'No members match your filters'
                        : 'No members yet'}
                    </p>
                    {(committedSearch || activeFilters > 0) && (
                      <button onClick={clearFilters} className="text-xs text-brand-700 hover:underline">
                        Clear filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
            {members.map((m) => (
              <tr
                key={m.id}
                className="hover:bg-warm-50 cursor-pointer transition-colors group"
                onClick={() => navigate(`/members/${m.id}`)}
              >
                <td className="px-4 py-3">
                  {m.memberNumber ? (
                    <span className="font-mono text-xs text-gray-500">{m.memberNumber}</span>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-gray-900 group-hover:text-brand-700 transition-colors">
                  {m.fullName}
                </td>
                <td className="px-4 py-3 text-gray-600">{m.phonePrimary}</td>
                <td className="px-4 py-3 text-gray-500">{m.subLocation ?? '—'}</td>

                {/* CIG column */}
                <td className="px-4 py-3">
                  {m.cigs && m.cigs.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {m.cigs.slice(0, 2).map((c) => (
                        <span
                          key={c.id}
                          className="inline-flex items-center gap-1 rounded-full bg-brand-50 border border-brand-200 px-2 py-0.5 text-[10px] font-medium text-brand-700"
                        >
                          <Users size={9} />
                          {c.name.length > 18 ? c.name.slice(0, 18) + '…' : c.name}
                        </span>
                      ))}
                      {m.cigs.length > 2 && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500 font-medium">
                          +{m.cigs.length - 2}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </td>

                <td className="px-4 py-3">
                  <Badge variant={statusVariant[m.status]}>{m.status}</Badge>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(m.registrationDate)}</td>
                <td className="px-4 py-3">
                  <Link
                    to={`/members/${m.id}`}
                    className="text-xs text-brand-700 hover:underline font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ────────────────────────────────────────────────── */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span className="text-xs text-gray-500">
            Showing {((meta.page - 1) * meta.perPage) + 1}–{Math.min(meta.page * meta.perPage, meta.total)} of {meta.total.toLocaleString()}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="secondary"
              size="sm"
              disabled={meta.page <= 1}
              onClick={() => setPage((p) => p - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft size={14} />
            </Button>
            <span className="px-3 text-xs font-medium">
              {meta.page} / {meta.totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={meta.page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              aria-label="Next page"
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
