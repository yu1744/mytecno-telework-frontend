import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/app/types/user';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  client: string | null;
  uid: string | null;
  isSessionTimeoutModalOpen: boolean;
  setAuth: (user: User, headers: { [key: string]: string }) => void;
  clearAuth: () => void;
  showSessionTimeoutModal: () => void;
  hideSessionTimeoutModal: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      client: null,
      uid: null,
      isSessionTimeoutModalOpen: false,
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
        isSessionTimeoutModalOpen: false,
      }),
      showSessionTimeoutModal: () => set({ isSessionTimeoutModalOpen: true }),
      hideSessionTimeoutModal: () => set({ isSessionTimeoutModalOpen: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);