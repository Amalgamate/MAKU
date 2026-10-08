import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Sprout, ArrowLeft } from 'lucide-react';
import { Button, Input, Card } from '@maku/ui';
import { authService } from '../services/auth.service';

const schema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d+$/, 'OTP must be numeric'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const { mutate, isPending } = useMutation({
    mutationFn: (values: FormValues) =>
      authService.resetPassword({ token: '', otp: values.otp, newPassword: values.newPassword }),
    onSuccess() {
      navigate('/login', { state: { message: 'Password reset successfully. Please sign in.' } });
    },
    onError() {
      setError('otp', { message: 'Invalid or expired OTP. Please request a new one.' });
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-2">
          <Sprout size={36} className="text-brand-700" />
          <span className="text-2xl font-bold text-brand-700">Set New Password</span>
        </div>

        <Card>
          <h1 className="mb-2 text-lg font-semibold text-gray-900">Enter your OTP</h1>
          <p className="mb-6 text-sm text-gray-500">
            Enter the 6-digit code from your email or SMS, then choose a new password.
          </p>

          <form onSubmit={handleSubmit((v) => mutate(v))} noValidate className="space-y-4">
            <Input
              label="One-time code (OTP)"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
              error={errors.otp?.message}
              {...register('otp')}
            />
            <Input
              label="New password"
              type="password"
              autoComplete="new-password"
              required
              error={errors.newPassword?.message}
              {...register('newPassword')}
            />
            <Input
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              required
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
            <Button type="submit" className="w-full" loading={isPending}>
              Reset password
            </Button>
          </form>
        </Card>

        <Link
          to="/forgot-password"
          className="flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-brand-700"
        >
          <ArrowLeft size={14} /> Request a new code
        </Link>
      </div>
    </div>
  );
}
