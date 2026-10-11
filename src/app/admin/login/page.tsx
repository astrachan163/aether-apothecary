'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, type AdminLoginResult } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LogIn } from 'lucide-react';

function messageFor(result: Exclude<AdminLoginResult, 'ok'>): string {
  switch (result) {
    case 'invalid':
      return 'Invalid password.';
    case 'unconfigured':
      return 'Admin login is not configured. Set ADMIN_PASSWORD in .env.local.';
    case 'error':
      return 'Could not reach the login service.';
    default: {
      const exhaustive: never = result;
      return exhaustive;
    }
  }
}

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAdmin) {
      router.push('/admin/dashboard');
    }
  }, [isAdmin, isLoading, router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    const result = await login(password);
    setIsSubmitting(false);
    if (result === 'ok') {
      router.push('/admin/dashboard');
      return;
    }
    setError(messageFor(result));
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><p>Loading...</p></div>;
  }
  if (isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <LogIn className="h-12 w-12 text-accent mx-auto mb-3" />
          <CardTitle className="text-3xl">Admin Login</CardTitle>
          <CardDescription>Enter the admin password to open the dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="current-password">Password</Label>
              <Input
                id="current-password"
                name="password"
                type="password"
                autoComplete="current-password"
                enterKeyHint="done"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
