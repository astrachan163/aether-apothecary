'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signInWithCustomToken, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { ensureAppCheck, getFirebase } from '@/lib/firebase';

export type EmailSignInResult = 'ok' | 'invalid' | 'unconfigured' | 'error';
export type DemoStartResult = 'ok' | 'unconfigured' | 'capped' | 'error';

interface AuthContextType {
  isAdmin: boolean;
  isDemo: boolean;
  canUseAdmin: boolean;
  isLoading: boolean;
  authConfigured: boolean;
  signInWithEmail: (email: string, password: string) => Promise<EmailSignInResult>;
  startStoreAdminDemo: () => Promise<DemoStartResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function readClaims(user: User): Promise<{ admin: boolean; demo: boolean }> {
  const token = await user.getIdTokenResult();
  return {
    admin: token.claims.admin === true,
    demo: token.claims.demo === true && token.claims.role === 'store-admin',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const authConfigured = getFirebase() !== null;

  useEffect(() => {
    const clients = getFirebase();
    if (!clients) {
      setIsLoading(false);
      return;
    }
    return onAuthStateChanged(clients.auth, (user) => {
      if (!user) {
        setIsAdmin(false);
        setIsDemo(false);
        setIsLoading(false);
        return;
      }
      void readClaims(user).then((claims) => {
        setIsAdmin(claims.admin);
        setIsDemo(claims.demo);
        setIsLoading(false);
      });
    });
  }, []);

  const signInWithEmail = async (email: string, password: string): Promise<EmailSignInResult> => {
    const clients = getFirebase();
    if (!clients) return 'unconfigured';
    try {
      await signInWithEmailAndPassword(clients.auth, email, password);
      return 'ok';
    } catch (error) {
      const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        return 'invalid';
      }
      return 'error';
    }
  };

  const startStoreAdminDemo = async (): Promise<DemoStartResult> => {
    const clients = getFirebase();
    if (!clients) return 'unconfigured';
    ensureAppCheck();
    try {
      const start = httpsCallable<{ role: string }, { token: string }>(clients.functions, 'startDemoSession');
      const result = await start({ role: 'store-admin' });
      await signInWithCustomToken(clients.auth, result.data.token);
      return 'ok';
    } catch (error) {
      const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
      if (code.includes('resource-exhausted')) return 'capped';
      return 'error';
    }
  };

  const logout = () => {
    const clients = getFirebase();
    setIsAdmin(false);
    setIsDemo(false);
    if (clients) void signOut(clients.auth);
    router.push('/');
  };

  return (
    <AuthContext.Provider
      value={{
        isAdmin,
        isDemo,
        canUseAdmin: isAdmin || isDemo,
        isLoading,
        authConfigured,
        signInWithEmail,
        startStoreAdminDemo,
        logout,
      }}
    >
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
