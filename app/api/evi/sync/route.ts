import { handle_beacon } from "@/src/lib/analytics/beacon";

// First-party endpoint til EviBeacon (soft-nav-tælling). Neutralt navngivet +
// same-origin, så ad-blockers ikke matcher det som analytics.
export async function POST(request: Request): Promise<Response> {
  return handle_beacon(request);
}
