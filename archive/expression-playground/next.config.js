/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['ws', 'hume', 'canvas']
}

module.exports = nextConfig
