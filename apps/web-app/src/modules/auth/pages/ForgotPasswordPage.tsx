import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Sprout, ArrowLeft } from 'lucide-react';
import { Button, Input, Card } from '@maku/ui';
import { authService } from '../services/auth.service';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
});
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: (values: FormValues) => authService.forgotPassword({ email: values.email }),
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-2">
          <Sprout size={36} className="text-brand-700" />
          <span className="text-2xl font-bold text-brand-700">Reset Password</span>
        </div>

        <Card>
          {isSuccess ? (
            <div className="space-y-4 text-center">
              <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
                If that account exists, a 6-digit OTP has been sent to your email or phone.
              </div>
              <Link
                to="/reset-password"
                className="block text-sm font-medium text-brand-700 hover:underline"
              >
                Enter your OTP →
              </Link>
            </div>
          ) : (
            <>
              <h1 className="mb-2 text-lg font-semibold text-gray-900">Forgot your password?</h1>
              <p className="mb-6 text-sm text-gray-500">
                Enter your email address and we'll send you a one-time code to reset it.
              </p>

              <form
                onSubmit={handleSubmit((v) => mutate(v))}
                noValidate
                className="space-y-4"
              >
                <Input
                  label="Email address"
                  type="email"
                  autoComplete="email"
                  required
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Button type="submit" className="w-full" loading={isPending}>
                  Send reset code
                </Button>
              </form>
            </>
          )}
        </Card>

        <Link
          to="/login"
          className="flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-brand-700"
        >
          <ArrowLeft size={14} /> Back to sign in
        </Link>
      </div>
    </div>
  );
}
