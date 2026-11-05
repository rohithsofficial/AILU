import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["three"],
  images: { remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }] },
  webpack: (config, { isServer }) => {
    config.module.rules.push({ test: /ailu-world\.css$/, enforce: "pre", use: fileURLToPath(new URL("./scripts/strip-world-font-import.cjs", import.meta.url)) });
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
