import type { Metadata } from 'next';
import { lora } from '@/lib/fonts';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: 'Aether Apothecary',
  description: 'Herbal alternatives for holistic healing.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={lora.variable}>
      <body className="antialiased">
        <Header />
        <main className="py-8 px-4 md:px-8">
          {children}
        </main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
