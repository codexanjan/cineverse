import type { NextConfig } from "next";
const config: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [{ protocol: "https", hostname: "image.tmdb.org" }],
  },
  async rewrites() {
    if (process.env.API_URL) {
      return [
        {
          source: "/api/:path*",
          destination: `${process.env.API_URL}/:path*`,
        },
      ];
    }
    return [];
  },
};
export default config;
