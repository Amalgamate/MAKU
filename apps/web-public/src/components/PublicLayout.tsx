import React, { useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { Sprout, Menu, X } from 'lucide-react';
import { useCmsSettings, type CmsNavLink, type CmsHeaderCta } from '../hooks/useWebsiteCms';

const APP_URL = import.meta.env['VITE_APP_URL'] ?? 'https://app.maku.trendscore.co.ke';

// ─── Static fallbacks ─────────────────────────────────────────────────────────

const FALLBACK_NAV: CmsNavLink[] = [
  { label: 'Home', url: '/' },
  { label: 'Our Impact', url: '/impact' },
  { label: 'Partners', url: '/partners' },
  { label: 'Location', url: '/location' },
  { label: 'Find Us', url: '/find-maku' },
];

const FALLBACK_CTAS: CmsHeaderCta[] = [
  { label: 'Join MAKU', url: '/register', style: 'outline' },
  { label: 'Member Login', url: `${APP_URL}/login`, style: 'primary' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isExternal(url: string) { return /^https?:\/\//.test(url); }

function toPath(url: string): string {
  try {
    const u = new URL(url, window.location.origin);
    if (u.origin === window.location.origin) return u.pathname + u.search + u.hash;
  } catch { /* ignore */ }
  return url;
}

// ─── Nav links ────────────────────────────────────────────────────────────────

function NavLinks({ links, onClick }: { links: CmsNavLink[]; onClick?: () => void }) {
  return (
    <>
      {links.map((l) => {
        if (isExternal(l.url)) {
          return (
            <a
              key={l.url + l.label}
              href={l.url}
              target={l.openInNewTab !== false ? '_blank' : undefined}
              rel="noopener noreferrer"
              onClick={onClick}
              className="text-sm font-medium text-gray-600 hover:text-brand-700 transition-colors"
            >
              {l.label}
            </a>
          );
        }
        return (
          <NavLink
            key={l.url + l.label}
            to={toPath(l.url)}
            end={toPath(l.url) === '/'}
            onClick={onClick}
            className={({ isActive }) =>
              ['text-sm font-medium transition-colors',
                isActive ? 'text-brand-700' : 'text-gray-600 hover:text-brand-700',
              ].join(' ')
            }
          >
            {l.label}
          </NavLink>
        );
      })}
    </>
  );
}

// ─── CTA buttons ──────────────────────────────────────────────────────────────

function CtaButtons({ ctas, onClick, block = false }: { ctas: CmsHeaderCta[]; onClick?: () => void; block?: boolean }) {
  return (
    <>
      {ctas.map((cta) => {
        const base = block
          ? 'block rounded-md px-4 py-2 text-center text-sm font-medium transition-colors'
          : 'rounded-md px-4 py-2 text-sm font-medium transition-colors';
        const style = cta.style === 'primary'
          ? `${base} bg-brand-700 text-white hover:bg-brand-800`
          : `${base} border border-brand-700 text-brand-700 hover:bg-brand-50`;

        if (isExternal(cta.url)) {
          return (
            <a key={cta.label} href={cta.url} className={style}
              target="_blank" rel="noopener noreferrer" onClick={onClick}>
              {cta.label}
            </a>
          );
        }
        return (
          <Link key={cta.label} to={toPath(cta.url)} className={style} onClick={onClick}>
            {cta.label}
          </Link>
        );
      })}
    </>
  );
}

// ─── Logo ─────────────────────────────────────────────────────────────────────

function SiteLogo({ logoUrl, siteName, size = 'md' }: { logoUrl: string | null; siteName: string; size?: 'sm' | 'md' }) {
  return (
    <Link to="/" className="flex items-center gap-2 shrink-0" aria-label={`${siteName} home`}>
      {logoUrl ? (
        <img src={logoUrl} alt={siteName}
          className={size === 'sm' ? 'h-6 w-auto object-contain' : 'h-8 w-auto object-contain'} />
      ) : (
        <>
          <Sprout size={size === 'sm' ? 20 : 28} className="text-brand-700" />
          <span className={`font-bold text-brand-700 tracking-tight ${size === 'sm' ? 'text-base' : 'text-xl'}`}>
            {siteName}
          </span>
        </>
      )}
    </Link>
  );
}

// ─── Main layout ──────────────────────────────────────────────────────────────

export function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: settings } = useCmsSettings();

  const siteName = settings?.siteName ?? 'MAKU';
  const headerLogoUrl = settings?.headerLogoUrl ?? settings?.logoUrl ?? null;
  const footerLogoUrl = settings?.footerLogoUrl ?? settings?.logoUrl ?? null;
  const logoPosition = settings?.logoPosition ?? 'left';
  const navPosition = settings?.navPosition ?? 'center';

  // Nav links: prefer explicit navLinks array; fall back to pages marked isInNav
  const navLinks: CmsNavLink[] = (() => {
    if (settings?.navLinks && settings.navLinks.length > 0) return settings.navLinks;
    const fromPages = settings?.pages
      .filter((p) => p.isInNav)
      .map((p) => ({ label: p.title, url: p.isHomePage ? '/' : `/${p.slug}` }));
    return fromPages && fromPages.length > 0 ? fromPages : FALLBACK_NAV;
  })();

  const ctas: CmsHeaderCta[] = settings?.headerCtas && settings.headerCtas.length > 0
    ? settings.headerCtas
    : FALLBACK_CTAS;

  // ── Header layout grid based on logo + nav positions ──────────────────────
  //
  // We use a 3-zone approach: left | center | right
  // Depending on logoPosition and navPosition we place elements accordingly.
  //
  // Supported combos:
  //  logo=left,  nav=center → [Logo] [Nav (center)] [CTAs]
  //  logo=left,  nav=left   → [Logo + Nav] [spacer] [CTAs]
  //  logo=left,  nav=right  → [Logo] [spacer] [Nav + CTAs]
  //  logo=center, nav=left  → [Nav] [Logo (center)] [CTAs]
  //  logo=center, nav=right → [CTAs] [Logo (center)] [Nav]
  //  logo=right, nav=left   → [Nav] [spacer] [Logo + CTAs]
  //  etc.

  const logoLeft   = logoPosition === 'left';
  const logoCenter = logoPosition === 'center';
  const logoRight  = logoPosition === 'right';
  const navLeft    = navPosition === 'left';
  const navCenter  = navPosition === 'center';
  const navRight   = navPosition === 'right';

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3">

          {/* Desktop layout */}
          <div className="hidden md:flex items-center gap-6">

            {/* LEFT zone */}
            <div className={`flex items-center gap-4 ${logoLeft || navLeft ? 'flex-1' : ''}`}>
              {logoLeft && <SiteLogo logoUrl={headerLogoUrl} siteName={siteName} />}
              {navLeft && (
                <nav className="flex items-center gap-5" aria-label="Main">
                  <NavLinks links={navLinks} />
                </nav>
              )}
              {!logoLeft && !navLeft && <div className="flex-1" />}
            </div>

            {/* CENTER zone */}
            <div className="flex items-center gap-5">
              {logoCenter && <SiteLogo logoUrl={headerLogoUrl} siteName={siteName} />}
              {navCenter && (
                <nav className="flex items-center gap-5" aria-label="Main">
                  <NavLinks links={navLinks} />
                </nav>
              )}
            </div>

            {/* RIGHT zone */}
            <div className={`flex items-center gap-3 ${logoRight || navRight || (!logoLeft && !logoCenter) ? 'ml-auto' : 'ml-auto'}`}>
              {navRight && (
                <nav className="flex items-center gap-5 mr-2" aria-label="Main">
                  <NavLinks links={navLinks} />
                </nav>
              )}
              {logoRight && <SiteLogo logoUrl={headerLogoUrl} siteName={siteName} />}
              <div className="flex items-center gap-2">
                <CtaButtons ctas={ctas} />
              </div>
            </div>

          </div>

          {/* Mobile layout — always: logo left, hamburger right */}
          <div className="flex md:hidden items-center justify-between">
            <SiteLogo logoUrl={headerLogoUrl} siteName={siteName} />
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <nav className="md:hidden border-t border-gray-100 bg-white px-4 pb-4 flex flex-col gap-1" aria-label="Mobile">
            <NavLinks links={navLinks} onClick={() => setMenuOpen(false)} />
            <div className="mt-3 flex flex-col gap-2">
              <CtaButtons ctas={ctas} onClick={() => setMenuOpen(false)} block />
            </div>
          </nav>
        )}
      </header>

      {/* ── Page content ──────────────────────────────────────────────────── */}
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <Outlet />
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-200 bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <SiteLogo logoUrl={footerLogoUrl} siteName={siteName} size="sm" />
            <p className="text-xs text-gray-500 text-center">
              {settings?.footerText ?? `© ${new Date().getFullYear()} Merti Animal Key Users. Merti, Isiolo County, Kenya.`}
            </p>
            {/* Social links */}
            {settings?.socialLinks && (
              <div className="flex items-center gap-4">
                {settings.socialLinks.facebook && (
                  <a href={settings.socialLinks.facebook} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-gray-400 hover:text-brand-700 transition-colors">Facebook</a>
                )}
                {settings.socialLinks.twitter && (
                  <a href={settings.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-gray-400 hover:text-brand-700 transition-colors">Twitter / X</a>
                )}
                {settings.socialLinks.whatsapp && (
                  <a href={settings.socialLinks.whatsapp} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-gray-400 hover:text-brand-700 transition-colors">WhatsApp</a>
                )}
              </div>
            )}
            <p className="text-xs text-gray-400">
              Powered by{' '}
              <a href="https://trendscore.co.ke" target="_blank" rel="noopener noreferrer"
                className="hover:text-brand-700 transition-colors">
                Trends CORE
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
