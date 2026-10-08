import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Beef, Plus, X, Search, TrendingUp, Scale } from 'lucide-react';
import { Button, Input, Card, Badge, Spinner } from '@maku/ui';
import { formatDate } from '@maku/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/services/api.client';
import { useMemberList } from '../../members/hooks/useMembers';
import { MemberStatus } from '@maku/shared-types';
import { toast } from '../../../shared/store/toast.store';

// ─── Types & API ──────────────────────────────────────────────────────────────

interface FeedlotAnimal {
  id: string;
  animalTag: string;
  species: string;
  memberId: string | null;
  intakeDate: string;
  intakeWeightKg: number;
  currentWeightKg: number | null;
  dailyFeedCostKes: number;
  status: 'active' | 'sold' | 'died';
  saleDate: string | null;
  salePriceKes: number | null;
  notes: string | null;
  createdAt: string;
}

const FEEDLOT_KEY = ['feedlot'];

function useFeedlot() {
  return useQuery({
    queryKey: FEEDLOT_KEY,
    queryFn: async (): Promise<FeedlotAnimal[]> => {
      try {
        const res = await apiClient.get<{ data: FeedlotAnimal[]; message: string }>('/feedlot');
        return res.data.data;
      } catch { return []; }
    },
  });
}

const schema = z.object({
  animalTag:      z.string().min(1, 'Tag required'),
  species:        z.string().min(2),
  memberId:       z.string().uuid().optional(),
  intakeDate:     z.string().min(1),
  intakeWeightKg: z.coerce.number().min(1),
  dailyFeedCostKes: z.coerce.number().min(0).optional(),
  notes:          z.string().optional(),
});
type Form = z.infer<typeof schema>;

const STATUS_VARIANT = { active: 'yellow', sold: 'green', died: 'red' } as const;

// ─── Component ────────────────────────────────────────────────────────────────

