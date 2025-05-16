import Link from 'next/link';
import { MainNav } from './MainNav';
import { Package } from 'lucide-react'; // Placeholder for logo

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center space-x-2">
          <Package className="h-6 w-6 text-accent" />
          <span className="font-semibold text-lg tracking-tight text-foreground">Aether Apothecary</span>
        </Link>
        <MainNav />
      </div>
    </header>
  );
}
