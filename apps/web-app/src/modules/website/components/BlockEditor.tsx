import { useState, useRef } from 'react';
import { ChevronUp, ChevronDown, Trash2, Edit2, Check, X, Plus, Upload } from 'lucide-react';
import type { BlockData } from '../hooks/useWebsite';
import { apiClient } from '../../../shared/services/api.client';

// ─── Block type catalogue ─────────────────────────────────────────────────────

export const BLOCK_CATALOGUE: Array<{ type: string; label: string; description: string; emoji: string; defaults: BlockData }> = [
  {
    type: 'hero', label: 'Hero Banner', emoji: '🌟',
    description: 'Full-width hero with heading, subtitle, and CTA buttons',
    defaults: { type: 'hero', heading: 'Your Heading Here', subheading: 'Describe your organisation or mission in a sentence.', primaryBtnLabel: 'Get Started', primaryBtnUrl: '/register', secondaryBtnLabel: 'Learn More', secondaryBtnUrl: '#', backgroundImage: '' },
  },
  {
    type: 'stats', label: 'Stats / KPIs', emoji: '📊',
    description: '2–4 key numbers that show your impact',
    defaults: { type: 'stats', heading: 'Our Impact at a Glance', items: [{ icon: 'Users', label: 'Members', value: '0' }, { icon: 'TrendingUp', label: 'Transactions', value: '0' }] },
  },
  {
    type: 'services', label: 'Services Grid', emoji: '🗂️',
    description: 'Grid of service cards with icon, title, description',
    defaults: { type: 'services', heading: 'What We Do', subheading: 'Our services support pastoralist livelihoods.', items: [{ icon: 'Beef', title: 'Service 1', description: 'Description here.' }] },
  },
  {
    type: 'text_image', label: 'Text + Image', emoji: '📄',
    description: 'Text on one side, image on the other',
    defaults: { type: 'text_image', heading: 'About Us', body: 'Tell your story here.', imageUrl: '', imageAlt: 'About image', imagePosition: 'right', btnLabel: 'Learn more', btnUrl: '#' },
  },
  {
    type: 'cta', label: 'Call to Action', emoji: '📣',
    description: 'Full-width band with a headline and button',
    defaults: { type: 'cta', heading: 'Ready to Join?', subheading: 'Register as a member today.', btnLabel: 'Join Now', btnUrl: '/register', bgColor: '#7e2710' },
  },
  {
    type: 'contact', label: 'Contact Info', emoji: '📍',
    description: 'Address, phone, email, and office hours',
    defaults: { type: 'contact', heading: 'Find Us', address: 'Merti Town, Isiolo County, Kenya', phone: '+254 700 000 000', email: 'info@maku.coop', hours: 'Mon–Fri: 8 AM – 5 PM', mapEmbedUrl: '' },
  },
  {
    type: 'testimonial', label: 'Testimonials', emoji: '💬',
    description: 'Quotes from members or partners',
    defaults: { type: 'testimonial', heading: 'What Our Members Say', items: [{ name: 'Member Name', role: 'Member', quote: 'MAKU has transformed how I sell my livestock.', avatarUrl: '' }] },
  },
  {
    type: 'gallery', label: 'Photo Gallery', emoji: '🖼️',
    description: 'Grid of photos with optional captions',
    defaults: { type: 'gallery', heading: 'Gallery', items: [] },
  },
];

// ─── Image upload field ───────────────────────────────────────────────────────

