import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/app/types/user';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  client: string | null;
  uid: string | null;
  setAuth: (user: User, headers: { [key: string]: string }) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      client: null,
      uid: null,
      setAuth: (user, headers) => set({
        isAuthenticated: true,
        user,
        accessToken: headers['access-token'],
        client: headers['client'],
        uid: headers['uid'],
      }),
      clearAuth: () => set({
        isAuthenticated: false,
        user: null,
        accessToken: null,
        client: null,
        uid: null,
      }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);