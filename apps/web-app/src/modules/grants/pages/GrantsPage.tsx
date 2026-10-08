import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { TrendingUp, Plus, X, DollarSign } from 'lucide-react';
import { Button, Input, Card, Badge, Spinner } from '@maku/ui';
import { formatDate } from '@maku/utils';
import { useGrantList, useGrantPipeline, useCreateGrant, useUpdateGrant } from '../hooks/useGrants';
import type { GrantStatus } from '../services/grants.service';

const STATUS_VARIANT: Record<GrantStatus, 'yellow' | 'blue' | 'green' | 'gray' | 'red'> = {
  prospecting: 'yellow', applied: 'blue', awarded: 'green', active: 'green', completed: 'gray', rejected: 'red',
};
const NEXT_STATUS: Partial<Record<GrantStatus, GrantStatus>> = {
  prospecting: 'applied', applied: 'awarded', awarded: 'active', active: 'completed',
};

const schema = z.object({
  title: z.string().min(3), donorName: z.string().min(2),
  amountRequested: z.coerce.number().min(0).optional(),
  deadline: z.string().optional(), focusArea: z.string().optional(),
  description: z.string().optional(), reportingSchedule: z.string().optional(),
  nextReportDue: z.string().optional(), notes: z.string().optional(),
});
type Form = z.infer<typeof schema>;

export default function GrantsPage() {
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const { data: grants = [], isLoading } = useGrantList(statusFilter || undefined);
  const { data: pipeline } = useGrantPipeline();
  const createMutation = useCreateGrant();
  const updateMutation = useUpdateGrant();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  function onSubmit(v: Form) {
    const clean = Object.fromEntries(Object.entries(v).map(([k, val]) => [k, val === '' ? undefined : val])) as Form;
    createMutation.mutate(clean, { onSuccess: () => { reset(); setShowForm(false); } });
  }

  const STATUSES: GrantStatus[] = ['prospecting','applied','awarded','active','completed','rejected'];

  return (
    <div className="page-container space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700"><TrendingUp size={20} /></div>
          <div>
            <h1 className="section-heading">Grants Pipeline</h1>
            {pipeline && <p className="text-sm text-gray-500">Total awarded pipeline: KES {pipeline.totalPipeline.toLocaleString()}</p>}
          </div>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}><Plus size={14} /> Add Grant</Button>
      </div>

      {/* Pipeline summary */}
      {pipeline && (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setStatusFilter('')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${!statusFilter ? 'bg-brand-700 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
            All ({pipeline.byStatus.reduce((s, r) => s + r.count, 0)})
          </button>
          {pipeline.byStatus.map((s) => (
            <button key={s.status} onClick={() => setStatusFilter(s.status)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${statusFilter === s.status ? 'bg-brand-700 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
              {s.status} ({s.count})
            </button>
          ))}
        </div>
      )}

      {isLoading ? <div className="flex justify-center py-16"><Spinner size="lg" /></div> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {grants.length === 0 && (
            <div className="col-span-3 py-12 text-center"><TrendingUp size={28} className="mx-auto mb-2 text-gray-300" /><p className="text-sm text-gray-400">No grants in pipeline</p></div>
          )}
          {grants.map((g) => {
            const next = NEXT_STATUS[g.status];
            const disbursedPct = g.amountAwarded > 0 ? Math.min((g.amountDisbursed / g.amountAwarded) * 100, 100) : 0;
            return (
              <Card key={g.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant={STATUS_VARIANT[g.status]}>{g.status}</Badge>
                  {g.focusArea && <span className="text-[10px] text-gray-400">{g.focusArea}</span>}
                </div>
                <h3 className="font-semibold text-gray-900 mb-0.5 line-clamp-2">{g.title}</h3>
                <p className="text-xs text-gray-500 mb-3">{g.donorName}</p>

                <div className="space-y-1 text-xs">
                  {g.amountRequested > 0 && <div className="flex justify-between"><span className="text-gray-500">Requested</span><span className="font-medium">KES {g.amountRequested.toLocaleString()}</span></div>}
                  {g.amountAwarded > 0 && <div className="flex justify-between"><span className="text-gray-500">Awarded</span><span className="font-semibold text-green-700">KES {g.amountAwarded.toLocaleString()}</span></div>}
                  {g.amountAwarded > 0 && (
                    <div>
                      <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                        <span>Disbursed</span><span>{disbursedPct.toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-gray-100">
                        <div className="h-1.5 rounded-full bg-brand-600" style={{ width: `${disbursedPct}%` }} />
                      </div>
                    </div>
                  )}
                  {g.deadline && <p className="text-[10px] text-amber-600">Deadline: {formatDate(g.deadline)}</p>}
                  {g.nextReportDue && <p className="text-[10px] text-blue-600">Report due: {formatDate(g.nextReportDue)}</p>}
                </div>

                {next && (
                  <Button size="sm" variant="secondary" className="mt-3 w-full"
                    loading={updateMutation.isPending}
                    onClick={() => updateMutation.mutate({ id: g.id, data: { status: next } })}>
                    Move to {next}
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
          <div className="w-full max-w-lg my-4 rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-700"><TrendingUp size={16} /></div>
                <h2 className="font-semibold text-gray-900">Add Grant / Opportunity</h2>
              </div>
              <button onClick={() => { setShowForm(false); reset(); }} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="px-6 py-5 space-y-4">
              <Input label="Grant title" required error={errors.title?.message} {...register('title')} />
              <Input label="Donor / Funder name" required error={errors.donorName?.message} {...register('donorName')} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Amount requested (KES)" type="number" min={0} {...register('amountRequested')} />
                <Input label="Application deadline" type="date" {...register('deadline')} />
                <Input label="Focus area" hint="e.g. Livestock, Water" {...register('focusArea')} />
                <Input label="Reporting schedule" hint="e.g. Quarterly" {...register('reportingSchedule')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea {...register('description')} rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none resize-none" />
              </div>
              <div className="flex gap-3 pt-1">
                <Button type="submit" loading={createMutation.isPending} className="flex-1">Add to Pipeline</Button>
                <Button type="button" variant="secondary" onClick={() => { setShowForm(false); reset(); }}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
