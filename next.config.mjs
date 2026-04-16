/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['mjs', 'js', 'ts', 'jsx', 'tsx'],
  experimental: {
    optimizePackageImports: ['react-icons'],
  },
  images: {
    // domains: ['drive.google.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'drive.google.com',
      }
    ],
  }
};

export default nextConfig;
