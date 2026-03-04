import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
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
