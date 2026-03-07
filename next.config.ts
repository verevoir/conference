import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },
  serverExternalPackages: [
    '@opentelemetry/sdk-node',
    '@opentelemetry/auto-instrumentations-node',
    '@google-cloud/opentelemetry-cloud-trace-exporter',
  ],
  turbopack: {
    resolveAlias: {
      sharp: './src/shims/sharp.js',
    },
  },
};

export default nextConfig;
