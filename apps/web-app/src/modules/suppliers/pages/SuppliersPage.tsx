import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Plus, X, Star, Search, Edit2 } from 'lucide-react';
import { Button, Input, Card, Badge, Spinner } from '@maku/ui';
import { useSupplierList, useCreateSupplier, useUpdateSupplier, useDeactivateSupplier } from '../hooks/useSuppliers';
import type { Supplier, SupplierCategory } from '@maku/shared-types';

const CAT_LABELS: Record<SupplierCategory, string> = {
  livestock:'Livestock', feed:'Feed', veterinary:'Veterinary',
  equipment:'Equipment', transport:'Transport', services:'Services', other:'Other',
};

const schema = z.object({
  name: z.string().min(2), category: z.string().optional(),
  contactName: z.string().optional(), phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  physicalAddress: z.string().optional(), kraPin: z.string().optional(),
  bankName: z.string().optional(), bankAccount: z.string().optional(),
  mpesaNumber: z.string().optional(), notes: z.string().optional(),
});
type Form = z.infer<typeof schema>;

const editSchema = z.object({
  name: z.string().min(2),
  contactName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  category: z.string().optional(),
  physicalAddress: z.string().optional(),
});
type EditForm = z.infer<typeof editSchema>;

export default function SuppliersPage() {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  const { data: suppliers = [], isLoading } = useSupplierList(search || undefined);
  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier(editingSupplier?.id ?? '');
  const deactivateMutation = useDeactivateSupplier(editingSupplier?.id ?? '');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema), defaultValues: { category: 'other' },
  });

  const editForm = useForm<EditForm>({ resolver: zodResolver(editSchema) });

  function onSubmit(v: Form) {
    createMutation.mutate(
      { ...v, category: v.category as import('@maku/shared-types').SupplierCategory },
      { onSuccess: () => { reset(); setShowForm(false); } },
    );
  }

  function onEditSubmit(v: EditForm) {
    if (!editingSupplier) return;
    updateMutation.mutate(
      { ...v, category: v.category as import('@maku/shared-types').SupplierCategory },
      { onSuccess: () => { setEditingSupplier(null); setConfirmDeactivate(false); } },
    );
  }

  function handleDeactivate() {
    if (!editingSupplier) return;
    if (!confirmDeactivate) {
      setConfirmDeactivate(true);
      return;
    }
    deactivateMutation.mutate(undefined, {
      onSuccess: () => { setEditingSupplier(null); setConfirmDeactivate(false); },
    });
  }

  function openEdit(s: Supplier) {
    setEditingSupplier(s);
    setConfirmDeactivate(false);
    editForm.reset({
      name: s.name,
      contactName: s.contactName ?? '',
      phone: s.phone ?? '',
      email: s.email ?? '',
      category: s.category ?? 'other',
      physicalAddress: s.physicalAddress ?? '',
    });
  }

  return (
    <div className="page-container space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="section-heading">Supplier Register</h1><p className="text-sm text-gray-500">{suppliers.length} suppliers</p></div>
        <Button size="sm" onClick={() => setShowForm(true)}><Plus size={14} /> Add Supplier</Button>
      </div>

      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search suppliers…"
          className="w-full rounded-lg border border-gray-300 py-2 pl-8 pr-3 text-sm focus:border-brand-600 focus:outline-none" />
      </div>

      {isLoading ? <div className="flex justify-center py-16"><Spinner size="lg" /></div> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {suppliers.length === 0 && (
            <div className="col-span-3 py-12 text-center">
              <Building2 size={28} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-400">No suppliers registered yet</p>
            </div>
          )}
          {suppliers.map((s) => (
            <Card key={s.id} className={`hover:shadow-md transition-shadow ${!s.isActive ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700"><Building2 size={18} /></div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge variant="blue">{CAT_LABELS[s.category as SupplierCategory] ?? s.category}</Badge>
                  {!s.isActive && <Badge variant="gray">Inactive</Badge>}
                  <button
                    onClick={() => openEdit(s)}
                    className="rounded-lg p-1 text-gray-400 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                    title="Edit supplier"
                  >
                    <Edit2 size={13} />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{s.name}</h3>
              {s.contactName && <p className="text-xs text-gray-500">{s.contactName}</p>}
              {s.phone && <p className="text-xs text-gray-500">{s.phone}</p>}
              {s.email && <p className="text-xs text-gray-400 truncate">{s.email}</p>}
              <div className="mt-3 flex items-center gap-1">
                {[1,2,3,4,5].map((n) => (
                  <Star key={n} size={12} className={n <= s.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
                ))}
                <span className="text-[10px] text-gray-400 ml-1">{s.rating.toFixed(1)}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
          <div className="w-full max-w-lg my-4 rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-700"><Building2 size={16} /></div>
                <h2 className="font-semibold text-gray-900">Register Supplier</h2>
              </div>
              <button onClick={() => { setShowForm(false); reset(); }} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="px-6 py-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2"><Input label="Supplier name" required error={errors.name?.message} {...register('name')} /></div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select {...register('category')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none">
                    {Object.entries(CAT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <Input label="Contact person" hint="Optional" {...register('contactName')} />
                <Input label="Phone" type="tel" hint="Optional" {...register('phone')} />
                <Input label="Email" type="email" hint="Optional" error={errors.email?.message} {...register('email')} />
                <Input label="KRA PIN" hint="Optional" {...register('kraPin')} />
                <Input label="Bank name" hint="Optional" {...register('bankName')} />
                <Input label="Bank account" hint="Optional" {...register('bankAccount')} />
                <Input label="M-Pesa number" hint="Optional" {...register('mpesaNumber')} />
                <div className="sm:col-span-2"><Input label="Physical address" hint="Optional" {...register('physicalAddress')} /></div>
              </div>
              <div className="flex gap-3 pt-1">
                <Button type="submit" loading={createMutation.isPending} className="flex-1">Register Supplier</Button>
                <Button type="button" variant="secondary" onClick={() => { setShowForm(false); reset(); }}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editingSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
          <div className="w-full max-w-md my-4 rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-700"><Edit2 size={16} /></div>
                <h2 className="font-semibold text-gray-900">Edit Supplier</h2>
              </div>
              <button
                onClick={() => { setEditingSupplier(null); setConfirmDeactivate(false); }}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} noValidate className="px-6 py-5 space-y-4">
              <Input label="Supplier name" required error={editForm.formState.errors.name?.message} {...editForm.register('name')} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select {...editForm.register('category')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none">
                  {Object.entries(CAT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <Input label="Contact person" hint="Optional" {...editForm.register('contactName')} />
              <Input label="Phone" type="tel" hint="Optional" {...editForm.register('phone')} />
              <Input label="Email" type="email" hint="Optional" error={editForm.formState.errors.email?.message} {...editForm.register('email')} />
              <Input label="Physical address" hint="Optional" {...editForm.register('physicalAddress')} />
              <div className="flex flex-wrap gap-3 pt-1 border-t border-gray-100">
                <Button type="submit" loading={updateMutation.isPending} className="flex-1">Save Changes</Button>
                <Button
                  type="button"
                  variant={confirmDeactivate ? 'danger' : 'secondary'}
                  loading={deactivateMutation.isPending}
                  onClick={handleDeactivate}
                >
                  {confirmDeactivate ? 'Confirm Deactivate' : 'Deactivate'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => { setEditingSupplier(null); setConfirmDeactivate(false); }}
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
