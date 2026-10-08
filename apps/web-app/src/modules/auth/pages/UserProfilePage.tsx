import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle } from 'lucide-react';
import { Button, Input, Card, Avatar, Badge } from '@maku/ui';
import { formatDateTime } from '@maku/utils';
import { apiClient } from '../../../shared/services/api.client';
import { useAuthStore } from '../../../shared/store/auth.store';
import type { UserProfile } from '@maku/shared-types';
import { UserStatus } from '@maku/shared-types';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().regex(/^(\+?254|0)7\d{8}$/, 'Enter a valid Kenyan mobile number'),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

const statusVariant: Record<string, 'green' | 'yellow' | 'red' | 'gray'> = {
  active: 'green',
  pending: 'yellow',
  suspended: 'red',
  deactivated: 'gray',
};

export default function UserProfilePage() {
  const qc = useQueryClient();
  const storeUser = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [profileSaved, setProfileSaved] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);

  const { data: user } = useQuery<UserProfile>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const res = await apiClient.get<{ data: UserProfile }>('/auth/me');
      return res.data.data;
    },
    initialData: storeUser ?? undefined,
  });

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: user ? { fullName: user.fullName, phone: user.phone } : undefined,
  });

  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const { mutate: saveProfile, isPending: savingProfile } = useMutation({
    mutationFn: (data: ProfileForm) =>
      apiClient.patch<{ data: UserProfile }>(`/users/${user?.id}`, data),
    onSuccess(res) {
      const updated = res.data.data;
      setUser(updated);
      qc.setQueryData(['auth', 'me'], updated);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    },
  });

  const { mutate: changePassword, isPending: changingPw } = useMutation({
    mutationFn: (data: PasswordForm) =>
      apiClient.patch(`/users/${user?.id}/password`, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }),
    onSuccess() {
      passwordForm.reset();
      setPwSaved(true);
      setTimeout(() => setPwSaved(false), 3000);
    },
    onError() {
      passwordForm.setError('currentPassword', { message: 'Current password is incorrect' });
    },
  });

  if (!user) return null;

  return (
    <div className="page-container max-w-2xl mx-auto space-y-6">
      <h1 className="section-heading">My Profile</h1>

      {/* Profile card */}
      <Card>
        <div className="flex items-center gap-4 mb-6">
          <Avatar name={user.fullName} src={user.avatarUrl} size="lg" />
          <div>
            <p className="font-semibold text-gray-900 text-lg">{user.fullName}</p>
            <p className="text-sm text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant={statusVariant[user.status] ?? 'gray'}>
                {user.status}
              </Badge>
              {user.lastLoginAt && (
                <span className="text-xs text-gray-400">
                  Last login: {formatDateTime(user.lastLoginAt)}
                </span>
              )}
            </div>
          </div>
        </div>

        <form
          onSubmit={profileForm.handleSubmit((v) => saveProfile(v))}
          noValidate
          className="space-y-4"
        >
          <Input
            label="Full name"
            required
            error={profileForm.formState.errors.fullName?.message}
            {...profileForm.register('fullName')}
          />
          <Input
            label="Phone number"
            type="tel"
            required
            hint="e.g. 0712345678"
            error={profileForm.formState.errors.phone?.message}
            {...profileForm.register('phone')}
          />
          <Input label="Email address" type="email" value={user.email} disabled />

          <div className="flex items-center gap-3">
            <Button type="submit" loading={savingProfile}>
              Save profile
            </Button>
            {profileSaved && (
              <span className="flex items-center gap-1 text-sm text-green-600">
                <CheckCircle size={15} /> Saved
              </span>
            )}
          </div>
        </form>
      </Card>

      {/* Change password */}
      <Card>
        <h2 className="font-semibold text-gray-900 mb-4">Change Password</h2>
        <form
          onSubmit={passwordForm.handleSubmit((v) => changePassword(v))}
          noValidate
          className="space-y-4"
        >
          <Input
            label="Current password"
            type="password"
            autoComplete="current-password"
            required
            error={passwordForm.formState.errors.currentPassword?.message}
            {...passwordForm.register('currentPassword')}
          />
          <Input
            label="New password"
            type="password"
            autoComplete="new-password"
            required
            error={passwordForm.formState.errors.newPassword?.message}
            {...passwordForm.register('newPassword')}
          />
          <Input
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            required
            error={passwordForm.formState.errors.confirmPassword?.message}
            {...passwordForm.register('confirmPassword')}
          />
          <div className="flex items-center gap-3">
            <Button type="submit" variant="secondary" loading={changingPw}>
              Change password
            </Button>
            {pwSaved && (
              <span className="flex items-center gap-1 text-sm text-green-600">
                <CheckCircle size={15} /> Password updated
              </span>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
