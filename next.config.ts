/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ❌ remove webpack entirely (Turbopack conflict fix)
  webpack: undefined,

  experimental: {
    externalDir: true
  }
};

module.exports = nextConfig;