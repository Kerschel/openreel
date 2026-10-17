import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Internet Archive poster/still endpoints. We keep next/image unoptimised
    // for these remote hosts because IA already serves sized derivatives and
    // the optimiser would add build-time network dependency.
    remotePatterns: [{ protocol: 'https', hostname: 'archive.org' }],
  },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
