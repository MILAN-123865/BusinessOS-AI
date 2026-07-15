/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
    tsconfigPath: './tsconfig.json',
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
