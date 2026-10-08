import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Globe, Plus, X, CheckCircle } from 'lucide-react';
import { Button, Input, Card, Badge, Spinner } from '@maku/ui';
import { formatDate } from '@maku/utils';
import { useNgoList, useCreateNgo } from '../hooks/useNgos';

const schema = z.object({
  name: z.string().min(2), country: z.string().optional(),
  contactName: z.string().optional(), contactEmail: z.string().optional(),
  contactPhone: z.string().optional(), focusAreas: z.string().optional(),
  partnershipStart: z.string().optional(), mouSigned: z.boolean().optional(),
  mouExpiry: z.string().optional(), notes: z.string().optional(),
});
type Form = z.infer<typeof schema>;

export default function NgosPage() {
  const [showForm, setShowForm] = useState(false);
  const { data: ngos = [], isLoading } = useNgoList();
  const createMutation = useCreateNgo();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  function onSubmit(v: Form) {
    // Strip empty strings so optional date/string fields aren't sent as "" (fails ISO8601 validation)
    const clean = Object.fromEntries(
      Object.entries(v).map(([k, val]) => [k, val === '' ? undefined : val])
    ) as Form;
    createMutation.mutate(clean, { onSuccess: () => { reset(); setShowForm(false); } });
  }

  return (
    <div className="page-container space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700"><Globe size={20} /></div>
          <div>
            <h1 className="section-heading">NGO & Partner Management</h1>
            <p className="text-sm text-gray-500">{ngos.length} development partner{ngos.length !== 1 ? 's' : ''} registered</p>
          </div>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}><Plus size={14} /> Add Partner</Button>
      </div>

      {isLoading ? <div className="flex justify-center py-16"><Spinner size="lg" /></div> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ngos.length === 0 && (
            <div className="col-span-3 py-12 text-center"><Globe size={28} className="mx-auto mb-2 text-gray-300" /><p className="text-sm text-gray-400">No partners registered yet</p></div>
          )}
          {ngos.map((n) => (
            <Card key={n.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-700 shrink-0"><Globe size={16} /></div>
                <div className="flex gap-1">
                  {n.mouSigned && <Badge variant="green"><CheckCircle size={10} className="mr-1" />MoU</Badge>}
                  {!n.isActive && <Badge variant="gray">Inactive</Badge>}
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-0.5">{n.name}</h3>
              {n.country && <p className="text-xs text-gray-500">{n.country}</p>}
              {n.contactName && <p className="text-xs text-gray-500">{n.contactName}</p>}
              {n.focusAreas && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{n.focusAreas}</p>}
              {n.partnershipStart && (
                <p className="text-[10px] text-gray-400 mt-2">Partner since {formatDate(n.partnershipStart)}</p>
              )}
              {n.mouExpiry && (
                <p className="text-[10px] text-amber-600 mt-0.5">MoU expires {formatDate(n.mouExpiry)}</p>
              )}
            </Card>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
          <div className="w-full max-w-lg my-4 rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-700"><Globe size={16} /></div>
                <h2 className="font-semibold text-gray-900">Register NGO / Partner</h2>
              </div>
              <button onClick={() => { setShowForm(false); reset(); }} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="px-6 py-5 space-y-4">
              <Input label="Organisation name" required error={errors.name?.message} {...register('name')} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Country" hint="Optional" {...register('country')} />
                <Input label="Contact person" hint="Optional" {...register('contactName')} />
                <Input label="Contact email" type="email" hint="Optional" {...register('contactEmail')} />
                <Input label="Contact phone" hint="Optional" {...register('contactPhone')} />
                <Input label="Partnership start" type="date" hint="Optional" {...register('partnershipStart')} />
                <Input label="MoU expiry date" type="date" hint="Optional" {...register('mouExpiry')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Focus areas</label>
                <textarea {...register('focusAreas')} rows={2} placeholder="e.g. Livestock, Water, Livelihoods" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none resize-none" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('mouSigned')} className="rounded border-gray-300 text-brand-600 focus:ring-brand-600" />
                <span className="text-sm text-gray-700">MoU signed</span>
              </label>
              <Input label="Notes" hint="Optional" {...register('notes')} />
              <div className="flex gap-3 pt-1">
                <Button type="submit" loading={createMutation.isPending} className="flex-1">Register Partner</Button>
                <Button type="button" variant="secondary" onClick={() => { setShowForm(false); reset(); }}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
