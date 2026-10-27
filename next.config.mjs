/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/yonetim-kurulu.html',
        destination: '/yonetim-kurulu',
        permanent: true,
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: '/yonetim-kurulu',
        destination: '/yonetim-kurulu.html',
      },
    ];
  },
};

export default nextConfig;
