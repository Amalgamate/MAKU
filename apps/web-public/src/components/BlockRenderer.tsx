import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users, TrendingUp, Star, Beef, Tractor, Droplets, Sprout,
  ShoppingCart, Landmark, Wallet, ClipboardList, UserCog, Building2,
  Globe, FolderOpen, FileText, MessageSquare, Shield, Settings,
  MapPin, Phone, Mail, Clock, Quote, type LucideProps,
} from 'lucide-react';
import type { CmsBlock } from '../hooks/useWebsiteCms';

// ─── Icon lookup ──────────────────────────────────────────────────────────────

type LucideIcon = React.ForwardRefExoticComponent<
  Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
>;

const ICON_MAP: Record<string, LucideIcon> = {
  Users, TrendingUp, Star, Beef, Tractor, Droplets, Sprout,
  ShoppingCart, Landmark, Wallet, ClipboardList, UserCog, Building2,
  Globe, FolderOpen, FileText, MessageSquare, Shield, Settings,
  MapPin, Phone, Mail, Clock, Quote,
};

function DynIcon({ name, size = 28, className = '' }: { name: string; size?: number; className?: string }) {
  const Ic: LucideIcon = ICON_MAP[name] ?? Star;
  return <Ic size={size} className={className} />;
}

/** Safely coerce an unknown block field to string */
function s(v: unknown): string { return v == null ? '' : String(v); }

// ─── Link helper ──────────────────────────────────────────────────────────────

interface CmsLinkProps { to: string; label: string; variant?: 'primary' | 'outline' | 'white-outline'; className?: string }
function CmsLink({ to, label, variant = 'primary', className = '' }: CmsLinkProps) {
  const isExternal = /^https?:/.test(to);
  const base = 'inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-semibold transition-colors';
  const styles: Record<string, string> = {
    primary: `${base} bg-brand-700 text-white hover:bg-brand-800`,
    outline: `${base} border border-brand-700 text-brand-700 hover:bg-brand-50`,
    'white-outline': `${base} border border-white text-white hover:bg-white/10`,
  };
  const cls = `${styles[variant] ?? styles.primary} ${className}`;
  if (isExternal) return <a href={to} className={cls} target="_blank" rel="noopener noreferrer">{label}</a>;
  return <Link to={to} className={cls}>{label}</Link>;
}

// ─── Hero block ───────────────────────────────────────────────────────────────

