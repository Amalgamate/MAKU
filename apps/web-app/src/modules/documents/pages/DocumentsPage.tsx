import { useState, useRef } from 'react';
import { FileText, Upload, Search, Download, FolderOpen, X } from 'lucide-react';
import { Button, Card, Badge } from '@maku/ui';
import { formatDateTime } from '@maku/utils';
import { toast } from '../../../shared/store/toast.store';
import { apiClient } from '../../../shared/services/api.client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DocumentItem {
  id: string;
  title: string;
  category: string;
  fileUrl: string;
  fileSize: number | null;
  mimeType: string | null;
  year: number | null;
  description: string | null;
  uploadedBy: string | null;
  cigId: string | null;
  cigName?: string;
  createdAt: string;
}

type DocCategory = 'corporate' | 'financial' | 'compliance' | 'projects' | 'partnerships' | 'other';

const CATEGORIES: Record<DocCategory, { label: string; color: 'green' | 'blue' | 'yellow' | 'gray' | 'red' }> = {
  corporate:    { label: 'Corporate',    color: 'blue' },
  financial:    { label: 'Financial',    color: 'green' },
  compliance:   { label: 'Compliance',   color: 'yellow' },
  projects:     { label: 'Projects',     color: 'blue' },
  partnerships: { label: 'Partnerships', color: 'green' },
  other:        { label: 'Other',        color: 'gray' },
};

function fileIcon(mimeType: string | null): string {
  if (!mimeType) return '📄';
  if (mimeType.includes('pdf')) return '📕';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📘';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📗';
  if (mimeType.startsWith('image')) return '🖼️';
  return '📄';
}

