import { useState, lazy, Suspense } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Edit2, CheckCircle, X, Camera, MapPin,
  Beef, Droplets, TrendingUp, Users, Plus, Trash2, ExternalLink,
} from 'lucide-react';
import { Button, Badge, Input, Card, Avatar, Spinner } from '@maku/ui';
import { formatDate, formatCurrency } from '@maku/utils';
import { useMember, useUpdateMember, useUploadPhoto } from '../hooks/useMembers';
import { useCigList } from '../../cigs/hooks/useCigs';
import { cigsService } from '../../cigs/services/cigs.service';
import { memberKeys } from '../hooks/useMembers';
import { toast } from '../../../shared/store/toast.store';
import { Gender, MemberStatus } from '@maku/shared-types';

// Lazy-load the map so Leaflet isn't in the initial bundle
const MemberMap = lazy(() =>
  import('../components/MemberMap').then((m) => ({ default: m.MemberMap })),
);

const statusVariant: Record<MemberStatus, 'green' | 'yellow' | 'red' | 'gray'> = {
  [MemberStatus.ACTIVE]: 'green',
  [MemberStatus.PENDING]: 'yellow',
  [MemberStatus.INACTIVE]: 'gray',
  [MemberStatus.DECEASED]: 'red',
};

const editSchema = z.object({
  fullName: z.string().min(2),
  phonePrimary: z.string().regex(/^(\+?254|0)7\d{8}$/),
  phoneSecondary: z.string().optional(),
  subLocation: z.string().optional(),
  village: z.string().optional(),
  gender: z.nativeEnum(Gender).optional(),
  dateOfBirth: z.string().optional(),
  cattleCount: z.coerce.number().min(0).optional(),
  goatCount: z.coerce.number().min(0).optional(),
  camelCount: z.coerce.number().min(0).optional(),
  sheepCount: z.coerce.number().min(0).optional(),
  shareContributions: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
  // next of kin
  nextOfKinName: z.string().optional(),
  nextOfKinRelationship: z.string().optional(),
  nextOfKinPhone: z.string().regex(/^(\+?254|0)7\d{8}$/).optional().or(z.literal('')),
  // contributions
  membershipFeePaid: z.coerce.number().min(0).max(1000).optional(),
  shareCapitalPaid: z.coerce.number().min(0).max(5000).optional(),
});
type EditForm = z.infer<typeof editSchema>;

type Tab = 'overview' | 'livestock' | 'cigs' | 'activity';

// ─── CIGs Tab — assign / remove CIGs for this member ─────────────────────────

interface CigsTabProps {
  memberId: string;
  memberCigs: Array<{ id: string; name: string }>;
}

