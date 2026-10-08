import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API = import.meta.env['VITE_API_URL'] ?? 'http://localhost:3000/v1';

export interface CmsBlock { type: string; [key: string]: unknown; }
export interface CmsPage { id: string; title: string; slug: string; isHomePage: boolean; isInNav: boolean; blocks: CmsBlock[]; seoTitle?: string; seoDescription?: string; }
export interface CmsSettings {
  id: string; siteName: string; tagline: string | null; logoUrl: string | null;
  primaryColor: string; navLinks: Array<{ label: string; url: string }>;
  pages: CmsPage[]; footerText: string | null;
  socialLinks: { facebook?: string; twitter?: string; whatsapp?: string };
  isPublished: boolean;
}

async function fetchSettings(): Promise<CmsSettings> {
  const res = await axios.get<{ data: CmsSettings }>(`${API}/website/settings`);
  return res.data.data;
}

export function useCmsSettings() {
  return useQuery({ queryKey: ['cms-settings'], queryFn: fetchSettings, staleTime: 1000 * 60 * 5 });
}

export function useCmsPage(slug: string) {
  const { data, isLoading } = useCmsSettings();
  const page = data?.pages.find((p) => slug === 'home' ? p.isHomePage : p.slug === slug) ?? null;
  return { page, isLoading };
}
