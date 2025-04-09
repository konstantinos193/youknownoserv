/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['i.postimg.cc'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.postimg.cc',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_URL}/api/:path*`,
      },
    ]
  },
}

module.exports = nextConfig 