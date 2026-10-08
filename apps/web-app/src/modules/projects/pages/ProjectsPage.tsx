import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FolderOpen, Plus, X, CheckCircle, Clock } from 'lucide-react';
import { Button, Input, Card, Badge, Spinner } from '@maku/ui';
import { formatDate } from '@maku/utils';
import { useProjectList, useCreateProject, useUpdateProject } from '../hooks/useProjects';
import type { ProjectStatus } from '../services/projects.service';

const STATUS_VARIANT: Record<ProjectStatus, 'yellow' | 'green' | 'gray' | 'red' | 'blue'> = {
  planning: 'yellow', active: 'green', on_hold: 'gray', completed: 'blue', cancelled: 'red',
};
const STATUS_LABEL: Record<ProjectStatus, string> = {
  planning: 'Planning', active: 'Active', on_hold: 'On Hold', completed: 'Completed', cancelled: 'Cancelled',
};

const schema = z.object({
  title: z.string().min(3), description: z.string().optional(),
  startDate: z.string().optional(), endDate: z.string().optional(),
  budget: z.coerce.number().min(0).optional(), notes: z.string().optional(),
});
type Form = z.infer<typeof schema>;

export default function ProjectsPage() {
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPct, setEditPct] = useState(0);

  const { data: projects = [], isLoading } = useProjectList(statusFilter || undefined);
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  function onSubmit(v: Form) {
    createMutation.mutate({ ...v, status: 'planning', progressPct: 0 }, { onSuccess: () => { reset(); setShowForm(false); } });
  }

  const STATUSES: ProjectStatus[] = ['planning','active','on_hold','completed','cancelled'];
  const statusCounts = Object.fromEntries(STATUSES.map((s) => [s, projects.filter((p) => p.status === s).length]));

  return (
    <div className="page-container space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700"><FolderOpen size={20} /></div>
          <div>
            <h1 className="section-heading">Project Management</h1>
            <p className="text-sm text-gray-500">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}><Plus size={14} /> New Project</Button>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setStatusFilter('')}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${!statusFilter ? 'bg-brand-700 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
          All ({projects.length})
        </button>
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${statusFilter === s ? 'bg-brand-700 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
            {STATUS_LABEL[s]} {(statusCounts[s] ?? 0) > 0 && `(${statusCounts[s]})`}
          </button>
        ))}
      </div>

      {isLoading ? <div className="flex justify-center py-16"><Spinner size="lg" /></div> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.length === 0 && (
            <div className="col-span-3 py-12 text-center">
              <FolderOpen size={28} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-400">No projects yet</p>
              <Button size="sm" className="mt-3" onClick={() => setShowForm(true)}><Plus size={13} /> Create first project</Button>
            </div>
          )}
          {projects.map((p) => (
            <Card key={p.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2 mb-2">
                <Badge variant={STATUS_VARIANT[p.status]}>{STATUS_LABEL[p.status]}</Badge>
                <select
                  value={p.status}
                  onChange={(e) => updateMutation.mutate({ id: p.id, data: { status: e.target.value as ProjectStatus } })}
                  className="text-[10px] border border-gray-200 rounded px-1 py-0.5 text-gray-600 focus:outline-none"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                </select>
              </div>

              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{p.title}</h3>
              {p.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{p.description}</p>}

              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                  <span>Progress</span>
                  <span className="font-semibold">{p.progressPct}%</span>
                </div>
                {editingId === p.id ? (
                  <div className="flex items-center gap-2">
                    <input type="range" min={0} max={100} value={editPct} onChange={(e) => setEditPct(Number(e.target.value))}
                      className="flex-1 h-2 accent-brand-600" />
                    <button onClick={() => { updateMutation.mutate({ id: p.id, data: { progressPct: editPct } }); setEditingId(null); }}
                      className="text-brand-700 hover:text-brand-900"><CheckCircle size={14} /></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group cursor-pointer" onClick={() => { setEditingId(p.id); setEditPct(p.progressPct); }}>
                    <div className="flex-1 h-2 rounded-full bg-gray-100">
                      <div className={`h-2 rounded-full ${p.progressPct === 100 ? 'bg-green-500' : 'bg-brand-600'}`} style={{ width: `${p.progressPct}%` }} />
                    </div>
                    <span className="text-[10px] text-gray-300 group-hover:text-brand-600 transition-colors">edit</span>
                  </div>
                )}
              </div>

              {/* Budget */}
              {p.budget > 0 && (
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-gray-500">Budget</span>
                  <span className="font-medium">KES {p.budget.toLocaleString()}</span>
                </div>
              )}
              {p.spent > 0 && (
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-gray-500">Spent</span>
                  <span className={`font-medium ${p.spent > p.budget ? 'text-red-600' : 'text-gray-900'}`}>KES {p.spent.toLocaleString()}</span>
                </div>
              )}

              {/* Milestones */}
              {p.milestones.length > 0 && (
                <div className="mt-2 space-y-1">
                  {p.milestones.slice(0, 3).map((m, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px]">
                      <CheckCircle size={10} className={m.completed ? 'text-green-500' : 'text-gray-300'} />
                      <span className={m.completed ? 'line-through text-gray-400' : 'text-gray-600'}>{m.title}</span>
                      <span className="ml-auto text-gray-400">{formatDate(m.dueDate)}</span>
                    </div>
                  ))}
                  {p.milestones.length > 3 && <p className="text-[10px] text-gray-400">+{p.milestones.length - 3} more</p>}
                </div>
              )}

              {/* Dates */}
              <div className="mt-3 flex items-center gap-3 text-[10px] text-gray-400 border-t border-gray-100 pt-2">
                {p.startDate && <span className="flex items-center gap-1"><Clock size={9}/>{formatDate(p.startDate)}</span>}
                {p.endDate && <span>→ {formatDate(p.endDate)}</span>}
              </div>
            </Card>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-700"><FolderOpen size={16} /></div>
                <h2 className="font-semibold text-gray-900">Create New Project</h2>
              </div>
              <button onClick={() => { setShowForm(false); reset(); }} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="px-6 py-5 space-y-4">
              <Input label="Project title" required error={errors.title?.message} {...register('title')} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea {...register('description')} rows={3} placeholder="Project objectives and scope…"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none resize-none" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Start date" type="date" {...register('startDate')} />
                <Input label="End date" type="date" {...register('endDate')} />
                <Input label="Budget (KES)" type="number" min={0} {...register('budget')} />
              </div>
              <Input label="Notes" hint="Optional" {...register('notes')} />
              <div className="flex gap-3 pt-1">
                <Button type="submit" loading={createMutation.isPending} className="flex-1">Create Project</Button>
                <Button type="button" variant="secondary" onClick={() => { setShowForm(false); reset(); }}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
