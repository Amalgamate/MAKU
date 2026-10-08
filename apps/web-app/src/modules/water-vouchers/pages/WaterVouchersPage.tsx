import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Droplets, Plus, X, Search, CheckCircle } from 'lucide-react';
import { Button, Input, Card, Badge, Spinner } from '@maku/ui';
import { formatDate, formatCurrency } from '@maku/utils';
import { useWaterVoucherList, useWaterVoucherSummary, useIssueVoucher, useMarkVoucherUsed } from '../hooks/useWaterVouchers';
import { useMemberList } from '../../members/hooks/useMembers';
import { MemberStatus, type WaterVoucher } from '@maku/shared-types';

type VoucherStatus = WaterVoucher['status'];
const STATUS_VARIANT: Record<VoucherStatus, 'green' | 'yellow' | 'gray' | 'red'> = {
  issued: 'yellow', used: 'green', expired: 'gray', cancelled: 'red',
};

const schema = z.object({
  memberId:        z.string().uuid('Select a member'),
  litresAllocated: z.coerce.number().min(1, 'Must be at least 1 litre'),
  boreholeName:    z.string().optional(),
  costPerLitre:    z.coerce.number().min(0).optional(),
  issueDate:       z.string().min(1, 'Date required'),
  expiryDate:      z.string().optional(),
  notes:           z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function WaterVouchersPage() {
  const [showForm, setShowForm] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [markingId, setMarkingId] = useState<string | null>(null);

  const { data: listData, isLoading } = useWaterVoucherList({ page: 1, perPage: 25 });
  const { data: summary } = useWaterVoucherSummary();
  const issueMutation = useIssueVoucher();
  const markUsedMutation = useMarkVoucherUsed();

  const { data: membersData } = useMemberList({
    search: memberSearch || undefined,
    status: MemberStatus.ACTIVE,
    page: 1, perPage: 20,
  });

  const vouchers = listData?.data ?? [];

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      issueDate: new Date().toISOString().slice(0, 10),
      costPerLitre: 0,
    },
  });

  const litres = watch('litresAllocated') ?? 0;
  const costPerLitre = watch('costPerLitre') ?? 0;
  const totalCost = Number(litres) * Number(costPerLitre);

  function onSubmit(values: FormValues) {
    issueMutation.mutate(values, { onSuccess: () => { reset(); setShowForm(false); } });
  }

  return (
    <div className="page-container space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="section-heading">Borehole & Water Vouchers</h1>
          <p className="text-sm text-gray-500">Issue and track water allocation vouchers for members</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus size={14} /> Issue Voucher
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Issued', value: String(summary?.totalIssued ?? '—'), icon: <Droplets size={18} className="text-blue-600" />, bg: 'bg-blue-50' },
          { label: 'Litres Allocated', value: summary ? `${(summary.totalLitresAllocated / 1000).toFixed(1)}k L` : '—', icon: <Droplets size={18} className="text-cyan-600" />, bg: 'bg-cyan-50' },
          { label: 'Litres Used', value: summary ? `${(summary.totalLitresUsed / 1000).toFixed(1)}k L` : '—', icon: <CheckCircle size={18} className="text-green-600" />, bg: 'bg-green-50' },
          { label: 'Pending Use', value: String(summary?.byStatus.issued ?? '—'), icon: <Droplets size={18} className="text-amber-600" />, bg: 'bg-amber-50' },
        ].map((k) => (
          <Card key={k.label} padding="sm" className="hover:shadow-md transition-shadow">
            <div className={`mb-2 inline-flex rounded-xl p-2 ${k.bg}`}>{k.icon}</div>
            <p className="text-xl font-bold text-gray-900">{k.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{k.label}</p>
          </Card>
        ))}
      </div>

      {/* Voucher table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Voucher No.', 'Member', 'Borehole', 'Litres', 'Cost (KES)', 'Issue Date', 'Expiry', 'Status', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading && (
              <tr><td colSpan={9} className="py-10 text-center"><Spinner className="mx-auto" /></td></tr>
            )}
            {!isLoading && vouchers.length === 0 && (
              <tr>
                <td colSpan={9} className="py-12 text-center">
                  <Droplets size={28} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm text-gray-400">No vouchers issued yet</p>
                  <Button size="sm" className="mt-3" onClick={() => setShowForm(true)}>
                    <Plus size={13} /> Issue first voucher
                  </Button>
                </td>
              </tr>
            )}
            {vouchers.map((v) => (
              <tr key={v.id} className="hover:bg-warm-50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-brand-700 font-semibold">{v.voucherNumber}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{v.memberId.slice(0,8)}…</td>
                <td className="px-4 py-3 text-xs text-gray-700">{v.boreholeName ?? '—'}</td>
                <td className="px-4 py-3">
                  <div>
                    <span className="font-semibold text-gray-900">{v.litresAllocated.toLocaleString()}</span>
                    <span className="text-xs text-gray-400 ml-1">L</span>
                    {v.litresUsed > 0 && (
                      <div className="mt-0.5">
                        <div className="h-1 w-16 rounded-full bg-gray-100">
                          <div className="h-1 rounded-full bg-blue-500" style={{ width: `${Math.min((v.litresUsed / v.litresAllocated) * 100, 100)}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-700">{v.totalCost > 0 ? v.totalCost.toLocaleString() : '—'}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{formatDate(v.issueDate)}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{v.expiryDate ? formatDate(v.expiryDate) : '—'}</td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_VARIANT[v.status]}>{v.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  {v.status === 'issued' && (
                    markingId === v.id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => { markUsedMutation.mutate({ id: v.id, litresUsed: v.litresAllocated }); setMarkingId(null); }}
                          className="rounded-lg bg-green-100 px-2 py-1 text-[10px] font-medium text-green-700 hover:bg-green-200"
                        >
                          ✓ Confirm
                        </button>
                        <button onClick={() => setMarkingId(null)} className="rounded-lg bg-gray-100 px-2 py-1 text-[10px] text-gray-600">✕</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setMarkingId(v.id)}
                        className="text-xs text-blue-600 hover:underline font-medium"
                      >
                        Mark used
                      </button>
                    )
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Issue voucher modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700"><Droplets size={16} /></div>
                <h2 className="font-semibold text-gray-900">Issue Water Voucher</h2>
              </div>
              <button onClick={() => { setShowForm(false); reset(); }} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="px-6 py-5 space-y-4">
              {/* Member selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Member <span className="text-red-500">*</span></label>
                <div className="relative mb-2">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="search"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Search member…"
                    className="w-full rounded-lg border border-gray-300 py-2 pl-8 pr-3 text-sm focus:border-brand-600 focus:outline-none"
                  />
                </div>
                <select
                  {...register('memberId')}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
                  size={4}
                >
                  <option value="">— select member —</option>
                  {(membersData?.data ?? []).map((m) => (
                    <option key={m.id} value={m.id}>{m.memberNumber ?? 'PENDING'} — {m.fullName}</option>
                  ))}
                </select>
                {errors.memberId && <p className="mt-1 text-xs text-red-600">{errors.memberId.message}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Litres allocated" type="number" min={1} required error={errors.litresAllocated?.message} {...register('litresAllocated')} />
                <Input label="Borehole name" hint="e.g. Merti BH1" error={errors.boreholeName?.message} {...register('boreholeName')} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Cost per litre (KES)" type="number" min={0} step="0.01" hint="0 = free" error={errors.costPerLitre?.message} {...register('costPerLitre')} />
                <div className="flex flex-col justify-end">
                  <p className="text-xs text-gray-500 mb-1">Total cost</p>
                  <p className="text-lg font-bold text-brand-700">KES {totalCost.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Issue date" type="date" required error={errors.issueDate?.message} {...register('issueDate')} />
                <Input label="Expiry date" type="date" hint="Optional" error={errors.expiryDate?.message} {...register('expiryDate')} />
              </div>

              <Input label="Notes" hint="Optional" {...register('notes')} />

              <div className="flex gap-3 pt-1">
                <Button type="submit" loading={issueMutation.isPending} className="flex-1">Issue Voucher</Button>
                <Button type="button" variant="secondary" onClick={() => { setShowForm(false); reset(); }}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
