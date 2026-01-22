/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  async rewrites() {
    return [
      { source: '/favicon.ico', destination: '/icon.svg' },
    ]
  },
  // Workaround: on some Windows setups, webpack persistent cache can break
  // app-router client chunk emission (leading to 404s under /_next/static/*).
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false
    }
    return config
  },
}

module.exports = nextConfig
