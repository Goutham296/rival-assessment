'use client';
import { create } from 'zustand';
import Cookies from 'js-cookie';

interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  accessToken: string | null;
  setAuth: (user: any, token: string) => void;
  logout: () => void;
  init: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!Cookies.get('accessToken'),
  user: null,
  accessToken: Cookies.get('accessToken') ?? null,
  setAuth: (user, accessToken) => {
    Cookies.set('accessToken', accessToken, { expires: 7 });
    set({ isAuthenticated: true, user, accessToken });
  },
  logout: () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    set({ isAuthenticated: false, user: null, accessToken: null });
  },
  init: () => {
    const token = Cookies.get('accessToken');
    if (token) set({ isAuthenticated: true, accessToken: token });
  },
}));
