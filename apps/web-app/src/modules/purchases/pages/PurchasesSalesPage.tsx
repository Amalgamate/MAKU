import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShoppingCart, Plus, X, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Button, Input, Card, Badge, Spinner } from '@maku/ui';
import { formatDate } from '@maku/utils';
import { usePurchaseList, usePurchaseSummary, useCreatePurchase } from '../hooks/usePurchases';
import { useSupplierList } from '../../suppliers/hooks/useSuppliers';

const itemSchema = z.object({ item: z.string().min(1), qty: z.coerce.number().min(0.01), unitPrice: z.coerce.number().min(0), total: z.coerce.number().min(0) });
const schema = z.object({
  transactionDate: z.string().min(1),
  type: z.enum(['purchase', 'sale']),
  description: z.string().min(3),
  supplierId: z.string().optional(),
  buyerName: z.string().optional(),
  paymentMethod: z.string().optional(),
  lineItems: z.array(itemSchema).min(1, 'Add at least one item'),
  taxAmount: z.coerce.number().min(0).optional(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});
type Form = z.infer<typeof schema>;

const STATUS_VARIANT: Record<string, 'green' | 'yellow' | 'gray' | 'red'> = {
  paid: 'green', confirmed: 'yellow', draft: 'gray', cancelled: 'red',
};

export default function PurchasesSalesPage() {
  const [showForm, setShowForm] = useState(false);
  const [txType, setTxType] = useState<'purchase' | 'sale'>('purchase');
  const [filter, setFilter] = useState('');

  const { data: listData, isLoading } = usePurchaseList({ type: filter || undefined, page: 1, perPage: 50 });
  const { data: summary } = usePurchaseSummary();
  const { data: suppliers = [] } = useSupplierList();
  const createMutation = useCreatePurchase();

  const { register, handleSubmit, control, watch, setValue, reset, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { transactionDate: new Date().toISOString().slice(0,10), type: 'purchase', paymentMethod: 'cash', lineItems: [{ item: '', qty: 1, unitPrice: 0, total: 0 }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'lineItems' });
  const lineItems = watch('lineItems');
  const taxAmount  = watch('taxAmount') ?? 0;
  const subtotal   = lineItems.reduce((s, l) => s + (Number(l.qty) * Number(l.unitPrice)), 0);
  const totalAmount = subtotal + Number(taxAmount);

  function updateTotal(idx: number) {
    const l = lineItems[idx];
    if (l) setValue(`lineItems.${idx}.total`, Number(l.qty) * Number(l.unitPrice));
  }

  function openForm(type: 'purchase' | 'sale') { setTxType(type); setValue('type', type); setShowForm(true); }

  function onSubmit(v: Form) {
    const items = v.lineItems.map((l) => ({ ...l, qty: Number(l.qty), unitPrice: Number(l.unitPrice), total: Number(l.qty) * Number(l.unitPrice) }));
    createMutation.mutate({ ...v, lineItems: items }, { onSuccess: () => { reset(); setShowForm(false); } });
  }

  return (
    <div className="page-container space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="section-heading">Purchases & Sales</h1><p className="text-sm text-gray-500">Record cooperative purchases from suppliers and sales to buyers</p></div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => openForm('sale')}><ArrowUpRight size={14} className="text-green-600" /> Record Sale</Button>
          <Button size="sm" onClick={() => openForm('purchase')}><ArrowDownRight size={14} /> Record Purchase</Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Purchases', value: summary?.purchases.count, sub: summary ? `KES ${summary.purchases.total.toLocaleString()}` : undefined, color: 'text-red-600' },
          { label: 'Total Sales', value: summary?.sales.count, sub: summary ? `KES ${summary.sales.total.toLocaleString()}` : undefined, color: 'text-green-600' },
        ].map((k) => (
          <Card key={k.label} padding="sm">
            <p className={`text-2xl font-bold ${k.color}`}>{k.value ?? '—'}</p>
            <p className="text-xs font-medium text-gray-700 mt-0.5">{k.label}</p>
            {k.sub && <p className="text-[11px] text-gray-400">{k.sub}</p>}
          </Card>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['', 'purchase', 'sale'].map((t) => (
          <button key={t} onClick={() => setFilter(t)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${filter === t ? 'bg-brand-700 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
            {t === '' ? 'All' : t === 'purchase' ? 'Purchases' : 'Sales'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead className="bg-gray-50">
            <tr>{['Ref No.','Date','Type','Description','Total (KES)','Paid','Balance','Status'].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading && <tr><td colSpan={8} className="py-10 text-center"><Spinner className="mx-auto" /></td></tr>}
            {!isLoading && (listData?.data ?? []).length === 0 && (
              <tr><td colSpan={8} className="py-12 text-center"><ShoppingCart size={24} className="mx-auto mb-2 text-gray-300" /><p className="text-sm text-gray-400">No transactions yet</p></td></tr>
            )}
            {(listData?.data ?? []).map((tx) => (
              <tr key={tx.id} className="hover:bg-warm-50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-brand-700 font-semibold">{tx.referenceNumber}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{formatDate(tx.transactionDate)}</td>
                <td className="px-4 py-3"><Badge variant={tx.type === 'sale' ? 'green' : 'blue'}>{tx.type}</Badge></td>
                <td className="px-4 py-3 text-xs text-gray-700 max-w-[200px] truncate">{tx.description}</td>
                <td className="px-4 py-3 font-semibold text-gray-900">{Number(tx.totalAmount).toLocaleString()}</td>
                <td className="px-4 py-3 text-xs text-green-700">{Number(tx.amountPaid).toLocaleString()}</td>
                <td className={`px-4 py-3 text-xs font-medium ${Number(tx.totalAmount) - Number(tx.amountPaid) > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                  {(Number(tx.totalAmount) - Number(tx.amountPaid)).toLocaleString()}
                </td>
                <td className="px-4 py-3"><Badge variant={STATUS_VARIANT[tx.status] ?? 'gray'}>{tx.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl my-4 rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${txType === 'purchase' ? 'bg-brand-100 text-brand-700' : 'bg-green-100 text-green-700'}`}>
                  <ShoppingCart size={16} />
                </div>
                <h2 className="font-semibold text-gray-900">Record {txType === 'purchase' ? 'Purchase' : 'Sale'}</h2>
              </div>
              <button onClick={() => { setShowForm(false); reset(); }} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="px-6 py-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Date" type="date" required error={errors.transactionDate?.message} {...register('transactionDate')} />
                {txType === 'purchase' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                    <select {...register('supplierId')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none">
                      <option value="">Select supplier (optional)</option>
                      {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                ) : (
                  <Input label="Buyer name" hint="Name of buyer/customer" {...register('buyerName')} />
                )}
              </div>
              <Input label="Description" required error={errors.description?.message} {...register('description')} />

              {/* Line items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Line items <span className="text-red-500">*</span></label>
                  <Button type="button" size="sm" variant="secondary" onClick={() => append({ item: '', qty: 1, unitPrice: 0, total: 0 })}>
                    <Plus size={13} /> Add item
                  </Button>
                </div>
                {errors.lineItems && <p className="mb-2 text-xs text-red-600">{errors.lineItems.message}</p>}
                <div className="space-y-2">
                  {fields.map((f, i) => (
                    <div key={f.id} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-5">
                        {i === 0 && <label className="block text-[11px] text-gray-500 mb-1">Item</label>}
                        <input {...register(`lineItems.${i}.item`)} placeholder="Item description"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none" />
                      </div>
                      <div className="col-span-2">
                        {i === 0 && <label className="block text-[11px] text-gray-500 mb-1">Qty</label>}
                        <input {...register(`lineItems.${i}.qty`)} type="number" min={0} step="any"
                          onChange={(e) => { register(`lineItems.${i}.qty`).onChange(e); updateTotal(i); }}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none" />
                      </div>
                      <div className="col-span-2">
                        {i === 0 && <label className="block text-[11px] text-gray-500 mb-1">Unit price</label>}
                        <input {...register(`lineItems.${i}.unitPrice`)} type="number" min={0} step="any"
                          onChange={(e) => { register(`lineItems.${i}.unitPrice`).onChange(e); updateTotal(i); }}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none" />
                      </div>
                      <div className="col-span-2">
                        {i === 0 && <label className="block text-[11px] text-gray-500 mb-1">Total</label>}
                        <p className="rounded-lg bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-900 border border-gray-200">
                          {(Number(lineItems[i]?.qty ?? 0) * Number(lineItems[i]?.unitPrice ?? 0)).toLocaleString()}
                        </p>
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <button type="button" onClick={() => remove(i)} className="rounded-lg p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 grid grid-cols-3 gap-4 text-sm">
                <div><p className="text-xs text-gray-500">Subtotal</p><p className="font-semibold">KES {subtotal.toLocaleString()}</p></div>
                <div>
                  <Input label="Tax (KES)" type="number" min={0} hint="Optional" {...register('taxAmount')} />
                </div>
                <div><p className="text-xs text-gray-500">Total</p><p className="text-lg font-bold text-brand-700">KES {totalAmount.toLocaleString()}</p></div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment method</label>
                  <select {...register('paymentMethod')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none">
                    <option value="cash">Cash</option>
                    <option value="mpesa">M-Pesa</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                    <option value="credit">Credit (pay later)</option>
                  </select>
                </div>
                <Input label="Due date" type="date" hint="For credit transactions" {...register('dueDate')} />
              </div>
              <Input label="Notes" hint="Optional" {...register('notes')} />

              <div className="flex gap-3 pt-1">
                <Button type="submit" loading={createMutation.isPending} className="flex-1">Save {txType === 'purchase' ? 'Purchase' : 'Sale'}</Button>
                <Button type="button" variant="secondary" onClick={() => { setShowForm(false); reset(); }}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
