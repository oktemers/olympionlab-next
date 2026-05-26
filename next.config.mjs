/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/",
          destination: "/index.html",
        },
        {
          source: "/login.html",
          destination: "/login",
        },
      ],
    };
  },
};

export default nextConfig;
