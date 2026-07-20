/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
    tsconfigPath: './tsconfig.json',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    allowedDevOrigins: [
      'ais-dev-6jzhepkq5rthhopa3wxcbk-685882207368.asia-east1.run.app',
      'ais-pre-6jzhepkq5rthhopa3wxcbk-685882207368.asia-east1.run.app',
      'localhost:3000'
    ]
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://127.0.0.1:3001/api/v1/:path*',
      },
    ]
  },
}

export default nextConfig
