'use client';
import { create } from 'zustand';
import Cookies from 'js-cookie';
import { authApi } from '@/lib/api';
import type { User, AuthResponse } from '@/types';

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  init: () => Promise<void>;
}

const setTokens = (res: AuthResponse) => {
  Cookies.set('accessToken', res.accessToken, { expires: 7 });
  Cookies.set('refreshToken', res.refreshToken, { expires: 30 });
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  init: async () => {
    const token = Cookies.get('accessToken');
    if (!token) {
      set({ isLoading: false });
      return;
    }
    try {
      const user = await authApi.me();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    const res = await authApi.login({ email, password });
    setTokens(res);
    set({ user: res.user, isAuthenticated: true });
  },

  register: async (email, password, name) => {
    const res = await authApi.register({ email, password, name });
    setTokens(res);
    set({ user: res.user, isAuthenticated: true });
  },

  logout: () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    set({ user: null, isAuthenticated: false });
  },
}));
