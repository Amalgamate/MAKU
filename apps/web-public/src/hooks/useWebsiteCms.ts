import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API = import.meta.env['VITE_API_URL'] ?? 'http://localhost:3000/v1';

export interface CmsBlock { type: string; [key: string]: unknown; }
export interface CmsPage {
  id: string; title: string; slug: string;
  isHomePage: boolean; isInNav: boolean;
  blocks: CmsBlock[]; seoTitle?: string; seoDescription?: string;
}
export interface CmsNavLink { label: string; url: string; openInNewTab?: boolean; }
export interface CmsHeaderCta { label: string; url: string; style: 'primary' | 'outline'; }

export interface CmsSettings {
  id: string;
  siteName: string;
  tagline: string | null;
  logoUrl: string | null;
  headerLogoUrl: string | null;
  footerLogoUrl: string | null;
  primaryColor: string;
  logoPosition: 'left' | 'center' | 'right';
  navPosition: 'left' | 'center' | 'right';
  navLinks: CmsNavLink[];
  headerCtas: CmsHeaderCta[];
  pages: CmsPage[];
  footerText: string | null;
  socialLinks: { facebook?: string; twitter?: string; whatsapp?: string };
  isPublished: boolean;
}

interface OrgSettings {
  orgName: string; tagline: string | null; logoUrl: string | null; primaryColor: string;
}

async function fetchSettings(): Promise<CmsSettings> {
  const [websiteRes, orgRes] = await Promise.allSettled([
    axios.get<{ data: CmsSettings }>(`${API}/website/settings`),
    axios.get<{ data: OrgSettings }>(`${API}/settings/org`),
  ]);

  if (websiteRes.status === 'rejected') throw new Error('Failed to load website settings');

  const website = websiteRes.value.data.data;
  const org = orgRes.status === 'fulfilled' ? orgRes.value.data.data : null;

  return {
    ...website,
    logoPosition: website.logoPosition ?? 'left',
    navPosition: website.navPosition ?? 'center',
    headerCtas: website.headerCtas ?? [],
    // Fall back to org settings logo when website hasn't set one
    headerLogoUrl: website.headerLogoUrl ?? website.logoUrl ?? org?.logoUrl ?? null,
    footerLogoUrl: website.footerLogoUrl ?? website.logoUrl ?? org?.logoUrl ?? null,
    logoUrl: website.logoUrl ?? org?.logoUrl ?? null,
    siteName: website.siteName || org?.orgName || 'MAKU',
  };
}

export function useCmsSettings() {
  return useQuery({ queryKey: ['cms-settings'], queryFn: fetchSettings, staleTime: 1000 * 60 * 5 });
}

export function useCmsPage(slug: string) {
  const { data, isLoading } = useCmsSettings();
  const page = data?.pages.find((p) => slug === 'home' ? p.isHomePage : p.slug === slug) ?? null;
  return { page, isLoading };
}
