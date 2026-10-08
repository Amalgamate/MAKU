import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { Sprout, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useCmsSettings } from '../hooks/useWebsiteCms';

const APP_URL = import.meta.env['VITE_APP_URL'] ?? 'https://app.maku.trendscore.co.ke';

// Static fallback nav — shown before CMS loads or if CMS has no nav links
const FALLBACK_NAV = [
  { label: 'Home', to: '/' },
  { label: 'Our Impact', to: '/impact' },
  { label: 'Partners', to: '/partners' },
  { label: 'Location', to: '/location' },
  { label: 'Find Us', to: '/find-maku' },
];

/** Convert an absolute URL to a router-relative path when it's on the same origin */
function toRelative(url: string): string {
  try {
    const u = new URL(url, window.location.origin);
    if (u.origin === window.location.origin) return u.pathname + u.search + u.hash;
  } catch { /* ignore */ }
  return url;
}

export function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: settings } = useCmsSettings();

  // Build nav from CMS if available and has inNav links; fall back to static
  const cmsNavLinks = settings?.pages
    .filter((p) => p.isInNav)
    .map((p) => ({
      label: p.title,
      to: p.isHomePage ? '/' : `/${p.slug}`,
    }));

  const navLinks = cmsNavLinks && cmsNavLinks.length > 0 ? cmsNavLinks : FALLBACK_NAV;

  // Site name + logo from CMS (fallback to static)
  const siteName = settings?.siteName ?? 'MAKU';
  const headerLogoUrl = settings?.headerLogoUrl ?? settings?.logoUrl;
  const footerLogoUrl = settings?.footerLogoUrl ?? settings?.logoUrl;

  function NavItems({ onClick }: { onClick?: () => void }) {
    return (
      <>
        {navLinks.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            onClick={onClick}
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
        {/* Render extra CMS navLinks (external or custom paths) */}
        {settings?.navLinks?.map((l) => {
          const to = toRelative(l.url);
          const isExternal = /^https?:/.test(l.url);
          return isExternal ? (
            <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
              className="text-sm font-medium text-gray-600 hover:text-brand-700 transition-colors"
              onClick={onClick}>{l.label}</a>
          ) : (
            <NavLink key={l.url} to={to} onClick={onClick}
              className={({ isActive }) =>
                ['text-sm font-medium transition-colors', isActive ? 'text-brand-700' : 'text-gray-600 hover:text-brand-700'].join(' ')
              }>{l.label}</NavLink>
          );
        })}
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" aria-label={`${siteName} home`}>
            {headerLogoUrl ? (
              <img src={headerLogoUrl} alt={siteName} className="h-8 w-auto object-contain" />
            ) : (
              <>
                <Sprout size={28} className="text-brand-700" />
                <span className="text-xl font-bold text-brand-700 tracking-tight">{siteName}</span>
              </>
            )}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Main">
            <NavItems />
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
          <nav className="md:hidden border-t border-gray-100 bg-white px-4 pb-4 flex flex-col gap-0.5" aria-label="Mobile">
            <NavItems onClick={() => setMenuOpen(false)} />
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
              {footerLogoUrl ? (
                <img src={footerLogoUrl} alt={siteName} className="h-6 w-auto object-contain" />
              ) : (
                <>
                  <Sprout size={20} className="text-brand-700" />
                  <span className="font-semibold text-brand-700">{siteName}</span>
                </>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {settings?.footerText ?? `© ${new Date().getFullYear()} Merti Animal Key Users. Merti, Isiolo County, Kenya.`}
            </p>
            {/* Social links */}
            {settings?.socialLinks && Object.keys(settings.socialLinks).length > 0 && (
              <div className="flex items-center gap-3">
                {settings.socialLinks.facebook && (
                  <a href={settings.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-brand-700 transition-colors">Facebook</a>
                )}
                {settings.socialLinks.twitter && (
                  <a href={settings.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-brand-700 transition-colors">Twitter</a>
                )}
                {settings.socialLinks.whatsapp && (
                  <a href={settings.socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-brand-700 transition-colors">WhatsApp</a>
                )}
              </div>
            )}
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
