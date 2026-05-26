/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/", destination: "/index.html" },

        { source: "/videos", destination: "/videos.html" },
        { source: "/branches", destination: "/branches.html" },
        { source: "/labs", destination: "/labs.html" },
        { source: "/pricing", destination: "/pricing.html" },
        { source: "/faq", destination: "/faq.html" },
        { source: "/hakkimizda", destination: "/hakkimizda.html" },
        { source: "/checkout", destination: "/checkout.html" },
        { source: "/daily-problem", destination: "/daily-problem.html" },
        { source: "/mentorship-application", destination: "/mentorship-application.html" },

        { source: "/login.html", destination: "/login" },
      ],
    };
  },
};

export default nextConfig;
