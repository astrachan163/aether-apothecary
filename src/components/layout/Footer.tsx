'use client';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const FDA_DISCLAIMER =
  'These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.';

const legalLinks = [
  { href: 'https://nonartificialsi.com/privacy', label: 'Privacy' },
  { href: 'https://nonartificialsi.com/terms', label: 'Terms' },
  { href: 'https://nonartificialsi.com/accessibility', label: 'Accessibility' },
];

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { isAdmin, isLoading } = useAuth();

  return (
    <footer className="border-t border-border/40 bg-background/95">
      <div className="container flex flex-col items-center gap-4 px-4 py-6 md:px-8">
        <nav aria-label="Policies" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          {legalLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="inline-flex min-h-6 items-center text-sm text-foreground underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <p className="text-balance text-center text-sm leading-loose text-muted-foreground">
          &copy; {currentYear} Victorious Herbal Elements LLC. All rights reserved.
        </p>
        <p
          id="disclaimer"
          className="max-w-3xl text-balance text-center text-sm font-bold leading-relaxed text-foreground"
        >
          {FDA_DISCLAIMER}
        </p>
        {!isLoading && (
          <div className="text-sm text-foreground">
            {!isAdmin ? (
              <Link href="/admin/login" className="inline-flex min-h-6 items-center hover:underline">
                Admin Login
              </Link>
            ) : (
              <Link href="/admin/dashboard" className="inline-flex min-h-6 items-center hover:underline">
                Admin Dashboard
              </Link>
            )}
          </div>
        )}
      </div>
    </footer>
  );
}
