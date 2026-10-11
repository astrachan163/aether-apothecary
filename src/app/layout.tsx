import type { Metadata } from 'next';
import { lora } from '@/lib/fonts';
import './globals.css';
import { DemoBanner } from '@/components/layout/DemoBanner';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';

export const metadata: Metadata = {
  title: 'Victorious Herbal Elements LLC',
  description: 'Sample storefront for Victorious Herbal Elements.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={lora.variable}>
      <body className="antialiased">
        <AuthProvider>
          <DataProvider>
            <div className="sticky top-0 z-50">
              <DemoBanner />
              <Header />
            </div>
            <main className="py-8 px-4 md:px-8">
              {children}
            </main>
            <Footer />
            <Toaster />
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
