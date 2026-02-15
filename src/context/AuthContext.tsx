'use client';

import { createContext, useState, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    consents?: Record<string, boolean>;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        const { data } = await authService.refresh();
        localStorage.setItem('accessToken', data.data.accessToken);
        setUser(data.data.user);
        return;
      }
      try {
        const { data } = await authService.getMe();
        setUser(data.data);
      } catch {
        // Token may be expired — try refresh before giving up
        const { data } = await authService.refresh();
        localStorage.setItem('accessToken', data.data.accessToken);
        setUser(data.data.user);
      }
    } catch {
      localStorage.removeItem('accessToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const { data } = await authService.login({ email, password });
    localStorage.setItem('accessToken', data.data.accessToken);
    setUser(data.data.user);
  }

  async function register(regData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    consents?: Record<string, boolean>;
  }) {
    const { data } = await authService.register(regData);
    localStorage.setItem('accessToken', data.data.accessToken);
    setUser(data.data.user);
  }

  async function logout() {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
      router.push('/login');
    }
  }

  async function refreshUser() {
    const { data } = await authService.getMe();
    setUser(data.data);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
