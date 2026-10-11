'use client';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const FDA_DISCLAIMER =
  'These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { isAdmin, isLoading } = useAuth();

  return (
    <footer className="border-t border-border/40 bg-background/95">
      <div className="container flex flex-col items-center gap-3 px-4 py-6 md:px-8">
        <p className="text-balance text-center text-sm leading-loose text-muted-foreground">
          &copy; {currentYear} Victorious Herbal Elements LLC. All rights reserved.
        </p>
        <p className="max-w-3xl text-balance text-center text-xs leading-relaxed text-muted-foreground">
          {FDA_DISCLAIMER}
        </p>
        {!isLoading && (
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
        )}
      </div>
    </footer>
  );
}
