import type {NextConfig} from 'next';

const staticExport = process.env.STATIC_EXPORT === '1';

const nextConfig: NextConfig = {
  ...(staticExport ? { output: 'export' as const } : {}),
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: staticExport,
  },
};

export default nextConfig;
