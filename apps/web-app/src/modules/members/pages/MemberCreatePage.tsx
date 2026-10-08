import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, MapPin, Users, X, Check } from 'lucide-react';
import { Button, Input, Card } from '@maku/ui';
import { useCreateMember } from '../hooks/useMembers';
import { useCigList } from '../../cigs/hooks/useCigs';
import { Gender } from '@maku/shared-types';

const schema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  nationalId: z.string().regex(/^\d{7,8}$/, 'Enter a valid 7 or 8 digit national ID'),
  phonePrimary: z.string().regex(/^(\+?254|0)7\d{8}$/, 'Enter a valid Kenyan mobile number'),
  phoneSecondary: z.string().regex(/^(\+?254|0)7\d{8}$/, 'Enter a valid Kenyan mobile number').optional().or(z.literal('')),
  gender: z.nativeEnum(Gender).optional(),
  dateOfBirth: z.string().optional(),
  subLocation: z.string().optional(),
  village: z.string().optional(),
  gpsLat: z.coerce.number().optional(),
  gpsLng: z.coerce.number().optional(),
  cattleCount: z.coerce.number().min(0).optional(),
  goatCount: z.coerce.number().min(0).optional(),
  camelCount: z.coerce.number().min(0).optional(),
  sheepCount: z.coerce.number().min(0).optional(),
  shareContributions: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
  // next of kin
  nextOfKinName: z.string().optional(),
  nextOfKinRelationship: z.string().optional(),
  nextOfKinPhone: z.string().regex(/^(\+?254|0)7\d{8}$/, 'Enter a valid Kenyan mobile number').optional().or(z.literal('')),
  // contributions
  membershipFeePaid: z.coerce.number().min(0).max(1000).optional(),
  shareCapitalPaid: z.coerce.number().min(0).max(5000).optional(),
  cigIds: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof schema>;

