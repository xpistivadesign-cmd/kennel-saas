/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // 🔥 EZ A LÉNYEG: Supabase Edge Functions kizárása
  webpack: (config) => {
    config.watchOptions = {
      ignored: [
        "**/supabase/functions/**",
        "**/supabase/**"
      ],
    };
    return config;
  },
};

module.exports = nextConfig;