function formatSize(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useDocuments(category?: string) {
  return useQuery({
    queryKey: ['documents', 'all', category],
    queryFn: async () => {
      const p = new URLSearchParams();
      if (category) p.set('category', category);
      const res = await apiClient.get<{
        data: { data: DocumentItem[]; meta: { total: number } };
        message: string;
      }>(`/documents?${p}`);
      return res.data.data;
    },
    staleTime: 1000 * 60 * 2,
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [uploadCategory, setUploadCategory] = useState<DocCategory>('other');
  const [uploadYear, setUploadYear] = useState(String(new Date().getFullYear()));
  const [uploadDesc, setUploadDesc] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCigId, setSelectedCigId] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const { data: docResult, isLoading } = useDocuments(categoryFilter || undefined);
  const documents = docResult?.data ?? [];

  // CIG list for optional upload attachment
  const { data: cigsData } = useQuery({
    queryKey: ['cigs-list-for-docs'],
    queryFn: async () => {
      const res = await apiClient.get<{ data: Array<{ id: string; name: string }>; message: string }>('/cigs');
      return res.data.data;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) throw new Error('No file selected');
      const form = new FormData();
      form.append('file', selectedFile);
      form.append('title', uploadName || selectedFile.name.replace(/\.[^.]+$/, ''));
      form.append('category', uploadCategory);
      if (uploadYear) form.append('year', uploadYear);
      if (uploadDesc) form.append('description', uploadDesc);
      if (selectedCigId) form.append('cigId', selectedCigId);
      return apiClient.post('/documents', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents', 'all'] });
      toast.success('Document uploaded', uploadName || selectedFile?.name || '');
      setShowUpload(false);
      setSelectedFile(null);
      setUploadName('');
      setUploadDesc('');
      setSelectedCigId('');
    },
    onError: () => toast.error('Upload failed', 'Please try again.'),
  });

  const filtered = documents.filter((d) => {
    const matchSearch = !search || d.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = !categoryFilter || d.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="page-container space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
            <FileText size={20} />
          </div>
          <div>
            <h1 className="section-heading">Document Centre</h1>
            <p className="text-sm text-gray-500">
              {documents.length} document{documents.length !== 1 ? 's' : ''} — policies, contracts, reports, permits
            </p>
          </div>
        </div>
        <Button size="sm" onClick={() => setShowUpload(true)}>
          <Upload size={14} /> Upload Document
        </Button>
      </div>

      {/* Search + filter */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents…"
            className="w-full rounded-lg border border-gray-300 py-2 pl-8 pr-3 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-700 focus:border-brand-600 focus:outline-none"
        >
          <option value="">All categories</option>
          {(Object.entries(CATEGORIES) as [DocCategory, { label: string }][]).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Documents list */}
      {isLoading ? (
        <div className="py-16 text-center text-gray-400">Loading documents…</div>
      ) : filtered.length === 0 ? (
        <Card>
          <div className="py-16 text-center">
            <FolderOpen size={36} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-medium text-gray-500 mb-1">
              {documents.length === 0 ? 'No documents uploaded yet' : 'No documents match your search'}
            </p>
            <p className="text-xs text-gray-400 mb-4">
              Upload registration certificates, meeting minutes, financial reports, and more.
            </p>
            {documents.length === 0 && (
              <Button size="sm" onClick={() => setShowUpload(true)}>
                <Upload size={13} /> Upload first document
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Document', 'Category', 'Year', 'Size', 'CIG', 'Uploaded', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((doc) => (
                <tr key={doc.id} className="hover:bg-warm-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{fileIcon(doc.mimeType)}</span>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{doc.title}</p>
                        {doc.description && (
                          <p className="text-xs text-gray-400 truncate max-w-[200px]">{doc.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={CATEGORIES[doc.category as DocCategory]?.color ?? 'gray'}>
                      {CATEGORIES[doc.category as DocCategory]?.label ?? doc.category}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{doc.year ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{formatSize(doc.fileSize)}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{doc.cigName ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {formatDateTime(doc.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg p-1.5 text-gray-400 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                      title="Download"
                    >
                      <Download size={14} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                  <Upload size={16} />
                </div>
                <h2 className="font-semibold text-gray-900">Upload Document</h2>
              </div>
              <button
                onClick={() => { setShowUpload(false); setSelectedFile(null); }}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* File drop zone */}
              <div
                onClick={() => fileRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-all
                  ${selectedFile ? 'border-brand-400 bg-brand-50' : 'border-gray-200 hover:border-brand-400 hover:bg-brand-50/50'}`}
              >
                {selectedFile ? (
                  <>
                    <span className="text-3xl">{fileIcon(selectedFile.type)}</span>
                    <p className="text-sm font-medium text-brand-700">{selectedFile.name}</p>
                    <p className="text-xs text-gray-400">{formatSize(selectedFile.size)}</p>
                  </>
                ) : (
                  <>
                    <Upload size={24} className="text-gray-400" />
                    <p className="text-sm text-gray-600 font-medium">Click to select a file</p>
                    <p className="text-xs text-gray-400">PDF, Word, Excel, images — max 10 MB</p>
                  </>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  className="sr-only"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) { setSelectedFile(f); setUploadName(f.name.replace(/\.[^.]+$/, '')); }
                  }}
                />
              </div>

              {/* Metadata */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document name</label>
                <input
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value as DocCategory)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
                  >
                    {(Object.entries(CATEGORIES) as [DocCategory, { label: string }][]).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <input
                    type="number"
                    value={uploadYear}
                    onChange={(e) => setUploadYear(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attach to CIG (optional)</label>
                <select
                  value={selectedCigId}
                  onChange={(e) => setSelectedCigId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
                >
                  <option value="">None — org-level document</option>
                  {(cigsData ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                <input
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  placeholder="Brief description of this document"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <Button
                  className="flex-1"
                  loading={uploadMutation.isPending}
                  disabled={!selectedFile}
                  onClick={() => uploadMutation.mutate()}
                >
                  Upload Document
                </Button>
                <Button variant="secondary" onClick={() => { setShowUpload(false); setSelectedFile(null); }}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
