import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, X, CheckCircle, Settings, Palette } from 'lucide-react';
import { Button, Input, Card } from '@maku/ui';
import { useOrgStore } from '../store/org.store';

const schema = z.object({
  name: z.string().min(2, 'Organisation name is required'),
  tagline: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const THEME_PRESETS = [
  { label: 'Deep Brown',    value: '#7e2710', bg: 'bg-[#7e2710]' },
  { label: 'Forest Green',  value: '#15803d', bg: 'bg-[#15803d]' },
  { label: 'Deep Blue',     value: '#1d4ed8', bg: 'bg-[#1d4ed8]' },
  { label: 'Slate',         value: '#334155', bg: 'bg-[#334155]' },
  { label: 'Amber',         value: '#b45309', bg: 'bg-[#b45309]' },
  { label: 'Purple',        value: '#6d28d9', bg: 'bg-[#6d28d9]' },
];

export default function SystemSettingsPage() {
  const org = useOrgStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saved, setSaved] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(org.logoUrl);
  const [dragOver, setDragOver] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: { name: org.name, tagline: org.tagline },
  });

  function onSave(values: FormValues) {
    org.setName(values.name);
    org.setTagline(values.tagline ?? '');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleLogoFile(file: File) {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setLogoPreview(url);
      org.setLogoUrl(url);
    };
    reader.readAsDataURL(file);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleLogoFile(file);
    e.target.value = '';
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleLogoFile(file);
  }

  function removeLogo() {
    setLogoPreview(null);
    org.setLogoUrl(null);
  }

  return (
    <div className="page-container max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
          <Settings size={20} />
        </div>
        <div>
          <h1 className="section-heading">System Settings</h1>
          <p className="text-sm text-gray-500">Configure organisation identity and appearance.</p>
        </div>
      </div>

      {/* Logo upload */}
      <Card>
        <h2 className="font-semibold text-gray-800 mb-1">Organisation Logo</h2>
        <p className="text-sm text-gray-500 mb-4">
          Used in the sidebar, reports, and printed documents. PNG or SVG recommended.
        </p>

        <div className="flex flex-wrap items-start gap-6">
          {/* Preview */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 overflow-hidden">
              {logoPreview ? (
                <img src={logoPreview} alt="Organisation logo" className="h-full w-full object-contain p-1" />
              ) : (
                <div className="text-center p-2">
                  <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-full bg-brand-100 text-brand-700 mb-1">
                    <span className="text-lg font-bold">{org.name.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <p className="text-[10px] text-gray-400">No logo</p>
                </div>
              )}
            </div>
            {logoPreview && (
              <button
                onClick={removeLogo}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
              >
                <X size={12} /> Remove
              </button>
            )}
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={[
              'flex-1 min-w-[200px] flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all',
              dragOver
                ? 'border-brand-500 bg-brand-50'
                : 'border-gray-200 bg-gray-50 hover:border-brand-400 hover:bg-brand-50/50',
            ].join(' ')}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            aria-label="Upload logo"
          >
            <div className={[
              'flex h-10 w-10 items-center justify-center rounded-full transition-colors',
              dragOver ? 'bg-brand-100 text-brand-700' : 'bg-white text-gray-400 shadow-sm',
            ].join(' ')}>
              <Upload size={18} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                {dragOver ? 'Drop it here' : 'Click or drag to upload'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, SVG — max 2 MB</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleFileInput}
              aria-label="Logo file input"
            />
          </div>
        </div>
      </Card>

      {/* Organisation details */}
      <Card>
        <h2 className="font-semibold text-gray-800 mb-4">Organisation Details</h2>
        <form onSubmit={handleSubmit(onSave)} noValidate className="space-y-4">
          <Input
            label="Organisation name"
            required
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Tagline / description"
            hint="Shown beneath the logo in the sidebar"
            error={errors.tagline?.message}
            {...register('tagline')}
          />
          <div className="flex items-center gap-3 pt-1">
            <Button type="submit">Save changes</Button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                <CheckCircle size={15} /> Saved
              </span>
            )}
          </div>
        </form>
      </Card>

      {/* Theme colour */}
      <Card>
        <div className="flex items-center gap-2 mb-1">
          <Palette size={16} className="text-brand-700" />
          <h2 className="font-semibold text-gray-800">Theme Colour</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Choose a preset or pick a custom colour. Requires a page refresh to take effect.
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {THEME_PRESETS.map((p) => (
            <button
              key={p.value}
              onClick={() => org.setPrimaryColor(p.value)}
              title={p.label}
              className={[
                'flex items-center gap-2 rounded-lg border-2 px-3 py-1.5 text-xs font-medium transition-all',
                org.primaryColor === p.value
                  ? 'border-gray-900 shadow-md scale-105'
                  : 'border-transparent hover:border-gray-300',
              ].join(' ')}
            >
              <span className={`h-4 w-4 rounded-full ${p.bg}`} />
              {p.label}
            </button>
          ))}
        </div>

        {/* Custom colour picker */}
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600 font-medium">Custom colour:</label>
          <input
            type="color"
            value={org.primaryColor}
            onChange={(e) => org.setPrimaryColor(e.target.value)}
            className="h-9 w-20 rounded-lg border border-gray-300 cursor-pointer p-0.5"
            aria-label="Custom brand colour"
          />
          <code className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded font-mono">
            {org.primaryColor}
          </code>
        </div>

        <p className="mt-3 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          Theme colour changes are stored locally. A full dynamic theming system is on the roadmap.
          Reload the page after selecting a new colour.
        </p>
      </Card>
    </div>
  );
}
