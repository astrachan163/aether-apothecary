import type { Metadata } from 'next';
import { lora } from '@/lib/fonts';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SiteNotices } from '@/components/layout/SiteNotices';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';

export const metadata: Metadata = {
  title: 'Victorious Herbal Elements LLC',
  description: 'The Victorious Herbal Elements store.',
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
            <SiteNotices />
            <Header />
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
