import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Globe, Plus, Save, Eye, Upload, X, Settings2,
  Layout, ChevronRight, ChevronUp, ChevronDown,
  Trash2, Check, ExternalLink, Sprout,
} from 'lucide-react';
import { Button, Card, Badge, Spinner } from '@maku/ui';
import {
  useWebsiteSettings, useUpdateWebsiteSettings,
  useAddPage, useUpdatePage, useDeletePage,
  useSaveBlocks, usePublishWebsite,
  type WebsitePageData, type BlockData,
} from '../hooks/useWebsite';
import { BlockCard, BLOCK_CATALOGUE } from '../components/BlockEditor';
import { apiClient } from '../../../shared/services/api.client';

type View = 'pages' | 'editor' | 'settings';

// ─── Page list panel ──────────────────────────────────────────────────────────

function PageList({
  pages,
  activePage,
  onSelect,
  onAdd,
  onDelete,
}: {
  pages: WebsitePageData[];
  activePage: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
}) {
  const [confirmId, setConfirmId] = useState<string | null>(null);

  return (
    <div className="space-y-1">
      {pages.map((p) => (
        <div
          key={p.id}
          className={[
            'flex items-center gap-2 rounded-lg px-3 py-2.5 cursor-pointer transition-colors group',
            activePage === p.id ? 'bg-brand-700 text-white' : 'hover:bg-gray-100 text-gray-700',
          ].join(' ')}
          onClick={() => onSelect(p.id)}
        >
          <Layout size={14} className="shrink-0" />
          <span className="flex-1 text-sm font-medium truncate">{p.title}</span>
          {p.isHomePage && (
            <span className={`text-[10px] rounded px-1 font-semibold ${activePage === p.id ? 'bg-white/20 text-white' : 'bg-brand-100 text-brand-700'}`}>
              HOME
            </span>
          )}
          {!p.isHomePage && (
            confirmId === p.id ? (
              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => { onDelete(p.id); setConfirmId(null); }}
                  className="rounded p-1 bg-red-500 text-white hover:bg-red-600"><Check size={11} /></button>
                <button onClick={() => setConfirmId(null)}
                  className="rounded p-1 bg-gray-200 text-gray-600 hover:bg-gray-300"><X size={11} /></button>
              </div>
            ) : (
              <button
                className={`opacity-0 group-hover:opacity-100 rounded p-1 transition-all ${activePage === p.id ? 'text-white/70 hover:text-white hover:bg-white/20' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                onClick={(e) => { e.stopPropagation(); setConfirmId(p.id); }}
              >
                <Trash2 size={12} />
              </button>
            )
          )}
        </div>
      ))}
      <button
        onClick={onAdd}
        className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm text-brand-700 hover:bg-brand-50 transition-colors border border-dashed border-brand-300"
      >
        <Plus size={14} /> Add page
      </button>
    </div>
  );
}

// ─── Add block picker ─────────────────────────────────────────────────────────

function BlockPicker({ onPick, onClose }: { onPick: (b: BlockData) => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="font-semibold text-gray-900">Choose a block</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><X size={18} /></button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 p-6">
          {BLOCK_CATALOGUE.map((c) => (
            <button
              key={c.type}
              onClick={() => { onPick({ ...c.defaults } as BlockData); onClose(); }}
              className="flex items-start gap-3 rounded-xl border border-gray-200 p-4 text-left hover:border-brand-400 hover:bg-brand-50 transition-all"
            >
              <span className="text-2xl">{c.emoji}</span>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{c.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{c.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Global settings panel ────────────────────────────────────────────────────

function WebsiteLogoUpload({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file?: File) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Choose an image file.');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError('Image must be 4 MB or smaller.');
      return;
    }

    setError(null);
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await apiClient.post<{ data: { url: string } }>('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(response.data.data.url);
    } catch {
      setError('Upload failed. Check your connection and try again.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <p className="mt-1 text-xs text-gray-500">PNG, JPG, WebP, or SVG · max 4 MB</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <div className="flex h-16 min-w-24 max-w-48 items-center justify-center rounded border border-dashed border-gray-300 bg-gray-50 p-2">
          {value ? <img src={value} alt={`${label} preview`} className="max-h-full max-w-full object-contain" /> : <span className="text-xs text-gray-400">No logo selected</span>}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          aria-label={`Upload ${label.toLowerCase()}`}
          onChange={(event) => void upload(event.target.files?.[0])}
        />
        <Button variant="secondary" size="sm" loading={uploading} onClick={() => inputRef.current?.click()}>
          <Upload size={14} /> {value ? 'Replace image' : 'Upload image'}
        </Button>
        {value && (
          <Button variant="ghost" size="sm" onClick={() => { onChange(null); setError(null); }}>
            <X size={14} /> Remove
          </Button>
        )}
      </div>
      {error && <p role="alert" className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}

// ─── Global settings panel ────────────────────────────────────────────────────

type SettingsTab = 'identity' | 'navigation' | 'footer';

/** Small position picker — logo or nav alignment */
function PositionPicker({
  label, value, onChange,
}: { label: string; value: 'left' | 'center' | 'right'; onChange: (v: 'left' | 'center' | 'right') => void }) {
  const opts: Array<{ v: 'left' | 'center' | 'right'; icon: string }> = [
    { v: 'left', icon: '⬜◻◻' },
    { v: 'center', icon: '◻⬜◻' },
    { v: 'right', icon: '◻◻⬜' },
  ];
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex gap-2">
        {opts.map(({ v, icon }) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={[
              'flex-1 rounded-lg border px-3 py-2 text-xs font-semibold capitalize transition-all',
              value === v
                ? 'border-brand-600 bg-brand-50 text-brand-700'
                : 'border-gray-200 text-gray-500 hover:border-gray-300',
            ].join(' ')}
          >
            <span className="block text-base mb-0.5">{icon}</span>
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Single nav link row — label, URL, new-tab toggle, drag handle */
function NavLinkRow({
  item, index, total,
  onChange, onDelete, onMoveUp, onMoveDown,
}: {
  item: { label: string; url: string; openInNewTab?: boolean };
  index: number; total: number;
  onChange: (v: typeof item) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
      {/* Reorder */}
      <div className="flex flex-col gap-0.5 pt-1">
        <button disabled={index === 0} onClick={onMoveUp}
          className="rounded p-0.5 text-gray-400 hover:bg-gray-200 disabled:opacity-20 transition-colors">
          <ChevronUp size={13} />
        </button>
        <button disabled={index === total - 1} onClick={onMoveDown}
          className="rounded p-0.5 text-gray-400 hover:bg-gray-200 disabled:opacity-20 transition-colors">
          <ChevronDown size={13} />
        </button>
      </div>

      {/* Fields */}
      <div className="flex-1 grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Label</label>
          <input
            value={item.label}
            onChange={(e) => onChange({ ...item, label: e.target.value })}
            placeholder="e.g. About Us"
            className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:border-brand-600 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">URL</label>
          <input
            value={item.url}
            onChange={(e) => onChange({ ...item, url: e.target.value })}
            placeholder="/about or https://…"
            className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:border-brand-600 focus:outline-none"
          />
        </div>
        <label className="col-span-2 flex items-center gap-2 cursor-pointer text-xs text-gray-500">
          <input
            type="checkbox"
            checked={item.openInNewTab ?? false}
            onChange={(e) => onChange({ ...item, openInNewTab: e.target.checked })}
            className="rounded border-gray-300"
          />
          Open in new tab
        </label>
      </div>

      {/* Delete */}
      <button onClick={onDelete}
        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
        <X size={14} />
      </button>
    </div>
  );
}

/** Single CTA button row */
function CtaRow({
  item, index, total,
  onChange, onDelete, onMoveUp, onMoveDown,
}: {
  item: { label: string; url: string; style: 'primary' | 'outline' };
  index: number; total: number;
  onChange: (v: typeof item) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
      <div className="flex flex-col gap-0.5 pt-1">
        <button disabled={index === 0} onClick={onMoveUp}
          className="rounded p-0.5 text-gray-400 hover:bg-gray-200 disabled:opacity-20 transition-colors">
          <ChevronUp size={13} />
        </button>
        <button disabled={index === total - 1} onClick={onMoveDown}
          className="rounded p-0.5 text-gray-400 hover:bg-gray-200 disabled:opacity-20 transition-colors">
          <ChevronDown size={13} />
        </button>
      </div>
      <div className="flex-1 grid grid-cols-3 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Label</label>
          <input
            value={item.label}
            onChange={(e) => onChange({ ...item, label: e.target.value })}
            placeholder="Join Now"
            className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:border-brand-600 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">URL</label>
          <input
            value={item.url}
            onChange={(e) => onChange({ ...item, url: e.target.value })}
            placeholder="/register"
            className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:border-brand-600 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Style</label>
          <select
            value={item.style}
            onChange={(e) => onChange({ ...item, style: e.target.value as 'primary' | 'outline' })}
            className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:border-brand-600 focus:outline-none"
          >
            <option value="primary">Filled (primary)</option>
            <option value="outline">Outline</option>
          </select>
        </div>
      </div>
      <button onClick={onDelete}
        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
        <X size={14} />
      </button>
    </div>
  );
}

function GlobalSettings({ settings }: { settings: NonNullable<ReturnType<typeof useWebsiteSettings>['data']> }) {
  const updateMutation = useUpdateWebsiteSettings();
  const [tab, setTab] = useState<SettingsTab>('identity');

  // Identity
  const [siteName, setSiteName] = useState(settings.siteName);
  const [tagline, setTagline] = useState(settings.tagline ?? '');
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor);
  const [headerLogoUrl, setHeaderLogoUrl] = useState<string | null>(settings.headerLogoUrl ?? settings.logoUrl ?? null);
  const [footerLogoUrl, setFooterLogoUrl] = useState<string | null>(settings.footerLogoUrl ?? settings.logoUrl ?? null);

  // Navigation
  const [logoPosition, setLogoPosition] = useState<'left' | 'center' | 'right'>(settings.logoPosition ?? 'left');
  const [navPosition, setNavPosition] = useState<'left' | 'center' | 'right'>(settings.navPosition ?? 'center');
  const [navLinks, setNavLinks] = useState<Array<{ label: string; url: string; openInNewTab?: boolean }>>(
    settings.navLinks ?? []
  );
  const [headerCtas, setHeaderCtas] = useState<Array<{ label: string; url: string; style: 'primary' | 'outline' }>>(
    settings.headerCtas ?? []
  );

  // Footer
  const [footerText, setFooterText] = useState(settings.footerText ?? '');
  const [socialLinks, setSocialLinks] = useState(settings.socialLinks ?? {});

  function save() {
    updateMutation.mutate({
      siteName, tagline, primaryColor,
      headerLogoUrl: headerLogoUrl ?? '',
      footerLogoUrl: footerLogoUrl ?? '',
      logoPosition, navPosition,
      navLinks, headerCtas,
      footerText,
      socialLinks,
    });
  }

  function moveNavLink(i: number, dir: -1 | 1) {
    const n = [...navLinks];
    const t = i + dir;
    if (t < 0 || t >= n.length) return;
    [n[i], n[t]] = [n[t]!, n[i]!];
    setNavLinks(n);
  }

  function moveCta(i: number, dir: -1 | 1) {
    const n = [...headerCtas];
    const t = i + dir;
    if (t < 0 || t >= n.length) return;
    [n[i], n[t]] = [n[t]!, n[i]!];
    setHeaderCtas(n);
  }

  const TABS: Array<{ id: SettingsTab; label: string }> = [
    { id: 'identity', label: 'Identity' },
    { id: 'navigation', label: 'Navigation' },
    { id: 'footer', label: 'Footer' },
  ];

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Inner tab bar */}
      <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={[
              'flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
              tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
            ].join(' ')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Identity tab ─────────────────────────────────────────────────── */}
      {tab === 'identity' && (
        <Card>
          <h3 className="font-semibold text-gray-800 mb-4">Site Identity</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site name</label>
              <input value={siteName} onChange={(e) => setSiteName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
              <input value={tagline} onChange={(e) => setTagline(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none" />
            </div>
            <WebsiteLogoUpload label="Header logo" value={headerLogoUrl} onChange={setHeaderLogoUrl} />
            <WebsiteLogoUpload label="Footer logo" value={footerLogoUrl} onChange={setFooterLogoUrl} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand colour</label>
              <div className="flex items-center gap-3">
                <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-9 w-16 rounded-lg border border-gray-300 cursor-pointer p-0.5" />
                <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded font-mono">{primaryColor}</code>
              </div>
            </div>
            <Button onClick={save} loading={updateMutation.isPending}><Save size={14} /> Save</Button>
          </div>
        </Card>
      )}

      {/* ── Navigation tab ────────────────────────────────────────────────── */}
      {tab === 'navigation' && (
        <div className="space-y-4">
          {/* Live preview strip */}
          <Card padding="sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Header Preview</p>
            <div className={[
              'flex items-center gap-4 rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs',
              navPosition === 'center' ? 'justify-between' : navPosition === 'right' ? 'flex-row' : 'flex-row',
            ].join(' ')}>
              {/* Logo */}
              {(logoPosition === 'left') && (
                <div className="flex items-center gap-1.5 shrink-0">
                  {headerLogoUrl
                    ? <img src={headerLogoUrl} alt="logo" className="h-5 w-auto object-contain" />
                    : <><Sprout size={14} className="text-brand-700" /><span className="font-bold text-brand-700 text-[11px]">{siteName}</span></>}
                </div>
              )}
              {/* Nav */}
              {(navPosition === 'left') && (
                <div className="flex gap-3 text-[11px] text-gray-500">
                  {navLinks.slice(0, 4).map((l) => <span key={l.label}>{l.label}</span>)}
                </div>
              )}
              {/* Center gap filler */}
              {(logoPosition !== 'center' && navPosition !== 'center') && <div className="flex-1" />}
              {(navPosition === 'center' || logoPosition === 'center') && (
                <div className="flex items-center gap-4">
                  {logoPosition === 'center' && (
                    <div className="flex items-center gap-1.5">
                      {headerLogoUrl
                        ? <img src={headerLogoUrl} alt="logo" className="h-5 w-auto object-contain" />
                        : <><Sprout size={14} className="text-brand-700" /><span className="font-bold text-brand-700 text-[11px]">{siteName}</span></>}
                    </div>
                  )}
                  {navPosition === 'center' && (
                    <div className="flex gap-3 text-[11px] text-gray-500">
                      {navLinks.slice(0, 4).map((l) => <span key={l.label}>{l.label}</span>)}
                    </div>
                  )}
                </div>
              )}
              {/* Right side */}
              <div className="flex items-center gap-2 ml-auto">
                {navPosition === 'right' && (
                  <div className="flex gap-3 text-[11px] text-gray-500 mr-2">
                    {navLinks.slice(0, 4).map((l) => <span key={l.label}>{l.label}</span>)}
                  </div>
                )}
                {logoPosition === 'right' && (
                  <div className="flex items-center gap-1.5">
                    {headerLogoUrl
                      ? <img src={headerLogoUrl} alt="logo" className="h-5 w-auto object-contain" />
                      : <><Sprout size={14} className="text-brand-700" /><span className="font-bold text-brand-700 text-[11px]">{siteName}</span></>}
                  </div>
                )}
                {headerCtas.slice(0, 2).map((c) => (
                  <span key={c.label}
                    className={`rounded px-2 py-0.5 text-[10px] font-semibold ${c.style === 'primary' ? 'bg-brand-700 text-white' : 'border border-brand-700 text-brand-700'}`}>
                    {c.label}
                  </span>
                ))}
              </div>
            </div>
          </Card>

          {/* Position pickers */}
          <Card>
            <h3 className="font-semibold text-gray-800 mb-4">Header Layout</h3>
            <div className="space-y-4">
              <PositionPicker label="Logo position" value={logoPosition} onChange={setLogoPosition} />
              <PositionPicker label="Navigation position" value={navPosition} onChange={setNavPosition} />
            </div>
          </Card>

          {/* Nav links editor */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Menu Links</h3>
              <p className="text-xs text-gray-400">{navLinks.length} item{navLinks.length !== 1 ? 's' : ''}</p>
            </div>
            {navLinks.length === 0 && (
              <p className="text-sm text-gray-400 italic mb-3">
                No custom links — nav is built from your page list. Add links below to override.
              </p>
            )}
            <div className="space-y-2">
              {navLinks.map((item, i) => (
                <NavLinkRow
                  key={i}
                  item={item}
                  index={i}
                  total={navLinks.length}
                  onChange={(v) => { const n = [...navLinks]; n[i] = v; setNavLinks(n); }}
                  onDelete={() => setNavLinks(navLinks.filter((_, j) => j !== i))}
                  onMoveUp={() => moveNavLink(i, -1)}
                  onMoveDown={() => moveNavLink(i, 1)}
                />
              ))}
            </div>
            <button
              onClick={() => setNavLinks([...navLinks, { label: 'New Link', url: '/' }])}
              className="mt-3 flex items-center gap-2 w-full justify-center rounded-lg border border-dashed border-gray-300 py-2 text-sm text-brand-700 hover:border-brand-400 hover:bg-brand-50 transition-all"
            >
              <Plus size={14} /> Add menu item
            </button>
          </Card>

          {/* CTA buttons editor */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Header Buttons (CTAs)</h3>
              <p className="text-xs text-gray-400">{headerCtas.length} button{headerCtas.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="space-y-2">
              {headerCtas.map((item, i) => (
                <CtaRow
                  key={i}
                  item={item}
                  index={i}
                  total={headerCtas.length}
                  onChange={(v) => { const n = [...headerCtas]; n[i] = v; setHeaderCtas(n); }}
                  onDelete={() => setHeaderCtas(headerCtas.filter((_, j) => j !== i))}
                  onMoveUp={() => moveCta(i, -1)}
                  onMoveDown={() => moveCta(i, 1)}
                />
              ))}
            </div>
            <button
              onClick={() => setHeaderCtas([...headerCtas, { label: 'Button', url: '/', style: 'outline' }])}
              className="mt-3 flex items-center gap-2 w-full justify-center rounded-lg border border-dashed border-gray-300 py-2 text-sm text-brand-700 hover:border-brand-400 hover:bg-brand-50 transition-all"
            >
              <Plus size={14} /> Add button
            </button>
          </Card>

          <Button onClick={save} loading={updateMutation.isPending}><Save size={14} /> Save Navigation</Button>
        </div>
      )}

      {/* ── Footer tab ────────────────────────────────────────────────────── */}
      {tab === 'footer' && (
        <Card>
          <h3 className="font-semibold text-gray-800 mb-4">Footer</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Footer text</label>
              <input value={footerText} onChange={(e) => setFooterText(e.target.value)}
                placeholder="© 2026 Your Organisation. City, Country."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none" />
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Social links</p>
              {(['facebook', 'twitter', 'whatsapp'] as const).map((platform) => (
                <div key={platform}>
                  <label className="block text-xs font-medium text-gray-500 mb-1 capitalize">{platform}</label>
                  <input
                    value={(socialLinks as Record<string, string>)[platform] ?? ''}
                    onChange={(e) => setSocialLinks({ ...socialLinks, [platform]: e.target.value })}
                    placeholder={`https://${platform}.com/yourpage`}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
                  />
                </div>
              ))}
            </div>
            <Button onClick={save} loading={updateMutation.isPending}><Save size={14} /> Save Footer</Button>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function WebsiteBuilderPage() {
  const { data: settings, isLoading, isError, refetch } = useWebsiteSettings();
  const addPageMutation = useAddPage();
  const updatePageMutation = useUpdatePage();
  const deletePageMutation = useDeletePage();
  const saveBlocksMutation = useSaveBlocks();
  const publishMutation = usePublishWebsite();

  const [view, setView] = useState<View>('pages');
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [localBlocks, setLocalBlocks] = useState<BlockData[]>([]);
  const [showBlockPicker, setShowBlockPicker] = useState(false);
  const [hasUnsaved, setHasUnsaved] = useState(false);

  const activePage = settings?.pages.find((p) => p.id === activePageId);

  function openPage(id: string) {
    const page = settings?.pages.find((p) => p.id === id);
    if (!page) return;
    setActivePageId(id);
    setLocalBlocks(page.blocks as BlockData[]);
    setHasUnsaved(false);
    setView('editor');
  }

  function updateBlock(index: number, block: BlockData) {
    const updated = [...localBlocks];
    updated[index] = block;
    setLocalBlocks(updated);
    setHasUnsaved(true);
  }

  function moveBlock(index: number, dir: -1 | 1) {
    const updated = [...localBlocks];
    const target = index + dir;
    if (target < 0 || target >= updated.length) return;
    [updated[index], updated[target]] = [updated[target]!, updated[index]!];
    setLocalBlocks(updated);
    setHasUnsaved(true);
  }

  function deleteBlock(index: number) {
    setLocalBlocks(localBlocks.filter((_, i) => i !== index));
    setHasUnsaved(true);
  }

  function addBlock(block: BlockData) {
    setLocalBlocks([...localBlocks, block]);
    setHasUnsaved(true);
  }

  function saveBlocks() {
    if (!activePageId) return;
    saveBlocksMutation.mutate({ pageId: activePageId, blocks: localBlocks }, {
      onSuccess: () => setHasUnsaved(false),
    });
  }

  function addNewPage() {
    const title = window.prompt('Page title (e.g. "About Us"):');
    if (!title) return;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    addPageMutation.mutate({ title, slug, isHomePage: false, isInNav: true, blocks: [] });
  }

  if (isLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  if (isError || !settings) {
    return (
      <div className="page-container">
        <Card>
          <div className="mx-auto max-w-lg py-8 text-center">
            <Globe size={28} className="mx-auto mb-3 text-gray-400" />
            <h1 className="text-lg font-semibold text-gray-900">Website builder could not load</h1>
            <p className="mt-2 text-sm text-gray-600">
              The website settings could not be retrieved. Check the API and database, then try again.
            </p>
            <Button className="mt-4" onClick={() => void refetch()}>Try again</Button>
          </div>
        </Card>
      </div>
    );
  }

  const PUBLIC_URL = import.meta.env['VITE_PUBLIC_URL'] ?? 'http://localhost:4000';

  return (
    <div className="page-container space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
            <Globe size={20} />
          </div>
          <div>
            <h1 className="section-heading">Website Builder</h1>
            <p className="text-sm text-gray-500">
              Edit the public-facing website at{' '}
              <a href={PUBLIC_URL} target="_blank" rel="noopener noreferrer"
                className="text-brand-700 hover:underline inline-flex items-center gap-1">
                {PUBLIC_URL.replace(/^https?:\/\//, '')} <ExternalLink size={11} />
              </a>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <a href={PUBLIC_URL} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" size="sm"><Eye size={14} /> Preview Site</Button>
          </a>
          <Button
            size="sm"
            loading={publishMutation.isPending}
            onClick={() => publishMutation.mutate()}
          >
            <Upload size={14} /> Publish
          </Button>
        </div>
      </div>

      {/* Status banner */}
      <div className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm ${settings.isPublished ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-amber-50 border border-amber-200 text-amber-800'}`}>
        <div className={`h-2 w-2 rounded-full ${settings.isPublished ? 'bg-green-500' : 'bg-amber-500'}`} />
        {settings.isPublished
          ? `Published · Last updated ${new Date(settings.updatedAt).toLocaleDateString()}`
          : 'Draft — click Publish to make changes live'}
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-gray-200">
        {([['pages', 'Pages', <Layout size={14} />], ['settings', 'Site Settings', <Settings2 size={14} />]] as const).map(([key, label, icon]) => (
          <button
            key={key}
            onClick={() => setView(key as View)}
            className={[
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
              view === key || (view === 'editor' && key === 'pages')
                ? 'border-brand-700 text-brand-700'
                : 'border-transparent text-gray-500 hover:text-gray-700',
            ].join(' ')}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Pages list */}
      {(view === 'pages' || view === 'editor') && (
        <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
          {/* Left — page list */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Pages</p>
            <PageList
              pages={settings.pages}
              activePage={activePageId}
              onSelect={openPage}
              onAdd={addNewPage}
              onDelete={(id) => deletePageMutation.mutate(id)}
            />
          </div>

          {/* Right — block editor */}
          {view === 'editor' && activePage ? (
            <div className="space-y-4">
              {/* Page header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <button onClick={() => setView('pages')} className="hover:text-brand-700 transition-colors">Pages</button>
                  <ChevronRight size={13} />
                  <span className="font-semibold text-gray-900">{activePage.title}</span>
                  {hasUnsaved && <Badge variant="yellow">Unsaved</Badge>}
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setShowBlockPicker(true)}>
                    <Plus size={13} /> Add Block
                  </Button>
                  <Button size="sm" loading={saveBlocksMutation.isPending} onClick={saveBlocks}>
                    <Save size={13} /> Save Page
                  </Button>
                </div>
              </div>

              {/* Page settings */}
              <Card padding="sm">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Page title</label>
                    <input
                      defaultValue={activePage.title}
                      onBlur={(e) => updatePageMutation.mutate({ id: activePage.id, data: { title: e.target.value } })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">SEO title</label>
                    <input
                      defaultValue={activePage.seoTitle ?? ''}
                      onBlur={(e) => updatePageMutation.mutate({ id: activePage.id, data: { seoTitle: e.target.value } })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">SEO description</label>
                    <input
                      defaultValue={activePage.seoDescription ?? ''}
                      onBlur={(e) => updatePageMutation.mutate({ id: activePage.id, data: { seoDescription: e.target.value } })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
                    />
                  </div>
                </div>
              </Card>

              {/* Blocks */}
              {localBlocks.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center">
                  <Layout size={32} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-sm font-medium text-gray-500 mb-3">No blocks yet</p>
                  <Button size="sm" onClick={() => setShowBlockPicker(true)}>
                    <Plus size={13} /> Add your first block
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {localBlocks.map((block, i) => (
                    <BlockCard
                      key={i}
                      block={block}
                      index={i}
                      total={localBlocks.length}
                      onChange={(b) => updateBlock(i, b)}
                      onMoveUp={() => moveBlock(i, -1)}
                      onMoveDown={() => moveBlock(i, 1)}
                      onDelete={() => deleteBlock(i)}
                    />
                  ))}
                  <button onClick={() => setShowBlockPicker(true)}
                    className="flex items-center justify-center gap-2 w-full rounded-xl border border-dashed border-gray-300 py-3 text-sm text-brand-700 hover:border-brand-400 hover:bg-brand-50 transition-all">
                    <Plus size={14} /> Add block
                  </button>
                </div>
              )}
            </div>
          ) : view === 'editor' && !activePage ? (
            <div className="flex items-center justify-center py-16 text-sm text-gray-400">
              Select a page to edit its blocks
            </div>
          ) : (
            <div className="flex items-center justify-center py-16 text-sm text-gray-400">
              <div className="text-center">
                <Layout size={32} className="mx-auto mb-3 text-gray-300" />
                <p>Select a page to start editing</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Site settings */}
      {view === 'settings' && <GlobalSettings settings={settings} />}

      {/* Block picker modal */}
      {showBlockPicker && (
        <BlockPicker onPick={addBlock} onClose={() => setShowBlockPicker(false)} />
      )}
    </div>
  );
}
