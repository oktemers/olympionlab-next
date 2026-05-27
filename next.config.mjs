/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/daily-problem.html",
        destination: "/daily-problem",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
