'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, type DemoStartResult, type EmailSignInResult } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DEMO_AGE_NOTICE } from '../../../shared/notices';

function emailMessage(result: Exclude<EmailSignInResult, 'ok'>): string {
  switch (result) {
    case 'invalid':
      return 'That email or password was not accepted.';
    case 'unconfigured':
      return 'Sign-in is not connected in this build.';
    case 'error':
      return 'Could not reach the sign-in service.';
    default: {
      const exhaustive: never = result;
      return exhaustive;
    }
  }
}

function demoMessage(result: Exclude<DemoStartResult, 'ok'>): string {
  switch (result) {
    case 'unconfigured':
      return 'Demo sign-in needs the store function. It is not connected in this build.';
    case 'capped':
      return 'The demo cap for today has been reached.';
    case 'error':
      return 'The demo session did not start.';
    default: {
      const exhaustive: never = result;
      return exhaustive;
    }
  }
}

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signInWithEmail, startStoreAdminDemo, canUseAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && canUseAdmin) router.push('/admin/dashboard');
  }, [canUseAdmin, isLoading, router]);

  async function onSignIn(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    const result = await signInWithEmail(email, password);
    setIsSubmitting(false);
    if (result !== 'ok') setError(emailMessage(result));
  }

  async function onDemo() {
    setIsSubmitting(true);
    setError('');
    const result = await startStoreAdminDemo();
    setIsSubmitting(false);
    if (result !== 'ok') setError(demoMessage(result));
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl">Store admin</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input id="admin-email" name="email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className="min-h-11" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input id="admin-password" name="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="min-h-11" required />
            </div>
            {error ? <p role="alert">{error}</p> : null}
            <Button type="submit" className="min-h-11 w-full" disabled={isSubmitting}>Sign in</Button>
          </form>
          <div className="mt-6 space-y-3">
            <p>{DEMO_AGE_NOTICE}</p>
            <Button type="button" variant="outline" className="min-h-11 w-full" disabled={isSubmitting} onClick={onDemo}>
              Try the store admin demo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