export default function FeedlotPage() {
  const [showForm, setShowForm] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const qc = useQueryClient();

  const { data: animals = [], isLoading } = useFeedlot();
  const { data: membersData } = useMemberList({
    search: memberSearch || undefined,
    status: MemberStatus.ACTIVE,
    page: 1, perPage: 20,
  });

  const createMutation = useMutation({
    mutationFn: (data: Form) => apiClient.post('/feedlot', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FEEDLOT_KEY });
      toast.success('Animal added to feedlot');
      setShowForm(false);
      reset();
    },
    onError: () => toast.error('Failed to add animal', 'Ensure the feedlot API endpoint is set up correctly.'),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { intakeDate: new Date().toISOString().slice(0, 10), species: 'cattle', dailyFeedCostKes: 0 },
  });

  const active = animals.filter((a) => a.status === 'active');
  const sold   = animals.filter((a) => a.status === 'sold');
  const totalFeedCost = active.reduce((s, a) => s + a.dailyFeedCostKes, 0);

  return (
    <div className="page-container space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <Beef size={20} />
          </div>
          <div>
            <h1 className="section-heading">Feedlot Management</h1>
            <p className="text-sm text-gray-500">
              Track animals in the feedlot — weight gain, feeding costs, and sales
            </p>
          </div>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}><Plus size={14} /> Intake Animal</Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active in feedlot', value: active.length, icon: <Beef size={18} className="text-amber-600" />, bg: 'bg-amber-50' },
          { label: 'Sold from feedlot', value: sold.length, icon: <TrendingUp size={18} className="text-green-600" />, bg: 'bg-green-50' },
          { label: 'Daily feed cost', value: `KES ${totalFeedCost.toLocaleString()}`, icon: <Scale size={18} className="text-blue-600" />, bg: 'bg-blue-50' },
          { label: 'Total processed', value: animals.length, icon: <Beef size={18} className="text-brand-700" />, bg: 'bg-brand-50' },
        ].map((k) => (
          <Card key={k.label} padding="sm">
            <div className={`mb-2 inline-flex rounded-xl p-2 ${k.bg}`}>{k.icon}</div>
            <p className="text-xl font-bold text-gray-900">{k.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{k.label}</p>
          </Card>
        ))}
      </div>

      {/* Animals table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Tag', 'Species', 'Intake Date', 'Intake Weight', 'Current Weight', 'Daily Cost', 'Status', 'Member'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading && <tr><td colSpan={8} className="py-10 text-center"><Spinner className="mx-auto" /></td></tr>}
            {!isLoading && animals.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center">
                  <Beef size={28} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm text-gray-400">No animals in the feedlot yet</p>
                  <Button size="sm" className="mt-3" onClick={() => setShowForm(true)}>
                    <Plus size={13} /> Add first animal
                  </Button>
                </td>
              </tr>
            )}
            {animals.map((a) => (
              <tr key={a.id} className="hover:bg-warm-50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-brand-700 font-semibold">{a.animalTag}</td>
                <td className="px-4 py-3 text-xs capitalize text-gray-700">{a.species}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{formatDate(a.intakeDate)}</td>
                <td className="px-4 py-3 text-xs text-gray-700">{a.intakeWeightKg} kg</td>
                <td className="px-4 py-3 text-xs text-gray-700">
                  {a.currentWeightKg ? (
                    <span className="flex items-center gap-1">
                      {a.currentWeightKg} kg
                      {a.currentWeightKg > a.intakeWeightKg && (
                        <span className="text-green-600 text-[10px]">+{(a.currentWeightKg - a.intakeWeightKg).toFixed(1)}</span>
                      )}
                    </span>
                  ) : '—'}
                </td>
                <td className="px-4 py-3 text-xs text-gray-600">KES {a.dailyFeedCostKes.toLocaleString()}/day</td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_VARIANT[a.status] ?? 'gray'}>{a.status}</Badge>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{a.memberId ? a.memberId.slice(0, 8) + '…' : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Intake form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700"><Beef size={16} /></div>
                <h2 className="font-semibold text-gray-900">Feedlot Animal Intake</h2>
              </div>
              <button onClick={() => { setShowForm(false); reset(); }} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit((v) => createMutation.mutate(v))} noValidate className="px-6 py-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Animal tag / ear tag" required error={errors.animalTag?.message} {...register('animalTag')} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Species</label>
                  <select {...register('species')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none">
                    <option value="cattle">Cattle</option>
                    <option value="goat">Goat</option>
                    <option value="camel">Camel</option>
                    <option value="sheep">Sheep</option>
                  </select>
                </div>
                <Input label="Intake date" type="date" required error={errors.intakeDate?.message} {...register('intakeDate')} />
                <Input label="Intake weight (kg)" type="number" min={1} step="0.1" required error={errors.intakeWeightKg?.message} {...register('intakeWeightKg')} />
                <Input label="Daily feed cost (KES)" type="number" min={0} hint="Optional" error={errors.dailyFeedCostKes?.message} {...register('dailyFeedCostKes')} />
              </div>
              {/* Member selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Owner member (optional)</label>
                <div className="relative mb-1.5">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="search" value={memberSearch} onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Search member…" className="w-full rounded-lg border border-gray-300 py-2 pl-8 pr-3 text-sm focus:border-brand-600 focus:outline-none" />
                </div>
                <select {...register('memberId')} size={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none">
                  <option value="">No specific member</option>
                  {(membersData?.data ?? []).map((m) => (
                    <option key={m.id} value={m.id}>{m.memberNumber ?? 'PENDING'} — {m.fullName}</option>
                  ))}
                </select>
              </div>
              <Input label="Notes" hint="Optional" {...register('notes')} />
              <div className="flex gap-3 pt-1">
                <Button type="submit" loading={createMutation.isPending} className="flex-1">Record Intake</Button>
                <Button type="button" variant="secondary" onClick={() => { setShowForm(false); reset(); }}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
