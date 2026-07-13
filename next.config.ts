import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.prismic.io" },
      // Placeholder-billeder til EviTestBench (dev-only preview af mockups mv.)
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
  // cacheComponents (PPR) er BEVIDST og PERMANENT slået fra — ikke en TODO.
  // Vores multi-tenant arkitektur læser hostname-header i root layout for at
  // sætte tenant-theme på <html>. Hele træet afhænger af tenant — der er
  // intet prerenderbart. cacheComponents belønner statisk-skal+dynamisk-ø
  // arkitekturer; vi er den modsatte klasse app.
  //
  // R2 incremental cache + DO tag cache (via OpenNext) giver os allerede
  // edge-cached HTML per tenant med tag-baseret invalidering — det er den
  // perf-gevinst cacheComponents lover, leveret på et lag der virker for
  // multi-tenant. Se memory: project_next_cache_components_skill.md.
  // React Compiler 1.0 (stable). Memoization sker automatisk; ingen manuel
  // useMemo/useCallback nødvendigt for typiske komponenter.
  reactCompiler: true,
  experimental: {
    // Lucide-react er en barrel-eksport med 1500+ ikoner. Uden denne
    // optimering betaler hver cold start 200-800ms på import-tid alene.
    // Next.js transformer "import { Menu } from 'lucide-react'" til den
    // direkte path i build, så TS-types og autocomplete bevares.
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
