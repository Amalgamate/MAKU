import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Beef, Plus, X, Search, TrendingUp, Users, DollarSign } from 'lucide-react';
import { Button, Input, Card, Badge, Spinner } from '@maku/ui';
import { formatDate, formatCurrency } from '@maku/utils';
import { useLivestockList, useLivestockSummary, useCreateLivestockTransaction } from '../hooks/useLivestock';
import { useMemberList } from '../../members/hooks/useMembers';
import { MemberStatus } from '@maku/shared-types';

const SPECIES = ['cattle','goat','camel','sheep','chicken','other'] as const;
type Species = typeof SPECIES[number];

const SPECIES_EMOJI: Record<Species, string> = {
  cattle:'🐄', goat:'🐐', camel:'🐪', sheep:'🐑', chicken:'🐔', other:'🐾',
};

const schema = z.object({
  marketDate:       z.string().min(1, 'Date required'),
  marketLocation:   z.string().optional(),
  sellerMemberId:   z.string().uuid('Select a member'),
  buyerName:        z.string().min(2, 'Buyer name required'),
  buyerPhone:       z.string().optional(),
  species:          z.enum(SPECIES),
  quantity:         z.coerce.number().int().min(1),
  pricePerUnit:     z.coerce.number().min(1),
  makuCommission:   z.coerce.number().min(0).optional(),
  paymentMethod:    z.string().optional(),
  mpesaReference:   z.string().optional(),
  notes:            z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

// Compute derived values
function calcTotals(qty: number, price: number, commission: number) {
  const total    = qty * price;
  const proceeds = total - commission;
  return { total, proceeds };
}

export default function LivestockPage() {
  const [showForm, setShowForm] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});

  const { data: txData, isLoading } = useLivestockList({ ...filters, page: 1, perPage: 25 });
  const { data: summary } = useLivestockSummary();
  const createMutation = useCreateLivestockTransaction();

  // For member selector
  const { data: membersData } = useMemberList({
    search: memberSearch || undefined,
    status: MemberStatus.ACTIVE,
    page: 1,
    perPage: 20,
  });

  const txList = txData?.data ?? [];
  const meta   = txData?.meta;

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      marketDate: new Date().toISOString().slice(0, 10),
      species: 'cattle',
      quantity: 1,
      pricePerUnit: 0,
      makuCommission: 0,
      paymentMethod: 'cash',
    },
  });

  const qty        = watch('quantity') ?? 0;
  const price      = watch('pricePerUnit') ?? 0;
  const commission = watch('makuCommission') ?? 0;
  const { total, proceeds } = calcTotals(Number(qty), Number(price), Number(commission));

  function onSubmit(values: FormValues) {
    createMutation.mutate(values, { onSuccess: () => { reset(); setShowForm(false); } });
  }

  return (
    <div className="page-container space-y-5">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="section-heading">Livestock Marketing</h1>
          <p className="text-sm text-gray-500">Record market day transactions and track sales</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus size={14} /> Record Sale
        </Button>
      </div>

      {/* ── Summary KPI cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Transactions', value: String(summary?.totalTransactions ?? '—'), icon: <Beef size={18} className="text-amber-600" />, bg: 'bg-amber-50' },
          { label: 'Animals Sold (All)', value: String(summary?.totalAnimals ?? '—'), icon: <Users size={18} className="text-orange-600" />, bg: 'bg-orange-50' },
          { label: 'Total Value (KES)', value: summary ? formatCurrency(summary.totalValue, 'KES').replace('KES', '').trim() : '—', icon: <DollarSign size={18} className="text-green-600" />, bg: 'bg-green-50' },
          { label: 'MAKU Commission', value: summary ? formatCurrency(summary.totalCommission, 'KES').replace('KES', '').trim() : '—', icon: <TrendingUp size={18} className="text-brand-700" />, bg: 'bg-brand-50' },
        ].map((k) => (
          <Card key={k.label} padding="sm" className="hover:shadow-md transition-shadow">
            <div className={`mb-2 inline-flex rounded-xl p-2 ${k.bg}`}>{k.icon}</div>
            <p className="text-xl font-bold text-gray-900">{k.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{k.label}</p>
          </Card>
        ))}
      </div>

      {/* ── Species breakdown ────────────────────────────────────────── */}
      {summary && Object.keys(summary.bySpecies).length > 0 && (
        <Card>
          <h2 className="font-semibold text-gray-800 text-sm mb-3">Sales by Species</h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(summary.bySpecies).map(([species, data]) => (
              <div key={species} className="flex items-center gap-2 rounded-xl border border-gray-100 px-3 py-2">
                <span className="text-lg">{SPECIES_EMOJI[species as Species] ?? '🐾'}</span>
                <div>
                  <p className="text-xs font-semibold text-gray-800 capitalize">{species}</p>
                  <p className="text-[10px] text-gray-400">{data.animals} sold · KES {data.value.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Filters + table ──────────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap">
        <select
          onChange={(e) => setFilters((f) => ({ ...f, species: e.target.value }))}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 focus:border-brand-600 focus:outline-none"
        >
          <option value="">All species</option>
          {SPECIES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
        <input
          type="date"
          onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 focus:border-brand-600 focus:outline-none"
          placeholder="From"
        />
        <input
          type="date"
          onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 focus:border-brand-600 focus:outline-none"
          placeholder="To"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Date', 'Seller Member', 'Species', 'Qty', 'Buyer', 'Total (KES)', 'Commission', 'Proceeds', 'Payment'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading && (
              <tr><td colSpan={9} className="py-10 text-center"><Spinner className="mx-auto" /></td></tr>
            )}
            {!isLoading && txList.length === 0 && (
              <tr>
                <td colSpan={9} className="py-12 text-center">
                  <Beef size={28} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm text-gray-400">No transactions recorded yet</p>
                  <Button size="sm" className="mt-3" onClick={() => setShowForm(true)}>
                    <Plus size={13} /> Record first sale
                  </Button>
                </td>
              </tr>
            )}
            {txList.map((tx) => (
              <tr key={tx.id} className="hover:bg-warm-50 transition-colors">
                <td className="px-4 py-3 text-xs text-gray-500">{formatDate(tx.marketDate)}</td>
                <td className="px-4 py-3 text-xs text-gray-500 font-mono">{tx.sellerMemberId.slice(0, 8)}…</td>
                <td className="px-4 py-3">
                  <span className="capitalize text-xs">{SPECIES_EMOJI[tx.species as Species]} {tx.species}</span>
                </td>
                <td className="px-4 py-3 font-semibold text-gray-900">{tx.quantity}</td>
                <td className="px-4 py-3 text-xs text-gray-700">{tx.buyerName}</td>
                <td className="px-4 py-3 font-semibold text-gray-900">{Number(tx.totalAmount).toLocaleString()}</td>
                <td className="px-4 py-3 text-xs text-brand-700">{Number(tx.makuCommission).toLocaleString()}</td>
                <td className="px-4 py-3 text-xs text-green-700 font-medium">{Number(tx.memberProceeds).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <Badge variant={tx.paymentConfirmed ? 'green' : 'yellow'}>
                    {tx.paymentMethod}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {meta && meta.total > 0 && (
          <div className="px-4 py-2 border-t border-gray-100 text-xs text-gray-400">
            Showing {txList.length} of {meta.total} transactions
          </div>
        )}
      </div>

      {/* ── Record sale modal ────────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl my-4 rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700"><Beef size={16} /></div>
                <h2 className="font-semibold text-gray-900">Record Livestock Sale</h2>
              </div>
              <button onClick={() => { setShowForm(false); reset(); }} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="px-6 py-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Market date" type="date" required error={errors.marketDate?.message} {...register('marketDate')} />
                <Input label="Market location" hint="e.g. Merti Market" error={errors.marketLocation?.message} {...register('marketLocation')} />
              </div>

              {/* Member selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seller member <span className="text-red-500">*</span>
                </label>
                <div className="relative mb-2">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="search"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Search member name or number…"
                    className="w-full rounded-lg border border-gray-300 py-2 pl-8 pr-3 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
                  />
                </div>
                <select
                  {...register('sellerMemberId')}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
                  size={4}
                >
                  <option value="">— select a member —</option>
                  {(membersData?.data ?? []).map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.memberNumber ?? 'PENDING'} — {m.fullName}
                    </option>
                  ))}
                </select>
                {errors.sellerMemberId && <p className="mt-1 text-xs text-red-600">{errors.sellerMemberId.message}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Species <span className="text-red-500">*</span></label>
                  <select {...register('species')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none">
                    {SPECIES.map((s) => <option key={s} value={s}>{SPECIES_EMOJI[s]} {s}</option>)}
                  </select>
                </div>
                <Input label="Quantity" type="number" min={1} required error={errors.quantity?.message} {...register('quantity')} />
                <Input label="Price per head (KES)" type="number" min={0} required error={errors.pricePerUnit?.message} {...register('pricePerUnit')} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Buyer name" required error={errors.buyerName?.message} {...register('buyerName')} />
                <Input label="Buyer phone" type="tel" hint="Optional" error={errors.buyerPhone?.message} {...register('buyerPhone')} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="MAKU commission (KES)" type="number" min={0} hint="Optional" error={errors.makuCommission?.message} {...register('makuCommission')} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment method</label>
                  <select {...register('paymentMethod')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none">
                    <option value="cash">Cash</option>
                    <option value="mpesa">M-Pesa</option>
                    <option value="bank">Bank transfer</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
              </div>

              {/* Live calculation */}
              {(Number(qty) > 0 && Number(price) > 0) && (
                <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Total sale value</p>
                    <p className="font-bold text-gray-900">KES {total.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">MAKU commission</p>
                    <p className="font-bold text-brand-700">KES {Number(commission).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Member proceeds</p>
                    <p className="font-bold text-green-700">KES {proceeds.toLocaleString()}</p>
                  </div>
                </div>
              )}

              <Input label="Notes" hint="Optional" {...register('notes')} />

              <div className="flex gap-3 pt-1">
                <Button type="submit" loading={createMutation.isPending} className="flex-1">Record Sale</Button>
                <Button type="button" variant="secondary" onClick={() => { setShowForm(false); reset(); }}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
