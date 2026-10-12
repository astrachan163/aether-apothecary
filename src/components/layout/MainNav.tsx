'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/ingredients', label: 'Ingredients' },
  { href: '/community', label: 'Community' },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'inline-flex min-h-6 items-center transition-colors hover:text-accent',
            pathname === item.href ? 'text-accent' : 'text-foreground'
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
    // Add mobile navigation drawer if needed
  );
}
