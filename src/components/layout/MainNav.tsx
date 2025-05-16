'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/ingredients', label: 'Ingredients' },
  { href: '/recommendations', label: 'Recommendations' },
  { href: '/community', label: 'Community' },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'transition-colors hover:text-accent',
            pathname === item.href ? 'text-accent' : 'text-foreground/70'
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
    // Add mobile navigation drawer if needed
  );
}
