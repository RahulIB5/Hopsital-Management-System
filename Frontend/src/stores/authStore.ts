import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  email: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] || null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => {
        document.cookie = 'token=; Max-Age=0; path=/';
        set({ token: null, user: null });
      },
      isAuthenticated: () => {
        const state = get();
        if (!state.token) return false;
        try {
          const payload = JSON.parse(atob(state.token.split('.')[1]));
          const expiry = payload.exp * 1000;
          return Date.now() < expiry;
        } catch (error) {
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);