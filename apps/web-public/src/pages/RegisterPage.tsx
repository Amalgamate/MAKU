import React from 'react';
import { Sprout } from 'lucide-react';

// This page is a lightweight entry point.
// The full self-registration form is built in web-app (M01) and embedded here
// via an iframe or redirect. For now we redirect to app.

const APP_URL = import.meta.env['VITE_APP_URL'] ?? 'https://app.maku.trendscore.co.ke';

export default function RegisterPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <Sprout size={48} className="text-brand-700" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Join MAKU</h1>
        <p className="text-gray-600 mb-8">
          Register as a member to access cooperative services, livestock marketing, water vouchers,
          and more.
        </p>
        <a
          href={`${APP_URL}/register`}
          className="inline-block rounded-md bg-brand-700 px-8 py-3 text-sm font-semibold text-white hover:bg-brand-800 transition-colors"
        >
          Start Registration →
        </a>
        <p className="mt-6 text-xs text-gray-400">
          Already a member?{' '}
          <a href={`${APP_URL}/login`} className="text-brand-700 hover:underline">
            Sign in here
          </a>
        </p>
      </div>
    </div>
  );
}
