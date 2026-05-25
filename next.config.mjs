/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Demonstrates: server-only packages kept out of the client bundle
    serverComponentsExternalPackages: ['@prisma/client', 'bcrypt'],
    // Server Actions are stable in Next 14 but the flag documents intent
    serverActions: { bodySizeLimit: '2mb' },
  },
};

export default nextConfig;
