/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["three"],
  async redirects() {
    return [{ source: "/world", destination: "/", permanent: true }];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        dns: false,
        net: false,
        tls: false,
        "util/types": false,
      };
    }
    return config;
  },
};
export default nextConfig;
