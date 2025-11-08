import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  env: {
    CL_APP_KEY: process.env.CL_APP_KEY,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Adicione esta configuração webpack
  webpack: (config, { isServer }) => {
    // Ignorar canvas no lado do cliente
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
        net: false,
        tls: false,
        os: false,
        path: false,
      };
    }

    // Ignore .node files
    config.module.rules.push({
      test: /\.node$/,
      use: "ignore-loader",
    });

    return config;
  },
 
};

export default nextConfig;
