/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 't.me', pathname: '/**' },
      { protocol: 'https', hostname: 'telegram.org', pathname: '/**' },
      { protocol: 'https', hostname: 'telesco.pe', pathname: '/**' },
      { protocol: 'https', hostname: '*.telegram-cdn.org', pathname: '/**' },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  }
}

export default nextConfig
