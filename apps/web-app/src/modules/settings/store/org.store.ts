import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface OrgSettings {
  name: string;
  tagline: string;
  logoUrl: string | null;
  primaryColor: string;
  setName: (name: string) => void;
  setTagline: (tagline: string) => void;
  setLogoUrl: (url: string | null) => void;
  setPrimaryColor: (color: string) => void;
}

export const useOrgStore = create<OrgSettings>()(
  persist(
    (set) => ({
      name: 'MAKU',
      tagline: 'Merti Animal Key Users Cooperative',
      logoUrl: null,
      primaryColor: '#7e2710',

      setName: (name) => set({ name }),
      setTagline: (tagline) => set({ tagline }),
      setLogoUrl: (logoUrl) => set({ logoUrl }),
      setPrimaryColor: (primaryColor) => set({ primaryColor }),
    }),
    {
      name: 'maku-org-settings',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
