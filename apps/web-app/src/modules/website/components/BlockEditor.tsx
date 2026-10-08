import { useState } from 'react';
import { ChevronUp, ChevronDown, Trash2, Edit2, Check, X, Plus } from 'lucide-react';
import type { BlockData } from '../hooks/useWebsite';

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
    defaults: { type: 'testimonial', heading: 'What Our Members Say', items: [{ name: 'Member Name', role: 'Member', quote: 'MAKU has transformed how I sell my livestock.' }] },
  },
  {
    type: 'gallery', label: 'Photo Gallery', emoji: '🖼️',
    description: 'Grid of photos with optional captions',
    defaults: { type: 'gallery', heading: 'Gallery', items: [] },
  },
];

// ─── Generic field editor ─────────────────────────────────────────────────────

function FieldInput({ label, value, onChange, multiline = false, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void;
  multiline?: boolean; type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none resize-none"
        />
      ) : (
        <input
          type={type}
          value={value}
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
    case 'hero':
      return (
        <div className="space-y-3 pt-3 border-t border-gray-100">
          <FieldInput label="Heading" value={block['heading'] as string ?? ''} onChange={(v) => set('heading', v)} />
          <FieldInput label="Subheading" value={block['subheading'] as string ?? ''} onChange={(v) => set('subheading', v)} multiline />
          <div className="grid grid-cols-2 gap-3">
            <FieldInput label="Primary button label" value={block['primaryBtnLabel'] as string ?? ''} onChange={(v) => set('primaryBtnLabel', v)} />
            <FieldInput label="Primary button URL" value={block['primaryBtnUrl'] as string ?? ''} onChange={(v) => set('primaryBtnUrl', v)} />
            <FieldInput label="Secondary button label" value={block['secondaryBtnLabel'] as string ?? ''} onChange={(v) => set('secondaryBtnLabel', v)} />
            <FieldInput label="Secondary button URL" value={block['secondaryBtnUrl'] as string ?? ''} onChange={(v) => set('secondaryBtnUrl', v)} />
          </div>
          <FieldInput label="Background image URL (optional)" value={block['backgroundImage'] as string ?? ''} onChange={(v) => set('backgroundImage', v)} />
        </div>
      );

    case 'stats': {
      const items = (block['items'] as Array<{ icon: string; label: string; value: string }>) ?? [];
      return (
        <div className="space-y-3 pt-3 border-t border-gray-100">
          <FieldInput label="Section heading" value={block['heading'] as string ?? ''} onChange={(v) => set('heading', v)} />
          {items.map((item, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-lg">
              <FieldInput label="Icon" value={item.icon} onChange={(v) => { const n = [...items]; n[i] = { icon: v, value: item.value, label: item.label }; set('items', n); }} />
              <FieldInput label="Value" value={item.value} onChange={(v) => { const n = [...items]; n[i] = { icon: item.icon, value: v, label: item.label }; set('items', n); }} />
              <FieldInput label="Label" value={item.label} onChange={(v) => { const n = [...items]; n[i] = { icon: item.icon, value: item.value, label: v }; set('items', n); }} />
            </div>
          ))}
          <button onClick={() => set('items', [...items, { icon: 'Star', label: 'New stat', value: '0' }])}
            className="text-xs text-brand-700 hover:underline flex items-center gap-1">
            <Plus size={12} /> Add stat
          </button>
        </div>
      );
    }

    case 'services': {
      const items = (block['items'] as Array<{ icon: string; title: string; description: string }>) ?? [];
      return (
        <div className="space-y-3 pt-3 border-t border-gray-100">
          <FieldInput label="Section heading" value={block['heading'] as string ?? ''} onChange={(v) => set('heading', v)} />
          <FieldInput label="Subheading" value={block['subheading'] as string ?? ''} onChange={(v) => set('subheading', v)} />
          {items.map((item, i) => (
            <div key={i} className="p-3 bg-gray-50 rounded-lg space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <FieldInput label="Icon name" value={item.icon ?? ''} onChange={(v) => { const n = [...items]; n[i] = { icon: v, title: item.title, description: item.description }; set('items', n); }} />
                <FieldInput label="Title" value={item.title} onChange={(v) => { const n = [...items]; n[i] = { icon: item.icon, title: v, description: item.description }; set('items', n); }} />
              </div>
              <FieldInput label="Description" value={item.description} onChange={(v) => { const n = [...items]; n[i] = { icon: item.icon, title: item.title, description: v }; set('items', n); }} multiline />
              <button onClick={() => set('items', items.filter((_, j) => j !== i))} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                <Trash2 size={11} /> Remove
              </button>
            </div>
          ))}
          <button onClick={() => set('items', [...items, { icon: 'Star', title: 'New Service', description: 'Description here.' }])}
            className="text-xs text-brand-700 hover:underline flex items-center gap-1">
            <Plus size={12} /> Add service
          </button>
        </div>
      );
    }

    case 'text_image':
      return (
        <div className="space-y-3 pt-3 border-t border-gray-100">
          <FieldInput label="Heading" value={block['heading'] as string ?? ''} onChange={(v) => set('heading', v)} />
          <FieldInput label="Body text" value={block['body'] as string ?? ''} onChange={(v) => set('body', v)} multiline />
          <FieldInput label="Image URL" value={block['imageUrl'] as string ?? ''} onChange={(v) => set('imageUrl', v)} />
          <FieldInput label="Image alt text" value={block['imageAlt'] as string ?? ''} onChange={(v) => set('imageAlt', v)} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Image position</label>
              <select value={block['imagePosition'] as string ?? 'right'} onChange={(e) => set('imagePosition', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none">
                <option value="right">Image on right</option>
                <option value="left">Image on left</option>
              </select>
            </div>
            <FieldInput label="Button label (optional)" value={block['btnLabel'] as string ?? ''} onChange={(v) => set('btnLabel', v)} />
          </div>
          <FieldInput label="Button URL" value={block['btnUrl'] as string ?? ''} onChange={(v) => set('btnUrl', v)} />
        </div>
      );

    case 'cta':
      return (
        <div className="space-y-3 pt-3 border-t border-gray-100">
          <FieldInput label="Heading" value={block['heading'] as string ?? ''} onChange={(v) => set('heading', v)} />
          <FieldInput label="Subheading" value={block['subheading'] as string ?? ''} onChange={(v) => set('subheading', v)} />
          <div className="grid grid-cols-2 gap-3">
            <FieldInput label="Button label" value={block['btnLabel'] as string ?? ''} onChange={(v) => set('btnLabel', v)} />
            <FieldInput label="Button URL" value={block['btnUrl'] as string ?? ''} onChange={(v) => set('btnUrl', v)} />
          </div>
          <FieldInput label="Background colour (hex)" value={block['bgColor'] as string ?? '#7e2710'} onChange={(v) => set('bgColor', v)} />
        </div>
      );

    case 'contact':
      return (
        <div className="space-y-3 pt-3 border-t border-gray-100">
          <FieldInput label="Heading" value={block['heading'] as string ?? ''} onChange={(v) => set('heading', v)} />
          <FieldInput label="Address" value={block['address'] as string ?? ''} onChange={(v) => set('address', v)} multiline />
          <div className="grid grid-cols-2 gap-3">
            <FieldInput label="Phone" value={block['phone'] as string ?? ''} onChange={(v) => set('phone', v)} />
            <FieldInput label="Email" value={block['email'] as string ?? ''} onChange={(v) => set('email', v)} type="email" />
          </div>
          <FieldInput label="Office hours" value={block['hours'] as string ?? ''} onChange={(v) => set('hours', v)} />
          <FieldInput label="Google Maps embed URL (optional)" value={block['mapEmbedUrl'] as string ?? ''} onChange={(v) => set('mapEmbedUrl', v)} />
        </div>
      );

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
          <button onClick={onMoveUp} disabled={index === 0}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 disabled:opacity-30 transition-colors" title="Move up">
            <ChevronUp size={14} />
          </button>
          <button onClick={onMoveDown} disabled={index === total - 1}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 disabled:opacity-30 transition-colors" title="Move down">
            <ChevronDown size={14} />
          </button>
          <button onClick={() => setExpanded((e) => !e)}
            className="rounded-lg p-1.5 text-brand-700 hover:bg-brand-50 transition-colors" title="Edit block">
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
            <button onClick={() => setConfirmDelete(true)}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="Delete block">
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