function HeroBlock({ block }: { block: CmsBlock }) {
  const bg = s(block['backgroundImage']);
  const heading = s(block['heading']);
  const subheading = s(block['subheading']);
  const primaryLabel = s(block['primaryBtnLabel']);
  const primaryUrl = s(block['primaryBtnUrl']);
  const secondaryLabel = s(block['secondaryBtnLabel']);
  const secondaryUrl = s(block['secondaryBtnUrl']);

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-brand-950 to-brand-800 py-24 text-white"
      style={bg ? { backgroundImage: `url(${bg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
    >
      {bg && <div className="absolute inset-0 bg-brand-950/60" />}
      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        {heading && <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">{heading}</h1>}
        {subheading && <p className="mt-6 text-lg text-brand-100 max-w-2xl mx-auto">{subheading}</p>}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          {primaryLabel && primaryUrl && (
            <CmsLink to={primaryUrl} label={primaryLabel} variant="primary" className="!bg-white !text-brand-700 hover:!bg-green-50" />
          )}
          {secondaryLabel && secondaryUrl && (
            <CmsLink to={secondaryUrl} label={secondaryLabel} variant="white-outline" />
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Stats block ──────────────────────────────────────────────────────────────

function StatsBlock({ block }: { block: CmsBlock }) {
  const items = (block['items'] as Array<{ icon: string; label: string; value: string }>) ?? [];
  const heading = s(block['heading']);
  const cols = items.length >= 4 ? 'sm:grid-cols-4' : `sm:grid-cols-${items.length}`;

  return (
    <section className="py-16 bg-white" aria-label={heading || 'Stats'}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {heading && <h2 className="text-center text-2xl font-bold text-gray-900 mb-12">{heading}</h2>}
        <div className={`grid gap-6 grid-cols-2 ${cols}`}>
          {items.map((stat, i) => (
            <div key={i} className="flex flex-col items-center gap-3 rounded-xl border border-gray-100 p-6 text-center shadow-sm">
              <DynIcon name={stat.icon} size={28} className="text-brand-700" />
              <span className="text-3xl font-extrabold text-gray-900">{stat.value}</span>
              <span className="text-sm text-gray-500">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Services block ───────────────────────────────────────────────────────────

function ServicesBlock({ block }: { block: CmsBlock }) {
  const items = (block['items'] as Array<{ icon: string; title: string; description: string }>) ?? [];
  const heading = s(block['heading']);
  const subheading = s(block['subheading']);

  return (
    <section className="py-16 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {heading && <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">{heading}</h2>}
        {subheading && <p className="text-center text-gray-500 mb-10">{subheading}</p>}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <DynIcon name={item.icon} size={24} className="text-brand-700 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Text + image block ───────────────────────────────────────────────────────

function TextImageBlock({ block }: { block: CmsBlock }) {
  const imgLeft = block['imagePosition'] === 'left';
  const heading = s(block['heading']);
  const body = s(block['body']);
  const imageUrl = s(block['imageUrl']);
  const imageAlt = s(block['imageAlt']);
  const btnLabel = s(block['btnLabel']);
  const btnUrl = s(block['btnUrl']);

  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className={`flex flex-col gap-10 lg:flex-row ${imgLeft ? 'lg:flex-row-reverse' : ''} items-center`}>
          <div className="flex-1 space-y-4">
            {heading && <h2 className="text-2xl font-bold text-gray-900">{heading}</h2>}
            {body && <p className="text-gray-600 leading-relaxed whitespace-pre-line">{body}</p>}
            {btnLabel && btnUrl && <CmsLink to={btnUrl} label={btnLabel} variant="outline" />}
          </div>
          {imageUrl && (
            <div className="flex-1">
              <img src={imageUrl} alt={imageAlt} className="w-full rounded-2xl object-cover shadow-md max-h-80" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── CTA block ────────────────────────────────────────────────────────────────

function CtaBlock({ block }: { block: CmsBlock }) {
  const bg = s(block['bgColor']) || '#7e2710';
  const heading = s(block['heading']);
  const subheading = s(block['subheading']);
  const btnLabel = s(block['btnLabel']);
  const btnUrl = s(block['btnUrl']);

  return (
    <section className="py-16 text-white text-center" style={{ backgroundColor: bg }}>
      <div className="mx-auto max-w-2xl px-4">
        {heading && <h2 className="text-2xl font-bold mb-4">{heading}</h2>}
        {subheading && <p className="mb-8 opacity-80">{subheading}</p>}
        {btnLabel && btnUrl && (
          <CmsLink to={btnUrl} label={btnLabel} variant="primary" className="!bg-white !text-brand-700 hover:!bg-gray-50" />
        )}
      </div>
    </section>
  );
}

// ─── Contact block ────────────────────────────────────────────────────────────

function ContactBlock({ block }: { block: CmsBlock }) {
  const heading = s(block['heading']);
  const address = s(block['address']);
  const phone = s(block['phone']);
  const email = s(block['email']);
  const hours = s(block['hours']);
  const mapUrl = s(block['mapEmbedUrl']);

  return (
    <section className="py-16 bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {heading && <h2 className="text-2xl font-bold text-gray-900 mb-10 text-center">{heading}</h2>}
        <div className={`grid gap-8 ${mapUrl ? 'lg:grid-cols-2' : ''}`}>
          <div className="space-y-4">
            {address && (
              <div className="flex gap-3">
                <MapPin size={20} className="text-brand-700 shrink-0 mt-0.5" />
                <p className="text-gray-700 whitespace-pre-line">{address}</p>
              </div>
            )}
            {phone && (
              <div className="flex gap-3">
                <Phone size={20} className="text-brand-700 shrink-0" />
                <a href={`tel:${phone}`} className="text-gray-700 hover:text-brand-700">{phone}</a>
              </div>
            )}
            {email && (
              <div className="flex gap-3">
                <Mail size={20} className="text-brand-700 shrink-0" />
                <a href={`mailto:${email}`} className="text-gray-700 hover:text-brand-700">{email}</a>
              </div>
            )}
            {hours && (
              <div className="flex gap-3">
                <Clock size={20} className="text-brand-700 shrink-0" />
                <p className="text-gray-700">{hours}</p>
              </div>
            )}
          </div>
          {mapUrl && (
            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm h-64">
              <iframe src={mapUrl} className="w-full h-full" loading="lazy" allowFullScreen title="Map" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonial block ────────────────────────────────────────────────────────

function TestimonialBlock({ block }: { block: CmsBlock }) {
  const items = (block['items'] as Array<{ name: string; role: string; quote: string; avatarUrl?: string }>) ?? [];
  const heading = s(block['heading']);

  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {heading && <h2 className="text-2xl font-bold text-gray-900 mb-10 text-center">{heading}</h2>}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-gray-50 p-6">
              <Quote size={24} className="text-brand-200 mb-3" />
              <p className="text-gray-700 italic mb-4">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                {t.avatarUrl ? (
                  <img src={t.avatarUrl} alt={t.name} className="h-10 w-10 rounded-full object-cover border border-gray-200" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold shrink-0">
                    {t.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900">{t.name}</p>
                  <p className="text-sm text-gray-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Gallery block ────────────────────────────────────────────────────────────

function GalleryBlock({ block }: { block: CmsBlock }) {
  const items = (block['items'] as Array<{ url: string; caption?: string }>) ?? [];
  const heading = s(block['heading']);
  if (items.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {heading && <h2 className="text-2xl font-bold text-gray-900 mb-10 text-center">{heading}</h2>}
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item, i) => (
            <figure key={i} className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
              <img src={item.url} alt={item.caption ?? ''} className="w-full h-48 object-cover" />
              {item.caption && <figcaption className="px-3 py-2 text-xs text-gray-500">{item.caption}</figcaption>}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Main dispatcher ──────────────────────────────────────────────────────────

export function BlockRenderer({ block }: { block: CmsBlock }) {
  switch (block.type) {
    case 'hero':        return <HeroBlock block={block} />;
    case 'stats':       return <StatsBlock block={block} />;
    case 'services':    return <ServicesBlock block={block} />;
    case 'text_image':  return <TextImageBlock block={block} />;
    case 'cta':         return <CtaBlock block={block} />;
    case 'contact':     return <ContactBlock block={block} />;
    case 'testimonial': return <TestimonialBlock block={block} />;
    case 'gallery':     return <GalleryBlock block={block} />;
    default:            return null;
  }
}
