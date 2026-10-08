import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ClipboardList, Plus, X, ChevronRight } from 'lucide-react';
import { Button, Input, Card, Badge, Spinner } from '@maku/ui';
import { formatDate, formatCurrency } from '@maku/utils';
import { useProcurementList, useProcurementSummary, useCreateProcurement, useUpdateProcurementStatus, useAddQuote } from '../hooks/useProcurement';
import { useSupplierList } from '../../suppliers/hooks/useSuppliers';
import type { ProcurementStatus, ProcurementOrder } from '@maku/shared-types';

const STATUS_ORDER: ProcurementStatus[] = ['requisition','quoting','approved','ordered','received'];
const STATUS_VARIANT: Record<ProcurementStatus, 'yellow' | 'blue' | 'green' | 'gray' | 'red'> = {
  requisition: 'yellow', quoting: 'blue', approved: 'green',
  ordered: 'blue', received: 'green', cancelled: 'red',
};
const NEXT_STATUS: Partial<Record<ProcurementStatus, ProcurementStatus>> = {
  requisition: 'approved', quoting: 'approved', approved: 'ordered', ordered: 'received',
};

const schema = z.object({
  title: z.string().min(3), description: z.string().min(5),
  requisitionDate: z.string().min(1), budgetAmount: z.coerce.number().min(1),
  supplierId: z.string().optional(), requiresQuotes: z.boolean().optional(),
  expectedDelivery: z.string().optional(), notes: z.string().optional(),
});
type Form = z.infer<typeof schema>;

const quoteSchema = z.object({ supplier: z.string().min(2), amount: z.coerce.number().min(1), notes: z.string().optional() });
type QuoteForm = z.infer<typeof quoteSchema>;

