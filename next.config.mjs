import { augmentNextConfig as OLYMPION_CLEAN_URL_KIT } from './olympion-clean-url-routes.mjs';
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
        source: '/ozan-oktemer',
        destination: '/yonetim-kurulu-detay.html?member=kurucu',
      },
      {
        source: '/yonetim-kurulu',
        destination: '/yonetim-kurulu.html',
      },
    ];
  },
};

const __olympion_original_next_config = nextConfig;

export default OLYMPION_CLEAN_URL_KIT(__olympion_original_next_config);
