/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.freepik.com',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Suppress warnings about missing package.json in platform-specific SWC binaries
    config.infrastructureLogging = {
      level: 'error',
    }
    return config
  },
};

export default nextConfig;
