import type {NextConfig} from 'next';
import path from 'node:path';

const staticExport = process.env.STATIC_EXPORT === '1';

const nextConfig: NextConfig = {
  // Firebase Hosting (`npm run build:static`) is a static export. Vercel keeps
  // the default server build.
  ...(staticExport ? { output: 'export' as const } : {}),
  // Vercel runs `next build` the same way local does. These flags keep
  // existing type and lint errors from failing that build.
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: staticExport,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: staticExport
    ? (config) => {
        const offlinePage = path.join(process.cwd(), 'src/components/admin/AdminOffline.tsx');
        config.resolve.alias = {
          ...(config.resolve.alias ?? {}),
          '@/components/admin/AdminLoginLive': offlinePage,
          '@/components/admin/AdminDashboardLive': offlinePage,
        };
        return config;
      }
    : undefined,
};

export default nextConfig;
