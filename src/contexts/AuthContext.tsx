'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export type AdminLoginResult = 'ok' | 'invalid' | 'unconfigured' | 'error';

interface AuthContextType {
  isAdmin: boolean;
  login: (password: string) => Promise<AdminLoginResult>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedIsAdmin = localStorage.getItem('isAdminVHE');
      if (storedIsAdmin === 'true') {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error('Could not access localStorage:', error);
    }
    setIsLoading(false);
  }, []);

  const login = async (password: string): Promise<AdminLoginResult> => {
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.status === 503) {
        return 'unconfigured';
      }
      if (!response.ok) {
        return 'invalid';
      }

      setIsAdmin(true);
      try {
        localStorage.setItem('isAdminVHE', 'true');
      } catch (error) {
        console.error('Could not access localStorage:', error);
      }
      return 'ok';
    } catch (error) {
      console.error('Admin login request failed:', error);
      return 'error';
    }
  };

  const logout = () => {
    setIsAdmin(false);
    try {
      localStorage.removeItem('isAdminVHE');
    } catch (error) {
      console.error('Could not access localStorage:', error);
    }
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
