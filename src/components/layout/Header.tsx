import Link from 'next/link';
import Image from 'next/image';
import { MainNav } from './MainNav';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center space-x-2">
          <Image 
            src="/images/products/Logo.JPG" 
            alt="Victorious Herbal Elements Logo" 
            width={36} 
            height={36} 
            className="rounded-full" // Changed from rounded-sm
            style={{ height: 'auto' }} // Maintain aspect ratio
          />
          <span className="font-semibold text-lg tracking-tight text-foreground">Victorious Herbal Elements</span>
        </Link>
        <MainNav />
      </div>
    </header>
  );
}
