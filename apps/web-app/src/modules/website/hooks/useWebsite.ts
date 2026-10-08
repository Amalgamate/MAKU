import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/services/api.client';
import { toast } from '../../../shared/store/toast.store';

export interface WebsiteSettingsData {
  id: string;
  siteName: string;
  tagline: string | null;
  logoUrl: string | null;
  primaryColor: string;
  navLinks: Array<{ label: string; url: string }>;
  pages: WebsitePageData[];
  footerText: string | null;
  socialLinks: { facebook?: string; twitter?: string; whatsapp?: string; youtube?: string };
  isPublished: boolean;
  publishedAt: string | null;
  updatedAt: string;
}

export interface WebsitePageData {
  id: string;
  title: string;
  slug: string;
  isHomePage: boolean;
  isInNav: boolean;
  blocks: BlockData[];
  seoTitle?: string;
  seoDescription?: string;
}

export type BlockData = Record<string, unknown> & { type: string };

const KEYS = { settings: ['website', 'settings'] as const };

export function useWebsiteSettings() {
  return useQuery({
    queryKey: KEYS.settings,
    queryFn: async () => {
      const res = await apiClient.get<{ data: WebsiteSettingsData; message: string }>('/website/settings');
      return res.data.data;
    },
    staleTime: 1000 * 60,
  });
}

export function useUpdateWebsiteSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<WebsiteSettingsData>) =>
      apiClient.patch('/website/settings', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.settings });
      toast.success('Website settings saved');
    },
    onError: () => toast.error('Failed to save settings'),
  });
}

export function useAddPage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<WebsitePageData, 'id'>) =>
      apiClient.post('/website/pages', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.settings });
      toast.success('Page created');
    },
    onError: () => toast.error('Failed to create page'),
  });
}

export function useUpdatePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WebsitePageData> }) =>
      apiClient.patch(`/website/pages/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.settings });
      toast.success('Page updated');
    },
    onError: () => toast.error('Failed to update page'),
  });
}

export function useDeletePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/website/pages/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.settings });
      toast.success('Page deleted');
    },
    onError: () => toast.error('Failed to delete page'),
  });
}

export function useSaveBlocks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ pageId, blocks }: { pageId: string; blocks: BlockData[] }) =>
      apiClient.put(`/website/pages/${pageId}/blocks`, { blocks }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.settings });
      toast.success('Page saved');
    },
    onError: () => toast.error('Failed to save page'),
  });
}

export function usePublishWebsite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.post('/website/publish', {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.settings });
      toast.success('Website published', 'Changes are now live on the public site.');
    },
    onError: () => toast.error('Publish failed'),
  });
}