function ProcurementCard({ order }: { order: ProcurementOrder }) {
  const [showQuote, setShowQuote] = useState(false);
  const advanceMutation = useUpdateProcurementStatus();
  const addQuoteMutation = useAddQuote();
  const quoteForm = useForm<QuoteForm>({ resolver: zodResolver(quoteSchema) });
  const next = NEXT_STATUS[order.status];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-brand-700 font-semibold">{order.poNumber}</span>
            <Badge variant={STATUS_VARIANT[order.status]}>{order.status}</Badge>
          </div>
          <h3 className="font-semibold text-gray-900 text-sm">{order.title}</h3>
        </div>
        <p className="text-sm font-bold text-gray-900 shrink-0">{formatCurrency(order.budgetAmount, 'KES').replace('KES','').trim()}</p>
      </div>
      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{order.description}</p>

      {/* Quotes */}
      {order.quotes.length > 0 && (
        <div className="mb-3 space-y-1">
          {order.quotes.map((q, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-1.5 text-xs">
              <span className="text-gray-700">{q.supplier}</span>
              <span className="font-semibold text-brand-700">KES {q.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}

      {order.status !== 'received' && order.status !== 'cancelled' && (
        <div className="flex gap-2 flex-wrap">
          {order.requiresQuotes && order.status === 'requisition' && (
            <Button size="sm" variant="secondary" onClick={() => setShowQuote(!showQuote)}>+ Add Quote</Button>
          )}
          {next && (
            <Button size="sm" loading={advanceMutation.isPending}
              onClick={() => advanceMutation.mutate({ id: order.id, status: next })}>
              Advance to {next} <ChevronRight size={13} />
            </Button>
          )}
        </div>
      )}

      {showQuote && (
        <form onSubmit={quoteForm.handleSubmit((v) => { addQuoteMutation.mutate({ id: order.id, quote: v }, { onSuccess: () => { setShowQuote(false); quoteForm.reset(); } }); })} className="mt-3 space-y-2 border-t border-gray-100 pt-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <Input label="Supplier name" required error={quoteForm.formState.errors.supplier?.message} {...quoteForm.register('supplier')} />
            <Input label="Quote amount (KES)" type="number" min={1} required error={quoteForm.formState.errors.amount?.message} {...quoteForm.register('amount')} />
          </div>
          <Input label="Notes" hint="Optional" {...quoteForm.register('notes')} />
          <div className="flex gap-2">
            <Button type="submit" size="sm" loading={addQuoteMutation.isPending}>Save Quote</Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => setShowQuote(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <p className="text-[10px] text-gray-400 mt-3">Raised {formatDate(order.requisitionDate)}{order.expectedDelivery ? ` · Expected ${formatDate(order.expectedDelivery)}` : ''}</p>
    </Card>
  );
}

export default function ProcurementPage() {
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const { data: listData, isLoading } = useProcurementList({ status: statusFilter || undefined, page: 1, perPage: 50 });
  const { data: summary } = useProcurementSummary();
  const { data: suppliers = [] } = useSupplierList();
  const createMutation = useCreateProcurement();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { requisitionDate: new Date().toISOString().slice(0,10), requiresQuotes: false },
  });

  function onSubmit(v: Form) {
    const clean = Object.fromEntries(Object.entries(v).map(([k, val]) => [k, val === '' ? undefined : val])) as Form;
    createMutation.mutate(clean, { onSuccess: () => { reset(); setShowForm(false); } });
  }

  return (
    <div className="page-container space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="section-heading">Procurement</h1>
          <p className="text-sm text-gray-500">
            {summary ? `${summary.totalOrders} orders · KES ${summary.totalBudget.toLocaleString()} total budget` : 'Manage purchase requisitions and orders'}
          </p>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}><Plus size={14} /> Raise Requisition</Button>
      </div>

      {/* Status pipeline */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setStatusFilter('')}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${!statusFilter ? 'bg-brand-700 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
          All
        </button>
        {STATUS_ORDER.map((s) => {
          const count = summary?.byStatus.find((b) => b.status === s)?.count ?? 0;
          return (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors capitalize ${statusFilter === s ? 'bg-brand-700 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
              {s} {count > 0 && <span className="ml-1 rounded-full bg-brand-100 text-brand-700 px-1.5">{count}</span>}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : (listData?.data ?? []).length === 0 ? (
        <Card>
          <div className="py-12 text-center">
            <ClipboardList size={28} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm text-gray-400">No procurement orders yet</p>
            <Button size="sm" className="mt-3" onClick={() => setShowForm(true)}><Plus size={13} /> Raise first requisition</Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(listData?.data ?? []).map((o) => <ProcurementCard key={o.id} order={o} />)}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-700"><ClipboardList size={16} /></div>
                <h2 className="font-semibold text-gray-900">Raise Procurement Requisition</h2>
              </div>
              <button onClick={() => { setShowForm(false); reset(); }} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="px-6 py-5 space-y-4">
              <Input label="Title" required error={errors.title?.message} placeholder="e.g. Office computers Q4 2026" {...register('title')} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
                <textarea {...register('description')} rows={3} placeholder="Detailed description of what is needed and why…"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none resize-none" />
                {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Requisition date" type="date" required error={errors.requisitionDate?.message} {...register('requisitionDate')} />
                <Input label="Budget amount (KES)" type="number" min={1} required error={errors.budgetAmount?.message} {...register('budgetAmount')} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred supplier</label>
                  <select {...register('supplierId')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none">
                    <option value="">None / TBD</option>
                    {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <Input label="Expected delivery" type="date" hint="Optional" {...register('expectedDelivery')} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('requiresQuotes')} className="rounded border-gray-300 text-brand-600 focus:ring-brand-600" />
                <span className="text-sm text-gray-700">Requires three quotes (above KES 50,000)</span>
              </label>
              <Input label="Notes" hint="Optional" {...register('notes')} />
              <div className="flex gap-3 pt-1">
                <Button type="submit" loading={createMutation.isPending} className="flex-1">Submit Requisition</Button>
                <Button type="button" variant="secondary" onClick={() => { setShowForm(false); reset(); }}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
