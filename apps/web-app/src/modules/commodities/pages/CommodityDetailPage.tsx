import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Plus, X, Search } from 'lucide-react';
import { Button, Input, Card, Spinner } from '@maku/ui';
import { formatDate } from '@maku/utils';
import { useCommodityList, useCommoditySummary, useCreateCommodityTransaction } from '../hooks/useCommodities';
import { useMemberList } from '../../members/hooks/useMembers';
import { MemberStatus } from '@maku/shared-types';
import type { CommodityType } from '../services/commodities.service';

const UNIT_MAP: Record<CommodityType, string> = {
  honey: 'kg', dairy: 'litres', hides: 'pieces', poultry: 'birds', bones: 'kg', conservation: 'units',
};

interface Props { commodityType: CommodityType; title: string; emoji: string; }

const schema = z.object({
  action: z.enum(['collection', 'sale', 'processing']),
  transactionDate: z.string().min(1),
  memberId: z.string().uuid().optional(),
  quantity: z.coerce.number().min(0.001),
  qualityGrade: z.string().optional(),
  unitPrice: z.coerce.number().min(0).optional(),
  buyerName: z.string().optional(),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
});
type Form = z.infer<typeof schema>;

export function CommodityDetailPage({ commodityType, title, emoji }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const unit = UNIT_MAP[commodityType];

  const { data: listData, isLoading } = useCommodityList({ commodityType, page: '1', perPage: '50' });
  const { data: summary = [] } = useCommoditySummary();
  const createMutation = useCreateCommodityTransaction();
  const { data: membersData } = useMemberList({ search: memberSearch || undefined, status: MemberStatus.ACTIVE, page: 1, perPage: 20 });

  const stats = summary.find((s) => s.commodityType === commodityType);
  const transactions = listData?.data ?? [];

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { transactionDate: new Date().toISOString().slice(0, 10), action: 'collection', paymentMethod: 'cash' },
  });

  const action = watch('action');
  const qty = watch('quantity') ?? 0;
  const unitPrice = watch('unitPrice') ?? 0;
  const totalAmount = Number(qty) * Number(unitPrice);

  function onSubmit(v: Form) {
    createMutation.mutate(
      { ...v, commodityType, unit, totalAmount, unitPrice: v.unitPrice ?? 0, memberId: v.memberId || null, cigId: null, qualityGrade: v.qualityGrade || null, buyerName: v.buyerName || null, paymentMethod: v.paymentMethod || null, notes: v.notes || null },
      { onSuccess: () => { reset(); setShowForm(false); } },
    );
  }

  return (
    <div className="page-container space-y-5">
      <Link to="/commodities" className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-700"><ArrowLeft size={14} /> All Commodities</Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{emoji}</span>
          <div>
            <h1 className="section-heading">{title}</h1>
            {stats && <p className="text-sm text-gray-500">{stats.totalQuantity.toFixed(1)} {unit} collected · KES {stats.totalValue.toLocaleString()} total value</p>}
          </div>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}><Plus size={14} /> Record Transaction</Button>
      </div>

      {/* Summary cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Collections', value: stats.collections },
            { label: `Total ${unit}`, value: stats.totalQuantity.toFixed(1) },
            { label: 'Sales', value: stats.sales },
            { label: 'Total value (KES)', value: stats.totalValue.toLocaleString() },
          ].map((k) => (
            <Card key={k.label} padding="sm">
              <p className="text-xl font-bold text-gray-900">{k.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{k.label}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Transactions table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead className="bg-gray-50">
            <tr>{['Date', 'Action', `Quantity (${unit})`, 'Grade', 'Unit Price', 'Total (KES)', 'Buyer', 'Payment'].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading && <tr><td colSpan={8} className="py-10 text-center"><Spinner className="mx-auto" /></td></tr>}
            {!isLoading && transactions.length === 0 && (
              <tr><td colSpan={8} className="py-12 text-center">
                <p className="text-sm text-gray-400">No transactions yet — record the first one!</p>
              </td></tr>
            )}
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-warm-50 transition-colors">
                <td className="px-4 py-3 text-xs text-gray-500">{formatDate(tx.transactionDate)}</td>
                <td className="px-4 py-3 capitalize text-xs font-medium text-gray-700">{tx.action}</td>
                <td className="px-4 py-3 font-semibold text-gray-900">{tx.quantity.toFixed(2)}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{tx.qualityGrade ?? '—'}</td>
                <td className="px-4 py-3 text-xs text-gray-600">{tx.unitPrice > 0 ? tx.unitPrice.toLocaleString() : '—'}</td>
                <td className="px-4 py-3 font-semibold text-green-700">{tx.totalAmount > 0 ? tx.totalAmount.toLocaleString() : '—'}</td>
                <td className="px-4 py-3 text-xs text-gray-600">{tx.buyerName ?? '—'}</td>
                <td className="px-4 py-3 text-xs text-gray-500 capitalize">{tx.paymentMethod ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="font-semibold text-gray-900">{emoji} Record {title} Transaction</h2>
              <button onClick={() => { setShowForm(false); reset(); }} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="px-6 py-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Date" type="date" required error={errors.transactionDate?.message} {...register('transactionDate')} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                  <select {...register('action')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none">
                    <option value="collection">Collection — from members</option>
                    <option value="processing">Processing — value addition</option>
                    <option value="sale">Sale — to buyer</option>
                  </select>
                </div>
              </div>

              {/* Member selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Member (optional)</label>
                <div className="relative mb-1.5">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="search" value={memberSearch} onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Search member…" className="w-full rounded-lg border border-gray-300 py-2 pl-8 pr-3 text-sm focus:border-brand-600 focus:outline-none" />
                </div>
                <select {...register('memberId')} size={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none">
                  <option value="">No member / cooperative</option>
                  {(membersData?.data ?? []).map((m) => (
                    <option key={m.id} value={m.id}>{m.memberNumber ?? 'PENDING'} — {m.fullName}</option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input label={`Quantity (${unit})`} type="number" step="any" min={0.001} required error={errors.quantity?.message} {...register('quantity')} />
                <Input label="Quality grade" hint="Optional (e.g. Grade A)" {...register('qualityGrade')} />
              </div>

              {action === 'sale' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label={`Price per ${unit} (KES)`} type="number" min={0} {...register('unitPrice')} />
                  <div className="flex flex-col justify-end">
                    <p className="text-xs text-gray-500 mb-1">Total value</p>
                    <p className="text-lg font-bold text-brand-700">KES {totalAmount.toLocaleString()}</p>
                  </div>
                  <Input label="Buyer name" {...register('buyerName')} />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment</label>
                    <select {...register('paymentMethod')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none">
                      <option value="cash">Cash</option>
                      <option value="mpesa">M-Pesa</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>
                </div>
              )}

              <Input label="Notes" hint="Optional" {...register('notes')} />
              <div className="flex gap-3 pt-1">
                <Button type="submit" loading={createMutation.isPending} className="flex-1">Save Transaction</Button>
                <Button type="button" variant="secondary" onClick={() => { setShowForm(false); reset(); }}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