export default function MemberCreatePage() {
  const navigate = useNavigate();
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { cigIds: [] },
  });

  const createMutation = useCreateMember();
  const { data: cigs = [] } = useCigList();

  const gpsLat = watch('gpsLat');
  const gpsLng = watch('gpsLng');
  const selectedCigIds = watch('cigIds') ?? [];

  function captureGps() {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by this browser');
      return;
    }
    setGpsLoading(true);
    setGpsError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue('gpsLat', pos.coords.latitude);
        setValue('gpsLng', pos.coords.longitude);
        setGpsLoading(false);
      },
      () => {
        setGpsError('Unable to get location. Please enter coordinates manually.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function toggleCig(cigId: string) {
    const current = selectedCigIds;
    if (current.includes(cigId)) {
      setValue('cigIds', current.filter((id) => id !== cigId));
    } else {
      setValue('cigIds', [...current, cigId]);
    }
  }

  function onSubmit(values: FormValues) {
    createMutation.mutate(
      {
        ...values,
        phoneSecondary: values.phoneSecondary || undefined,
        nextOfKinPhone: values.nextOfKinPhone || undefined,
        cigIds: values.cigIds?.length ? values.cigIds : undefined,
      },
      { onSuccess: (m) => navigate(`/members/${m.id}`) },
    );
  }

  return (
    <div className="page-container max-w-3xl space-y-4">
      <Link
        to="/members"
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-700 transition-colors"
      >
        <ArrowLeft size={14} /> Back to members
      </Link>

      <h1 className="section-heading">Add New Member</h1>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

        {/* ── Personal details ─────────────────────────────────────────── */}
        <Card>
          <h2 className="font-semibold text-gray-800 mb-4">Personal Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                label="Full name"
                required
                error={errors.fullName?.message}
                {...register('fullName')}
              />
            </div>
            <Input
              label="National ID number"
              inputMode="numeric"
              required
              hint="7 or 8 digit Kenya national ID"
              error={errors.nationalId?.message}
              {...register('nationalId')}
            />
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Gender</label>
              <select
                {...register('gender')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
              >
                <option value="">Select gender</option>
                {Object.values(Gender).map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <Input
              label="Date of birth"
              type="date"
              error={errors.dateOfBirth?.message}
              {...register('dateOfBirth')}
            />
          </div>
        </Card>

        {/* ── Contact & Location ───────────────────────────────────────── */}
        <Card>
          <h2 className="font-semibold text-gray-800 mb-4">Contact & Location</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Primary phone"
              type="tel"
              required
              hint="e.g. 0712345678"
              error={errors.phonePrimary?.message}
              {...register('phonePrimary')}
            />
            <Input
              label="Secondary phone"
              type="tel"
              hint="Optional"
              error={errors.phoneSecondary?.message}
              {...register('phoneSecondary')}
            />
            <Input
              label="Sub-location"
              error={errors.subLocation?.message}
              {...register('subLocation')}
            />
            <Input
              label="Village"
              error={errors.village?.message}
              {...register('village')}
            />
          </div>

          {/* GPS */}
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Homestead GPS coordinates</p>
            <div className="flex flex-wrap gap-3 items-end">
              <div className="w-40">
                <Input label="Latitude" type="number" step="any" error={errors.gpsLat?.message} {...register('gpsLat')} />
              </div>
              <div className="w-40">
                <Input label="Longitude" type="number" step="any" error={errors.gpsLng?.message} {...register('gpsLng')} />
              </div>
              <Button type="button" variant="secondary" size="sm" loading={gpsLoading} onClick={captureGps} className="mb-1">
                {!gpsLoading && <MapPin size={14} />}
                Capture GPS
              </Button>
            </div>
            {gpsError && <p className="mt-1 text-xs text-red-600" role="alert">{gpsError}</p>}
            {gpsLat && gpsLng && (
              <p className="mt-1 text-xs text-green-700">
                ✓ {Number(gpsLat).toFixed(6)}, {Number(gpsLng).toFixed(6)}
              </p>
            )}
          </div>
        </Card>

        {/* ── Next of kin ──────────────────────────────────────────────── */}
        <Card>
          <h2 className="font-semibold text-gray-800 mb-4">Next of Kin</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Full name"
              hint="Optional"
              error={errors.nextOfKinName?.message}
              {...register('nextOfKinName')}
            />
            <Input
              label="Relationship"
              placeholder="e.g. Spouse, Parent, Sibling"
              hint="Optional"
              error={errors.nextOfKinRelationship?.message}
              {...register('nextOfKinRelationship')}
            />
            <Input
              label="Phone number"
              type="tel"
              hint="Optional"
              error={errors.nextOfKinPhone?.message}
              {...register('nextOfKinPhone')}
            />
          </div>
        </Card>

        {/* ── Membership contributions ─────────────────────────────────── */}
        <Card>
          <h2 className="font-semibold text-gray-800 mb-1">Membership Contributions</h2>
          <p className="text-sm text-gray-500 mb-4">
            Standard: <strong>KES 1,000</strong> membership fee · <strong>KES 5,000</strong> share capital
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Membership fee paid (KES)"
              type="number"
              min={0}
              max={1000}
              hint="Maximum KES 1,000"
              error={errors.membershipFeePaid?.message}
              {...register('membershipFeePaid')}
            />
            <Input
              label="Share capital paid (KES)"
              type="number"
              min={0}
              max={5000}
              hint="Maximum KES 5,000"
              error={errors.shareCapitalPaid?.message}
              {...register('shareCapitalPaid')}
            />
          </div>
        </Card>

        {/* ── CIG Assignment ───────────────────────────────────────────── */}
        <Card>
          <div className="flex items-center gap-2 mb-1">
            <Users size={16} className="text-brand-700" />
            <h2 className="font-semibold text-gray-800">Common Interest Groups</h2>
            {selectedCigIds.length > 0 && (
              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
                {selectedCigIds.length} selected
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Assign this member to one or more CIGs during registration. You can change this later.
          </p>

          {cigs.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 py-6 text-center text-sm text-gray-400">
              No CIGs registered yet.{' '}
              <Link to="/cigs" className="text-brand-700 hover:underline">Create one first →</Link>
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {cigs.map((cig) => {
                const selected = selectedCigIds.includes(cig.id);
                return (
                  <button
                    key={cig.id}
                    type="button"
                    onClick={() => toggleCig(cig.id)}
                    className={[
                      'flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all',
                      selected
                        ? 'border-brand-600 bg-brand-50'
                        : 'border-gray-200 bg-white hover:border-brand-300 hover:bg-gray-50',
                    ].join(' ')}
                  >
                    {/* Checkbox indicator */}
                    <div className={[
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors',
                      selected ? 'border-brand-600 bg-brand-600' : 'border-gray-300 bg-white',
                    ].join(' ')}>
                      {selected && <Check size={12} className="text-white" strokeWidth={3} />}
                    </div>

                    <div className="min-w-0">
                      <p className={[
                        'text-sm font-medium truncate',
                        selected ? 'text-brand-800' : 'text-gray-800',
                      ].join(' ')}>
                        {cig.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {cig.type}
                        {cig.subLocation ? ` · ${cig.subLocation}` : ''}
                        {` · ${cig.memberCount} members`}
                      </p>
                    </div>

                    {selected && (
                      <span className="ml-auto shrink-0">
                        <X size={14} className="text-brand-500" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        {/* ── Livestock ────────────────────────────────────────────────── */}
        <Card>
          <h2 className="font-semibold text-gray-800 mb-4">Livestock Holdings</h2>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
            <Input label="Cattle" type="number" min={0} error={errors.cattleCount?.message} {...register('cattleCount')} />
            <Input label="Goats" type="number" min={0} error={errors.goatCount?.message} {...register('goatCount')} />
            <Input label="Camels" type="number" min={0} error={errors.camelCount?.message} {...register('camelCount')} />
            <Input label="Sheep" type="number" min={0} error={errors.sheepCount?.message} {...register('sheepCount')} />
          </div>
        </Card>

        {/* ── Cooperative ──────────────────────────────────────────────── */}
        <Card>
          <h2 className="font-semibold text-gray-800 mb-4">Cooperative Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Share contributions (KES)"
              type="number"
              min={0}
              step="0.01"
              error={errors.shareContributions?.message}
              {...register('shareContributions')}
            />
          </div>
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-700 block mb-1">Notes</label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent resize-none"
              placeholder="Any additional notes about this member…"
            />
          </div>
        </Card>

        {createMutation.isError && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {(createMutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
              'Failed to create member. Please check the details and try again.'}
          </div>
        )}

        <div className="flex gap-3 pb-6">
          <Button type="submit" loading={createMutation.isPending}>
            Save Member
          </Button>
          <Link to="/members">
            <Button type="button" variant="secondary">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