function CigsTab({ memberId, memberCigs }: CigsTabProps) {
  const qc = useQueryClient();
  const [showPicker, setShowPicker] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const { data: allCigs = [] } = useCigList();

  // CIGs this member is NOT yet in
  const assignedIds = new Set(memberCigs.map((c) => c.id));
  const available = allCigs.filter((c) => !assignedIds.has(c.id));

  const addMutation = useMutation({
    mutationFn: (cigId: string) => cigsService.addMember(cigId, memberId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: memberKeys.detail(memberId) });
      setShowPicker(false);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (cigId: string) => cigsService.removeMember(cigId, memberId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: memberKeys.detail(memberId) });
      setRemovingId(null);
    },
  });

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-gray-800">Common Interest Groups</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {memberCigs.length > 0
              ? `Member of ${memberCigs.length} CIG${memberCigs.length !== 1 ? 's' : ''}`
              : 'Not assigned to any CIG yet'}
          </p>
        </div>
        {available.length > 0 && (
          <Button size="sm" onClick={() => setShowPicker(true)}>
            <Plus size={14} /> Assign to CIG
          </Button>
        )}
      </div>

      {/* Assigned CIGs list */}
      {memberCigs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-10 text-center">
          <Users size={28} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm text-gray-400 mb-3">Not a member of any CIG yet.</p>
          {available.length > 0 && (
            <Button size="sm" onClick={() => setShowPicker(true)}>
              <Plus size={14} /> Assign to a CIG
            </Button>
          )}
          {allCigs.length === 0 && (
            <Link
              to="/cigs"
              className="inline-flex items-center gap-1 text-xs text-brand-700 hover:underline mt-2"
            >
              Create a CIG first <ExternalLink size={11} />
            </Link>
          )}
        </div>
      ) : (
        <ul className="space-y-2">
          {memberCigs.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 px-4 py-3 hover:border-gray-200 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                  <Users size={15} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                  <p className="text-xs text-gray-400">
                    {allCigs.find((g) => g.id === c.id)?.subLocation ?? ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={`/cigs/${c.id}`}
                  className="text-xs text-brand-700 hover:underline flex items-center gap-0.5"
                  title="View CIG"
                >
                  <ExternalLink size={12} />
                </Link>
                <button
                  onClick={() => {
                    if (removingId === c.id) {
                      removeMutation.mutate(c.id);
                    } else {
                      setRemovingId(c.id);
                      setTimeout(() => setRemovingId(null), 3000);
                    }
                  }}
                  title={removingId === c.id ? 'Click again to confirm remove' : 'Remove from CIG'}
                  className={[
                    'rounded-lg p-1.5 transition-colors text-xs',
                    removingId === c.id
                      ? 'bg-red-100 text-red-600 font-medium px-2'
                      : 'text-gray-300 hover:bg-red-50 hover:text-red-500',
                  ].join(' ')}
                >
                  {removingId === c.id ? 'Confirm?' : <Trash2 size={13} />}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* ── CIG picker modal ────────────────────────────────────────── */}
      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                  <Users size={16} />
                </div>
                <h3 className="font-semibold text-gray-900">Assign to CIG</h3>
              </div>
              <button
                onClick={() => setShowPicker(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-4">
              {available.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">
                  This member is already in all available CIGs.
                </p>
              ) : (
                <ul className="space-y-2 max-h-72 overflow-y-auto">
                  {available.map((cig) => (
                    <li
                      key={cig.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 px-4 py-3 hover:border-brand-200 hover:bg-brand-50 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{cig.name}</p>
                        <p className="text-xs text-gray-400">
                          {cig.type}{cig.subLocation ? ` · ${cig.subLocation}` : ''} · {cig.memberCount} members
                        </p>
                      </div>
                      <Button
                        size="sm"
                        loading={addMutation.isPending && addMutation.variables === cig.id}
                        onClick={() => addMutation.mutate(cig.id)}
                      >
                        Assign
                      </Button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex justify-end mt-4">
                <Button variant="secondary" size="sm" onClick={() => setShowPicker(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function MemberProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const { data: member, isLoading } = useMember(id!);
  const updateMutation = useUpdateMember(id!);
  const photoMutation = useUploadPhoto(id!);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    values: member
      ? {
          fullName: member.fullName,
          phonePrimary: member.phonePrimary,
          phoneSecondary: member.phoneSecondary ?? '',
          subLocation: member.subLocation ?? '',
          village: member.village ?? '',
          gender: member.gender ?? undefined,
          dateOfBirth: member.dateOfBirth ?? '',
          cattleCount: member.cattleCount,
          goatCount: member.goatCount,
          camelCount: member.camelCount,
          sheepCount: member.sheepCount,
          shareContributions: member.shareContributions,
          notes: member.notes ?? '',
          nextOfKinName: member.nextOfKinName ?? '',
          nextOfKinRelationship: member.nextOfKinRelationship ?? '',
          nextOfKinPhone: member.nextOfKinPhone ?? '',
          membershipFeePaid: member.membershipFeePaid ?? 0,
          shareCapitalPaid: member.shareCapitalPaid ?? 0,
        }
      : undefined,
  });

  function onSave(values: EditForm) {
    // Strip empty strings so optional fields aren't sent as "" which fails API validation
    const clean = Object.fromEntries(
      Object.entries(values).map(([k, v]) => [k, v === '' ? undefined : v])
    ) as EditForm;

    updateMutation.mutate(clean, {
      onSuccess: () => {
        setEditing(false);
        toast.success('Profile saved', `${member?.fullName ?? 'Member'} updated successfully.`);
      },
      onError: (err: unknown) => {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
        toast.error('Save failed', msg ?? 'Could not save changes. Please try again.');
      },
    });
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      photoMutation.mutate(file, {
        onSuccess: () => toast.success('Photo updated'),
        onError: () => toast.error('Photo upload failed', 'Please try a smaller image.'),
      });
    }
    e.target.value = '';
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="page-container text-center py-16 text-gray-500">
        Member not found.{' '}
        <Link to="/members" className="text-brand-700 hover:underline">Back to list</Link>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'livestock', label: 'Livestock' },
    { key: 'cigs', label: 'CIGs' },
    { key: 'activity', label: 'Activity' },
  ];

  const totalLivestock =
    member.cattleCount + member.goatCount + member.camelCount + member.sheepCount;

  return (
    <div className="page-container max-w-4xl space-y-4">
      {/* Back */}
      <Link to="/members" className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-700">
        <ArrowLeft size={14} /> Back to members
      </Link>

      {/* Profile header card */}
      <Card>
        <div className="flex flex-wrap items-start gap-4">
          {/* Photo */}
          <div className="relative">
            <Avatar name={member.fullName} src={member.photoUrl} size="lg" />
            <label
              className="absolute -bottom-1 -right-1 cursor-pointer rounded-full bg-white border border-gray-300 p-1 shadow hover:bg-gray-50 transition-colors"
              aria-label="Change photo"
            >
              {photoMutation.isPending
                ? <Spinner size="sm" />
                : <Camera size={14} className="text-gray-500" />}
              <input type="file" accept="image/*" className="sr-only" onChange={handlePhotoChange} />
            </label>
          </div>

          {/* Name + meta */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 truncate">{member.fullName}</h1>
              <Badge variant={statusVariant[member.status]}>{member.status}</Badge>
              
            </div>
            <p className="font-mono text-sm text-gray-500 mt-0.5">
              {member.memberNumber ?? 'Pending member number'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {member.subLocation ?? '—'}{member.village ? `, ${member.village}` : ''}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Registered {formatDate(member.registrationDate)}
            </p>
          </div>

          {/* Edit toggle */}
          <div className="flex gap-2">
            {editing ? (
              <>
                <Button size="sm" loading={updateMutation.isPending} onClick={handleSubmit(onSave)}>
                  <CheckCircle size={14} /> Save
                </Button>
                <Button size="sm" variant="secondary" onClick={() => { setEditing(false); reset(); }}>
                  <X size={14} /> Cancel
                </Button>
              </>
            ) : (
              <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
                <Edit2 size={14} /> Edit
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-200">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={[
              'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
              activeTab === t.key
                ? 'border-brand-700 text-brand-700'
                : 'border-transparent text-gray-500 hover:text-gray-700',
            ].join(' ')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Overview tab ──────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
          {/* Contact details */}
          <Card>
            <h2 className="font-semibold text-gray-800 mb-3">Contact Details</h2>
            {editing ? (
              <div className="space-y-3">
                <Input label="Full name" required error={errors.fullName?.message} {...register('fullName')} />
                <Input label="Primary phone" type="tel" required error={errors.phonePrimary?.message} {...register('phonePrimary')} />
                <Input label="Secondary phone" type="tel" error={errors.phoneSecondary?.message} {...register('phoneSecondary')} />
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Gender</label>
                  <select {...register('gender')} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                    <option value="">Select gender</option>
                    {Object.values(Gender).map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <Input label="Date of birth" type="date" error={errors.dateOfBirth?.message} {...register('dateOfBirth')} />
                <Input label="Sub-location" error={errors.subLocation?.message} {...register('subLocation')} />
                <Input label="Village" error={errors.village?.message} {...register('village')} />
              </div>
            ) : (
              <dl className="space-y-2 text-sm">
                {[
                  ['National ID', member.nationalId],
                  ['Primary phone', member.phonePrimary],
                  ['Secondary phone', member.phoneSecondary ?? '—'],
                  ['Gender', member.gender ?? '—'],
                  ['Date of birth', formatDate(member.dateOfBirth)],
                  ['Sub-location', member.subLocation ?? '—'],
                  ['Village', member.village ?? '—'],
                  ['Shares (KES)', formatCurrency(member.shareContributions)],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-2">
                    <dt className="text-gray-500">{label}</dt>
                    <dd className="font-medium text-gray-900 text-right">{value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </Card>

          {/* Map */}
          <Card>
            <h2 className="font-semibold text-gray-800 mb-3">
              <MapPin size={15} className="inline mr-1 text-brand-700" />
              Homestead Location
            </h2>
            {member.gpsLat && member.gpsLng ? (
              <Suspense fallback={<div className="h-56 flex items-center justify-center"><Spinner /></div>}>
                <MemberMap lat={member.gpsLat} lng={member.gpsLng} name={member.fullName} />
              </Suspense>
            ) : (
              <div className="h-56 rounded-lg border border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-sm text-gray-400">
                <MapPin size={24} className="text-gray-300" />
                <span>No GPS coordinates recorded</span>
              </div>
            )}
          </Card>
        </div>

        {/* ── Next of kin ─────────────────────────────────────────── */}
        <Card>
          <h2 className="font-semibold text-gray-800 mb-3">Next of Kin</h2>
          {editing ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <Input label="Full name" error={errors.nextOfKinName?.message} {...register('nextOfKinName')} />
              <Input label="Relationship" placeholder="e.g. Spouse" error={errors.nextOfKinRelationship?.message} {...register('nextOfKinRelationship')} />
              <Input label="Phone number" type="tel" error={errors.nextOfKinPhone?.message} {...register('nextOfKinPhone')} />
            </div>
          ) : (
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              {[
                ['Name',         member.nextOfKinName ?? '—'],
                ['Relationship', member.nextOfKinRelationship ?? '—'],
                ['Phone',        member.nextOfKinPhone ?? '—'],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs uppercase tracking-wide text-gray-400 font-medium mb-0.5">{label}</dt>
                  <dd className="font-medium text-gray-900">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </Card>

        {/* ── Membership contributions ─────────────────────────── */}
        <Card>
          <h2 className="font-semibold text-gray-800 mb-3">Membership Contributions</h2>
          {editing ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Membership fee paid (KES)" type="number" min={0} max={1000} hint="Max KES 1,000" error={errors.membershipFeePaid?.message} {...register('membershipFeePaid')} />
              <Input label="Share capital paid (KES)" type="number" min={0} max={5000} hint="Max KES 5,000" error={errors.shareCapitalPaid?.message} {...register('shareCapitalPaid')} />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Membership fee */}
              <div className="rounded-xl border border-gray-100 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-400 font-medium mb-2">Membership Fee</p>
                <div className="flex items-end justify-between mb-2">
                  <span className="text-xl font-bold text-gray-900">
                    KES {(member.membershipFeePaid ?? 0).toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-400">of KES 1,000</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100">
                  <div
                    className={`h-2 rounded-full transition-all ${(member.membershipFeePaid ?? 0) >= 1000 ? 'bg-green-500' : 'bg-brand-500'}`}
                    style={{ width: `${Math.min(((member.membershipFeePaid ?? 0) / 1000) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs mt-1.5">
                  {(member.membershipFeePaid ?? 0) >= 1000
                    ? <span className="text-green-600 font-medium">✓ Fully paid</span>
                    : <span className="text-amber-600">Balance: KES {(1000 - (member.membershipFeePaid ?? 0)).toLocaleString()}</span>
                  }
                </p>
              </div>
              {/* Share capital */}
              <div className="rounded-xl border border-gray-100 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-400 font-medium mb-2">Share Capital</p>
                <div className="flex items-end justify-between mb-2">
                  <span className="text-xl font-bold text-gray-900">
                    KES {(member.shareCapitalPaid ?? 0).toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-400">of KES 5,000</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100">
                  <div
                    className={`h-2 rounded-full transition-all ${(member.shareCapitalPaid ?? 0) >= 5000 ? 'bg-green-500' : 'bg-brand-500'}`}
                    style={{ width: `${Math.min(((member.shareCapitalPaid ?? 0) / 5000) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs mt-1.5">
                  {(member.shareCapitalPaid ?? 0) >= 5000
                    ? <span className="text-green-600 font-medium">✓ Fully paid</span>
                    : <span className="text-amber-600">Balance: KES {(5000 - (member.shareCapitalPaid ?? 0)).toLocaleString()}</span>
                  }
                </p>
              </div>
            </div>
          )}
        </Card>
        </div>
      )}

      {/* ── Livestock tab ─────────────────────────────────────────────── */}
      {activeTab === 'livestock' && (
        <Card>
          <h2 className="font-semibold text-gray-800 mb-4">
            Livestock Holdings
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({totalLivestock} total head)
            </span>
          </h2>
          {editing ? (
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
              <Input label="Cattle" type="number" min={0} error={errors.cattleCount?.message} {...register('cattleCount')} />
              <Input label="Goats" type="number" min={0} error={errors.goatCount?.message} {...register('goatCount')} />
              <Input label="Camels" type="number" min={0} error={errors.camelCount?.message} {...register('camelCount')} />
              <Input label="Sheep" type="number" min={0} error={errors.sheepCount?.message} {...register('sheepCount')} />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Cattle', count: member.cattleCount, icon: <Beef size={20} className="text-amber-600" /> },
                { label: 'Goats', count: member.goatCount, icon: <Users size={20} className="text-green-600" /> },
                { label: 'Camels', count: member.camelCount, icon: <TrendingUp size={20} className="text-blue-600" /> },
                { label: 'Sheep', count: member.sheepCount, icon: <Droplets size={20} className="text-purple-600" /> },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-2 rounded-xl border border-gray-100 p-4 text-center">
                  {item.icon}
                  <span className="text-2xl font-bold text-gray-900">{item.count}</span>
                  <span className="text-xs text-gray-500">{item.label}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ── CIGs tab ──────────────────────────────────────────────────── */}
      {activeTab === 'cigs' && (
        <CigsTab memberId={id!} memberCigs={member.cigs ?? []} />
      )}

      {/* ── Activity tab ──────────────────────────────────────────────── */}
      {activeTab === 'activity' && (
        <Card>
          <h2 className="font-semibold text-gray-800 mb-4">Activity History</h2>
          <div className="py-8 text-center text-sm text-gray-400">
            Transaction and activity history will appear here as livestock sales, water vouchers,
            and financial transactions are recorded against this member.
          </div>
        </Card>
      )}
    </div>
  );
}
