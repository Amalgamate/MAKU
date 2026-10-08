import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Users, Plus, Search, X, MapPin, Leaf, GitMerge } from 'lucide-react';
import { Button, Input, Card, Badge, Spinner } from '@maku/ui';
import { formatDate } from '@maku/utils';
import { useCigList, useCreateCig } from '../hooks/useCigs';
import { CigType } from '@maku/shared-types';

const schema = z.object({
  name: z.string().min(3, 'CIG name must be at least 3 characters'),
  type: z.nativeEnum(CigType).optional(),
  subLocation: z.string().optional(),
  registrationDate: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const typeIcon: Record<CigType, React.ReactNode> = {
  [CigType.GEOGRAPHY]: <MapPin size={13} />,
  [CigType.COMMODITY]: <Leaf size={13} />,
  [CigType.MIXED]:     <GitMerge size={13} />,
};

const typeBadge: Record<CigType, 'blue' | 'green' | 'gray'> = {
  [CigType.GEOGRAPHY]: 'blue',
  [CigType.COMMODITY]: 'green',
  [CigType.MIXED]:     'gray',
};

export default function CigListPage() {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const { data: cigs = [], isLoading } = useCigList(search || undefined);
  const createMutation = useCreateCig();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: CigType.GEOGRAPHY },
  });

  function onSubmit(values: FormValues) {
    createMutation.mutate(values, {
      onSuccess: () => {
        reset();
        setShowModal(false);
      },
    });
  }

  return (
    <div className="page-container space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="section-heading">Common Interest Groups</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {cigs.length} CIG{cigs.length !== 1 ? 's' : ''} registered
          </p>
        </div>
        <Button size="sm" onClick={() => setShowModal(true)}>
          <Plus size={15} /> New CIG
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or location…"
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
          aria-label="Search CIGs"
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : cigs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <Users size={36} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">
            {search ? 'No CIGs match your search' : 'No CIGs registered yet'}
          </p>
          {!search && (
            <Button size="sm" className="mt-4" onClick={() => setShowModal(true)}>
              <Plus size={14} /> Create the first CIG
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cigs.map((cig) => (
            <Link key={cig.id} to={`/cigs/${cig.id}`}>
              <Card className="h-full hover:border-brand-300 hover:shadow-md transition-all cursor-pointer group">
                {/* Card header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700 group-hover:bg-brand-200 transition-colors">
                    <Users size={18} />
                  </div>
                  <Badge variant={typeBadge[cig.type]}>
                    <span className="flex items-center gap-1">
                      {typeIcon[cig.type]}
                      {cig.type}
                    </span>
                  </Badge>
                </div>

                {/* Name */}
                <h3 className="font-semibold text-gray-900 leading-snug mb-1 group-hover:text-brand-700 transition-colors">
                  {cig.name}
                </h3>

                {/* Meta */}
                <div className="space-y-1 text-xs text-gray-500">
                  {cig.subLocation && (
                    <p className="flex items-center gap-1.5">
                      <MapPin size={12} className="shrink-0 text-gray-400" />
                      {cig.subLocation}
                    </p>
                  )}
                  {cig.registrationDate && (
                    <p>Registered {formatDate(cig.registrationDate)}</p>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                    <Users size={14} className="text-brand-600" />
                    {cig.memberCount} member{cig.memberCount !== 1 ? 's' : ''}
                  </span>
                  <span className="text-xs text-brand-600 font-medium group-hover:underline">
                    View →
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* ── Create CIG Modal ────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                  <Users size={16} />
                </div>
                <h2 className="font-semibold text-gray-900">New Common Interest Group</h2>
              </div>
              <button
                onClick={() => { setShowModal(false); reset(); }}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="px-6 py-5 space-y-4">
              <Input
                label="CIG name"
                required
                placeholder="e.g. Merti Honey Producers"
                error={errors.name?.message}
                {...register('name')}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  {...register('type')}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
                >
                  <option value={CigType.GEOGRAPHY}>Geography — location-based group</option>
                  <option value={CigType.COMMODITY}>Commodity — product-based group</option>
                  <option value={CigType.MIXED}>Mixed — combined group</option>
                </select>
              </div>

              <Input
                label="Sub-location"
                placeholder="e.g. Merti Centre"
                hint="Optional — where this CIG operates"
                error={errors.subLocation?.message}
                {...register('subLocation')}
              />

              <Input
                label="Registration date"
                type="date"
                hint="Optional"
                error={errors.registrationDate?.message}
                {...register('registrationDate')}
              />

              {createMutation.isError && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                  {(createMutation.error as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message ?? 'Failed to create CIG. Please try again.'}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <Button type="submit" loading={createMutation.isPending} className="flex-1">
                  Create CIG
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => { setShowModal(false); reset(); }}
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
