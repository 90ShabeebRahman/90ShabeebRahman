import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  updateUser: (user: User) => void;
  logout: () => void;
}

const savedToken = localStorage.getItem('musiq_token');
const savedUser = localStorage.getItem('musiq_user');

export const useAuthStore = create<AuthState>((set) => ({
  user: savedUser ? JSON.parse(savedUser) : null,
  token: savedToken || null,
  isAuthenticated: !!savedToken,

  setAuth: (user: User, token: string) => {
    localStorage.setItem('musiq_token', token);
    localStorage.setItem('musiq_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  updateUser: (user: User) => {
    localStorage.setItem('musiq_user', JSON.stringify(user));
    set({ user });
  },

  logout: () => {
    localStorage.removeItem('musiq_token');
    localStorage.removeItem('musiq_user');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