function ImageUploadField({
  label, value, onChange, previewHeight = 'h-20',
}: {
  label: string; value: string; onChange: (v: string) => void; previewHeight?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await apiClient.post<{ data: { url: string } }>('/upload/image', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(res.data.data.url);
    } catch {
      // silent — user can still paste a URL manually
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          placeholder="Paste URL or upload →"
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 shrink-0 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <Upload size={13} /> {uploading ? 'Uploading…' : 'Upload'}
        </button>
        <input
          ref={fileRef} type="file" accept="image/*" className="sr-only"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
        />
      </div>
      {value && (
        <div className="mt-2 relative group">
          <img
            src={value} alt="preview"
            className={`${previewHeight} w-full object-cover rounded-lg border border-gray-200`}
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-1 right-1 hidden group-hover:flex items-center justify-center h-6 w-6 rounded-full bg-red-500 text-white hover:bg-red-600"
            title="Remove image"
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Generic field editor ─────────────────────────────────────────────────────

function FieldInput({
  label, value, onChange, multiline = false, type = 'text', placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void;
  multiline?: boolean; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none resize-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
        />
      )}
    </div>
  );
}

// ─── Per-block inline editor ──────────────────────────────────────────────────

function BlockInlineEditor({ block, onChange }: { block: BlockData; onChange: (b: BlockData) => void }) {
  const set = (key: string, value: unknown) => onChange({ ...block, [key]: value });

  switch (block.type) {
    // ── Hero ────────────────────────────────────────────────────────────────
    case 'hero':
      return (
        <div className="space-y-3 pt-3 border-t border-gray-100">
          <FieldInput label="Heading" value={block['heading'] as string ?? ''} onChange={(v) => set('heading', v)} />
          <FieldInput label="Subheading" value={block['subheading'] as string ?? ''} onChange={(v) => set('subheading', v)} multiline />
          <div className="grid grid-cols-2 gap-3">
            <FieldInput label="Primary button label" value={block['primaryBtnLabel'] as string ?? ''} onChange={(v) => set('primaryBtnLabel', v)} />
            <FieldInput label="Primary button URL" value={block['primaryBtnUrl'] as string ?? ''} onChange={(v) => set('primaryBtnUrl', v)} placeholder="/register" />
            <FieldInput label="Secondary button label" value={block['secondaryBtnLabel'] as string ?? ''} onChange={(v) => set('secondaryBtnLabel', v)} />
            <FieldInput label="Secondary button URL" value={block['secondaryBtnUrl'] as string ?? ''} onChange={(v) => set('secondaryBtnUrl', v)} placeholder="#" />
          </div>
          <ImageUploadField
            label="Background image (optional)"
            value={block['backgroundImage'] as string ?? ''}
            onChange={(v) => set('backgroundImage', v)}
            previewHeight="h-28"
          />
        </div>
      );

    // ── Stats ────────────────────────────────────────────────────────────────
    case 'stats': {
      const items = (block['items'] as Array<{ icon: string; label: string; value: string }>) ?? [];
      return (
        <div className="space-y-3 pt-3 border-t border-gray-100">
          <FieldInput label="Section heading" value={block['heading'] as string ?? ''} onChange={(v) => set('heading', v)} />
          {items.map((item, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-lg">
              <FieldInput label="Icon name" value={item.icon} placeholder="Users" onChange={(v) => { const n = [...items]; n[i] = { icon: v, value: item.value, label: item.label }; set('items', n); }} />
              <FieldInput label="Value" value={item.value} placeholder="1,200+" onChange={(v) => { const n = [...items]; n[i] = { icon: item.icon, value: v, label: item.label }; set('items', n); }} />
              <FieldInput label="Label" value={item.label} onChange={(v) => { const n = [...items]; n[i] = { icon: item.icon, value: item.value, label: v }; set('items', n); }} />
            </div>
          ))}
          <button
            onClick={() => set('items', [...items, { icon: 'Star', label: 'New stat', value: '0' }])}
            className="text-xs text-brand-700 hover:underline flex items-center gap-1"
          >
            <Plus size={12} /> Add stat
          </button>
        </div>
      );
    }

    // ── Services ─────────────────────────────────────────────────────────────
    case 'services': {
      const items = (block['items'] as Array<{ icon: string; title: string; description: string }>) ?? [];
      return (
        <div className="space-y-3 pt-3 border-t border-gray-100">
          <FieldInput label="Section heading" value={block['heading'] as string ?? ''} onChange={(v) => set('heading', v)} />
          <FieldInput label="Subheading" value={block['subheading'] as string ?? ''} onChange={(v) => set('subheading', v)} />
          {items.map((item, i) => (
            <div key={i} className="p-3 bg-gray-50 rounded-lg space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <FieldInput label="Icon name" value={item.icon ?? ''} placeholder="Beef" onChange={(v) => { const n = [...items]; n[i] = { icon: v, title: item.title, description: item.description }; set('items', n); }} />
                <FieldInput label="Title" value={item.title} onChange={(v) => { const n = [...items]; n[i] = { icon: item.icon, title: v, description: item.description }; set('items', n); }} />
              </div>
              <FieldInput label="Description" value={item.description} onChange={(v) => { const n = [...items]; n[i] = { icon: item.icon, title: item.title, description: v }; set('items', n); }} multiline />
              <button
                onClick={() => set('items', items.filter((_, j) => j !== i))}
                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
              >
                <Trash2 size={11} /> Remove
              </button>
            </div>
          ))}
          <button
            onClick={() => set('items', [...items, { icon: 'Star', title: 'New Service', description: 'Description here.' }])}
            className="text-xs text-brand-700 hover:underline flex items-center gap-1"
          >
            <Plus size={12} /> Add service
          </button>
        </div>
      );
    }

    // ── Text + Image ──────────────────────────────────────────────────────────
    case 'text_image':
      return (
        <div className="space-y-3 pt-3 border-t border-gray-100">
          <FieldInput label="Heading" value={block['heading'] as string ?? ''} onChange={(v) => set('heading', v)} />
          <FieldInput label="Body text" value={block['body'] as string ?? ''} onChange={(v) => set('body', v)} multiline />
          <ImageUploadField
            label="Image"
            value={block['imageUrl'] as string ?? ''}
            onChange={(v) => set('imageUrl', v)}
          />
          <FieldInput label="Image alt text" value={block['imageAlt'] as string ?? ''} onChange={(v) => set('imageAlt', v)} placeholder="Descriptive alt text" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Image position</label>
              <select
                value={block['imagePosition'] as string ?? 'right'}
                onChange={(e) => set('imagePosition', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
              >
                <option value="right">Image on right</option>
                <option value="left">Image on left</option>
              </select>
            </div>
            <FieldInput label="Button label (optional)" value={block['btnLabel'] as string ?? ''} onChange={(v) => set('btnLabel', v)} />
          </div>
          <FieldInput label="Button URL" value={block['btnUrl'] as string ?? ''} onChange={(v) => set('btnUrl', v)} placeholder="#" />
        </div>
      );

    // ── CTA ───────────────────────────────────────────────────────────────────
    case 'cta':
      return (
        <div className="space-y-3 pt-3 border-t border-gray-100">
          <FieldInput label="Heading" value={block['heading'] as string ?? ''} onChange={(v) => set('heading', v)} />
          <FieldInput label="Subheading" value={block['subheading'] as string ?? ''} onChange={(v) => set('subheading', v)} />
          <div className="grid grid-cols-2 gap-3">
            <FieldInput label="Button label" value={block['btnLabel'] as string ?? ''} onChange={(v) => set('btnLabel', v)} />
            <FieldInput label="Button URL" value={block['btnUrl'] as string ?? ''} onChange={(v) => set('btnUrl', v)} placeholder="/register" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Background colour</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={block['bgColor'] as string ?? '#7e2710'}
                onChange={(e) => set('bgColor', e.target.value)}
                className="h-9 w-14 rounded-lg border border-gray-200 cursor-pointer p-0.5"
              />
              <code className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded font-mono">
                {block['bgColor'] as string ?? '#7e2710'}
              </code>
            </div>
          </div>
        </div>
      );

    // ── Contact ───────────────────────────────────────────────────────────────
    case 'contact':
      return (
        <div className="space-y-3 pt-3 border-t border-gray-100">
          <FieldInput label="Heading" value={block['heading'] as string ?? ''} onChange={(v) => set('heading', v)} />
          <FieldInput label="Address" value={block['address'] as string ?? ''} onChange={(v) => set('address', v)} multiline />
          <div className="grid grid-cols-2 gap-3">
            <FieldInput label="Phone" value={block['phone'] as string ?? ''} onChange={(v) => set('phone', v)} placeholder="+254 700 000 000" />
            <FieldInput label="Email" value={block['email'] as string ?? ''} onChange={(v) => set('email', v)} type="email" />
          </div>
          <FieldInput label="Office hours" value={block['hours'] as string ?? ''} onChange={(v) => set('hours', v)} placeholder="Mon–Fri: 8 AM – 5 PM" />
          <FieldInput label="Google Maps embed URL (optional)" value={block['mapEmbedUrl'] as string ?? ''} onChange={(v) => set('mapEmbedUrl', v)} placeholder="https://maps.google.com/..." />
        </div>
      );

    // ── Testimonials ──────────────────────────────────────────────────────────
    case 'testimonial': {
      const items = (block['items'] as Array<{ name: string; role: string; quote: string; avatarUrl?: string }>) ?? [];
      return (
        <div className="space-y-3 pt-3 border-t border-gray-100">
          <FieldInput label="Section heading" value={block['heading'] as string ?? ''} onChange={(v) => set('heading', v)} />
          {items.map((item, i) => (
            <div key={i} className="p-3 bg-gray-50 rounded-lg space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <FieldInput label="Name" value={item.name} onChange={(v) => { const n = [...items]; n[i] = { ...n[i]!, name: v }; set('items', n); }} />
                <FieldInput label="Role / title" value={item.role} onChange={(v) => { const n = [...items]; n[i] = { ...n[i]!, role: v }; set('items', n); }} />
              </div>
              <FieldInput label="Quote" value={item.quote} onChange={(v) => { const n = [...items]; n[i] = { ...n[i]!, quote: v }; set('items', n); }} multiline />
              <ImageUploadField
                label="Avatar photo (optional)"
                value={item.avatarUrl ?? ''}
                onChange={(v) => { const n = [...items]; n[i] = { ...n[i]!, avatarUrl: v }; set('items', n); }}
                previewHeight="h-14"
              />
              <button
                onClick={() => set('items', items.filter((_, j) => j !== i))}
                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
              >
                <Trash2 size={11} /> Remove
              </button>
            </div>
          ))}
          <button
            onClick={() => set('items', [...items, { name: 'New Person', role: 'Member', quote: 'Write a testimonial here.', avatarUrl: '' }])}
            className="text-xs text-brand-700 hover:underline flex items-center gap-1"
          >
            <Plus size={12} /> Add testimonial
          </button>
        </div>
      );
    }

    // ── Gallery ───────────────────────────────────────────────────────────────
    case 'gallery': {
      const items = (block['items'] as Array<{ url: string; caption?: string }>) ?? [];
      return (
        <div className="space-y-3 pt-3 border-t border-gray-100">
          <FieldInput label="Section heading" value={block['heading'] as string ?? ''} onChange={(v) => set('heading', v)} />
          <div className="grid grid-cols-2 gap-3">
            {items.map((item, i) => (
              <div key={i} className="p-2 bg-gray-50 rounded-lg space-y-2 border border-gray-200">
                <ImageUploadField
                  label={`Photo ${i + 1}`}
                  value={item.url}
                  onChange={(v) => { const n = [...items]; n[i] = { ...n[i]!, url: v }; set('items', n); }}
                  previewHeight="h-24"
                />
                <FieldInput
                  label="Caption (optional)"
                  value={item.caption ?? ''}
                  onChange={(v) => { const n = [...items]; n[i] = { ...n[i]!, caption: v }; set('items', n); }}
                  placeholder="Add a caption…"
                />
                <button
                  onClick={() => set('items', items.filter((_, j) => j !== i))}
                  className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                >
                  <Trash2 size={11} /> Remove photo
                </button>
              </div>
            ))}
          </div>
          {/* Bulk upload: click to add multiple photos at once */}
          <GalleryBulkUpload onAdd={(newItems) => set('items', [...items, ...newItems])} />
        </div>
      );
    }

    default:
      return (
        <div className="pt-3 border-t border-gray-100 text-xs text-gray-400">
          <p>Block type: <code className="bg-gray-100 px-1 rounded">{block.type}</code> — raw editor:</p>
          <textarea
            value={JSON.stringify(block, null, 2)}
            onChange={(e) => { try { onChange(JSON.parse(e.target.value)); } catch { /* ignore */ } }}
            rows={6}
            className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-xs font-mono focus:border-brand-600 focus:outline-none resize-none"
          />
        </div>
      );
  }
}

// ─── Gallery bulk upload button ───────────────────────────────────────────────

function GalleryBulkUpload({ onAdd }: { onAdd: (items: Array<{ url: string; caption: string }>) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList) {
    setUploading(true);
    const results: Array<{ url: string; caption: string }> = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      try {
        const form = new FormData();
        form.append('file', file);
        const res = await apiClient.post<{ data: { url: string } }>('/upload/image', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        results.push({ url: res.data.data.url, caption: '' });
      } catch { /* skip failed */ }
    }
    if (results.length > 0) onAdd(results);
    setUploading(false);
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 w-full justify-center rounded-xl border border-dashed border-gray-300 py-3 text-sm text-brand-700 hover:border-brand-400 hover:bg-brand-50 disabled:opacity-50 transition-all"
      >
        <Upload size={14} /> {uploading ? 'Uploading photos…' : 'Upload photos'}
      </button>
      <input
        ref={fileRef} type="file" accept="image/*" multiple className="sr-only"
        onChange={(e) => { if (e.target.files?.length) handleFiles(e.target.files); e.target.value = ''; }}
      />
    </div>
  );
}

// ─── Single block card with move/delete controls ──────────────────────────────

interface BlockCardProps {
  block: BlockData;
  index: number;
  total: number;
  onChange: (b: BlockData) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}

export function BlockCard({ block, index, total, onChange, onMoveUp, onMoveDown, onDelete }: BlockCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const meta = BLOCK_CATALOGUE.find((c) => c.type === block.type);

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Block header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
        <span className="text-xl">{meta?.emoji ?? '📦'}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800">{meta?.label ?? block.type}</p>
          <p className="text-[11px] text-gray-400">{meta?.description ?? ''}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onMoveUp} disabled={index === 0}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 disabled:opacity-30 transition-colors" title="Move up"
          >
            <ChevronUp size={14} />
          </button>
          <button
            onClick={onMoveDown} disabled={index === total - 1}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 disabled:opacity-30 transition-colors" title="Move down"
          >
            <ChevronDown size={14} />
          </button>
          <button
            onClick={() => setExpanded((e) => !e)}
            className="rounded-lg p-1.5 text-brand-700 hover:bg-brand-50 transition-colors" title="Edit block"
          >
            {expanded ? <X size={14} /> : <Edit2 size={14} />}
          </button>
          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <button onClick={onDelete} className="rounded-lg p-1.5 text-white bg-red-500 hover:bg-red-600 transition-colors" title="Confirm delete">
                <Check size={14} />
              </button>
              <button onClick={() => setConfirmDelete(false)} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-200 transition-colors" title="Cancel">
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="Delete block"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Inline editor */}
      {expanded && (
        <div className="px-4 pb-4">
          <BlockInlineEditor block={block} onChange={onChange} />
        </div>
      )}
    </div>
  );
}
