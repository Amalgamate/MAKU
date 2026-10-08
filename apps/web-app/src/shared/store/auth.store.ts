import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserProfile } from '@maku/shared-types';

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: UserProfile, token: string) => void;
  setUser: (user: UserProfile) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setAuth(user, token) {
        set({ user, accessToken: token, isAuthenticated: true });
      },

      setUser(user) {
        set({ user });
      },

      logout() {
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
    }),
    {
      name: 'maku-auth',
      storage: createJSONStorage(() => localStorage),
      // Only persist user profile — NOT the access token (it's short-lived anyway)
      // Refresh token lives in an HttpOnly cookie handled by the browser
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
);
