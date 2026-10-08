import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { Sprout, Menu, X } from 'lucide-react';
import { useState } from 'react';

const APP_URL = import.meta.env['VITE_APP_URL'] ?? 'https://app.maku.trendscore.co.ke';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Our Impact', to: '/impact' },
  { label: 'Partners', to: '/partners' },
  { label: 'Location', to: '/location' },
  { label: 'Find Us', to: '/find-maku' },
];

export function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" aria-label="MAKU home">
            <Sprout size={28} className="text-brand-700" />
            <span className="text-xl font-bold text-brand-700 tracking-tight">MAKU</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Main">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  ['text-sm font-medium transition-colors', isActive
                    ? 'text-brand-700'
                    : 'text-gray-600 hover:text-brand-700',
                  ].join(' ')
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/register"
              className="rounded-md border border-brand-700 px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50 transition-colors"
            >
              Join MAKU
            </Link>
            <a
              href={`${APP_URL}/login`}
              className="rounded-md bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800 transition-colors"
            >
              Member Login
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden rounded-md p-2 text-gray-500 hover:bg-gray-100"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <nav className="md:hidden border-t border-gray-100 bg-white px-4 pb-4" aria-label="Mobile">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  ['block py-2 text-sm font-medium', isActive ? 'text-brand-700' : 'text-gray-700'].join(' ')
                }
              >
                {l.label}
              </NavLink>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="rounded-md border border-brand-700 px-4 py-2 text-center text-sm font-medium text-brand-700"
              >
                Join MAKU
              </Link>
              <a
                href={`${APP_URL}/login`}
                className="rounded-md bg-brand-700 px-4 py-2 text-center text-sm font-medium text-white"
              >
                Member Login
              </a>
            </div>
          </nav>
        )}
      </header>

      {/* Page content */}
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sprout size={20} className="text-brand-700" />
              <span className="font-semibold text-brand-700">MAKU Cooperative</span>
            </div>
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} Merti Animal Key Users. Merti, Isiolo County, Kenya.
            </p>
            <p className="text-xs text-gray-400">
              Powered by{' '}
              <a
                href="https://trendscore.co.ke"
                className="hover:text-brand-700 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Trends CORE
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
