/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: false
  },
  trailingSlash: true,
  exportPathMap: async function (defaultPathMap) {
    return {
      '/': { page: '/' }
    }
  }
}

module.exports = nextConfig
