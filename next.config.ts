import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.prismic.io" }],
  },
  experimental: {
    // Lucide-react er en barrel-eksport med 1500+ ikoner. Uden denne
    // optimering betaler hver cold start 200-800ms på import-tid alene.
    // Next.js transformer "import { Menu } from 'lucide-react'" til den
    // direkte path i build, så TS-types og autocomplete bevares.
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
