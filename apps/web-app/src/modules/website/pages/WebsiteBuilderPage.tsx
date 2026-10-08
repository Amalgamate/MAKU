import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Globe, Plus, Save, Eye, Upload, X, Settings2,
  Layout, ChevronRight, Trash2, Check, ExternalLink,
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

function GlobalSettings({ settings }: { settings: NonNullable<ReturnType<typeof useWebsiteSettings>['data']> }) {
  const updateMutation = useUpdateWebsiteSettings();
  const [siteName, setSiteName] = useState(settings.siteName);
  const [tagline, setTagline] = useState(settings.tagline ?? '');
  const [footerText, setFooterText] = useState(settings.footerText ?? '');
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor);
  const [headerLogoUrl, setHeaderLogoUrl] = useState(settings.headerLogoUrl ?? settings.logoUrl);
  const [footerLogoUrl, setFooterLogoUrl] = useState(settings.footerLogoUrl ?? settings.logoUrl);

  function save() {
    updateMutation.mutate({
      siteName,
      tagline,
      footerText,
      primaryColor,
      headerLogoUrl: headerLogoUrl ?? '',
      footerLogoUrl: footerLogoUrl ?? '',
    });
  }

  return (
    <div className="space-y-5 max-w-lg">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Footer text</label>
            <input value={footerText} onChange={(e) => setFooterText(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none" />
          </div>
          <Button onClick={save} loading={updateMutation.isPending}>
            <Save size={14} /> Save Settings
          </Button>
        </div>
      </Card>
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
