/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'shop.looplib.com',
      },
      {
        protocol: 'https',
        hostname: 'pub-fe9d2a16549143799caef21a9fea0ccc.r2.dev',
      },
    ],
  },
};

module.exports = nextConfig;