/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove the rewrites and redirects from here since we're handling them in middleware
  // output: 'export',
  images: { unoptimized: true },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;