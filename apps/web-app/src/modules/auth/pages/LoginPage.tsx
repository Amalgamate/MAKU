import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Sprout, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../../shared/store/auth.store';
import { useOrgStore } from '../../settings/store/org.store';
import { authService } from '../services/auth.service';

const schema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const setAuth   = useAuthStore((s) => s.setAuth);
  const org       = useOrgStore();
  const from      = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard';
  const [showPw, setShowPw] = useState(false);

  const { register, handleSubmit, formState: { errors }, setError } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
  });

  const { mutate: login, isPending } = useMutation({
    mutationFn: authService.login,
    onSuccess(data) {
      setAuth(data.user, data.accessToken);
      navigate(from, { replace: true });
    },
    onError() {
      setError('password', { message: 'Invalid email or password' });
    },
  });

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ backgroundColor: '#7e2710' }}
    >
      {/* Floating card */}
      <div className="w-full max-w-[380px] rounded-2xl px-10 py-10 shadow-2xl" style={{ backgroundColor: '#F7F2EE' }}>

        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          {org.logoUrl ? (
            <img
              src={org.logoUrl}
              alt={org.name}
              className="h-[105px] w-auto max-w-[300px] object-contain"
            />
          ) : (
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <Sprout size={52} style={{ color: '#7e2710' }} />
                <span
                  className="text-[50px] font-extrabold tracking-tight"
                  style={{ color: '#7e2710' }}
                >
                  {org.name}
                </span>
              </div>
              <span className="text-[11px] uppercase tracking-[0.2em] text-gray-400 font-medium">
                {org.tagline.split(' ').slice(0, 3).join(' ')}
              </span>
            </div>
          )}
        </div>

        {/* Heading */}
        <h1 className="mb-6 text-center text-lg font-semibold text-gray-800">
          Welcome back, {org.name}
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit((v) => login(v))} noValidate className="space-y-4">

          {/* Email */}
          <div className="relative">
            <Mail
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="email"
              autoComplete="email"
              placeholder="Email address"
              {...register('email')}
              className={[
                'w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm text-gray-800 placeholder:text-gray-400',
                'transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1',
                errors.email
                  ? 'border-red-400 focus:ring-red-400/30'
                  : 'border-gray-200 focus:border-[#7e2710] focus:ring-[#7e2710]/20',
              ].join(' ')}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <Lock
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Password"
              {...register('password')}
              className={[
                'w-full rounded-lg border py-2.5 pl-10 pr-10 text-sm text-gray-800 placeholder:text-gray-400',
                'transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1',
                errors.password
                  ? 'border-red-400 focus:ring-red-400/30'
                  : 'border-gray-200 focus:border-[#7e2710] focus:ring-[#7e2710]/20',
              ].join(' ')}
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className={[
              'w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-all',
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              isPending ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90 active:scale-[0.99]',
            ].join(' ')}
            style={{ backgroundColor: '#7e2710' }}
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Signing in…
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        {/* Forgot password */}
        <div className="mt-5 text-center">
          <Link
            to="/forgot-password"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Register */}
        <div className="mt-3 text-center">
          <span className="text-xs text-gray-400">Not a member? </span>
          <Link
            to="/register"
            className="text-xs font-medium transition-colors hover:underline"
            style={{ color: '#7e2710' }}
          >
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
