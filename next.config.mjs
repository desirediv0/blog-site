/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.digitaloceanspaces.com',
      },
      {
        protocol: 'https',
        hostname: '**.cdn.digitaloceanspaces.com',
      },
      // Allow any DigitalOcean Spaces CDN
      {
        protocol: 'https',
        hostname: '**.blr1.digitaloceanspaces.com',
      },
      {
        protocol: 'https',
        hostname: '**.sgp1.digitaloceanspaces.com',
      },
      {
        protocol: 'https',
        hostname: '**.nyc3.digitaloceanspaces.com',
      },
      {
        protocol: 'https',
        hostname: '**.ams3.digitaloceanspaces.com',
      },
      {
        protocol: 'https',
        hostname: '**.fra1.digitaloceanspaces.com',
      },
      // Local uploads
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
};

export default nextConfig;
