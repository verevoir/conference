import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  turbopack: {
    resolveAlias: {
      sharp: './src/shims/sharp.js',
    },
  },
};

export default nextConfig;
