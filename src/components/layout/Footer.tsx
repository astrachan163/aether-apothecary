'use client';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
       <footer className="border-t border-border/40 bg-background/95">
        <div className="container flex flex-col items-center justify-center gap-4 h-20 py-6 md:flex-row md:py-0 px-4 md:px-8">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground">
            &copy; {currentYear} Victorious Herbal Elements LLC. All rights reserved.
          </p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-border/40 bg-background/95">
      <div className="container flex flex-col items-center justify-between gap-4 h-auto py-6 md:flex-row md:py-0 px-4 md:px-8 min-h-[5rem]">
        <p className="text-balance text-center text-sm leading-loose text-muted-foreground">
          &copy; {currentYear} Victorious Herbal Elements LLC. All rights reserved.
        </p>
        <div className="text-sm text-muted-foreground">
          {!isAdmin ? (
            <Link href="/admin/login" className="hover:text-accent">
              Admin Login
            </Link>
          ) : (
            <Link href="/admin/dashboard" className="hover:text-accent">
              Admin Dashboard
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
}
