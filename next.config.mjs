/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['mjs', 'js', 'ts', 'jsx', 'tsx'],
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
