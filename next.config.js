/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Static export for Vercel
  images: {
    unoptimized: true, // For static export
  },
}

module.exports = nextConfig
