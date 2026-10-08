import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Sprout, CheckCircle, Users, Check, X } from 'lucide-react';
import { Button, Input, Card } from '@maku/ui';
import { apiClient } from '../../../shared/services/api.client';
import { useCigList } from '../../cigs/hooks/useCigs';

const schema = z.object({
  fullName: z.string().min(3, 'Full name is required'),
  nationalId: z.string().regex(/^\d{7,8}$/, 'Enter a valid 7 or 8 digit national ID'),
  phonePrimary: z
    .string()
    .regex(/^(\+?254|0)7\d{8}$/, 'Enter a valid Kenyan mobile number'),
  subLocation: z.string().optional(),
  village: z.string().optional(),
  cigIds: z.array(z.string()).optional(),
});
type FormValues = z.infer<typeof schema>;

export default function MemberSelfRegisterPage() {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { cigIds: [] },
  });

  const { data: cigs = [] } = useCigList();
  const selectedCigIds = watch('cigIds') ?? [];

  function toggleCig(cigId: string) {
    const current = selectedCigIds;
    setValue(
      'cigIds',
      current.includes(cigId) ? current.filter((id) => id !== cigId) : [...current, cigId],
    );
  }

  const { mutate, isPending, isSuccess, isError } = useMutation({
    mutationFn: (data: FormValues) => apiClient.post('/members/self-register', data),
  });

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md text-center space-y-4">
          <CheckCircle size={56} className="mx-auto text-green-600" />
          <h1 className="text-2xl font-bold text-gray-900">Registration Submitted!</h1>
          <p className="text-gray-600">
            Your application has been received. A MAKU staff member will review it and contact
            you via the phone number you provided.
          </p>
          <Link to="/login" className="inline-block text-brand-700 hover:underline text-sm">
            Return to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex flex-col items-center gap-2">
          <Sprout size={36} className="text-brand-700" />
          <h1 className="text-2xl font-bold text-brand-700">Join MAKU</h1>
          <p className="text-sm text-gray-500 text-center max-w-xs">
            Register as a cooperative member to access livestock marketing, water vouchers, and more.
          </p>
        </div>

        <Card>
          {isError && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              Something went wrong. Please check your details and try again.
            </div>
          )}

          <form onSubmit={handleSubmit((v) => mutate(v))} noValidate className="space-y-4">
            <Input
              label="Full name"
              autoComplete="name"
              required
              error={errors.fullName?.message}
              {...register('fullName')}
            />
            <Input
              label="National ID number"
              type="text"
              inputMode="numeric"
              required
              hint="7 or 8 digit Kenya national ID"
              error={errors.nationalId?.message}
              {...register('nationalId')}
            />
            <Input
              label="Mobile phone number"
              type="tel"
              autoComplete="tel"
              required
              hint="e.g. 0712345678"
              error={errors.phonePrimary?.message}
              {...register('phonePrimary')}
            />
            <Input
              label="Sub-location"
              hint="Optional"
              error={errors.subLocation?.message}
              {...register('subLocation')}
            />
            <Input
              label="Village"
              hint="Optional"
              error={errors.village?.message}
              {...register('village')}
            />

            {/* CIG selection */}
            {cigs.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users size={15} className="text-brand-700" />
                  <label className="text-sm font-medium text-gray-700">
                    Common Interest Group (optional)
                  </label>
                  {selectedCigIds.length > 0 && (
                    <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
                      {selectedCigIds.length}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  Select the CIG(s) you belong to. You can update this after approval.
                </p>
                <div className="grid gap-2">
                  {cigs.map((cig) => {
                    const selected = selectedCigIds.includes(cig.id);
                    return (
                      <button
                        key={cig.id}
                        type="button"
                        onClick={() => toggleCig(cig.id)}
                        className={[
                          'flex items-center gap-3 rounded-xl border-2 px-4 py-2.5 text-left transition-all',
                          selected
                            ? 'border-brand-600 bg-brand-50'
                            : 'border-gray-200 hover:border-brand-300',
                        ].join(' ')}
                      >
                        <div className={[
                          'flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors',
                          selected ? 'border-brand-600 bg-brand-600' : 'border-gray-300',
                        ].join(' ')}>
                          {selected && <Check size={10} className="text-white" strokeWidth={3} />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-800 truncate">{cig.name}</p>
                          <p className="text-xs text-gray-400 truncate">
                            {cig.type}{cig.subLocation ? ` · ${cig.subLocation}` : ''}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" loading={isPending}>
              Submit registration
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-gray-500">
          Already a member?{' '}
          <Link to="/login" className="text-brand-700 hover:underline">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}
