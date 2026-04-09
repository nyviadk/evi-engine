import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 1. Bygger URL'en og tvinger HTTPS i produktion
export function create_secure_url(path: string, request: NextRequest) {
  const url = new URL(path, request.url);
  if (
    process.env.NODE_ENV === "production" ||
    request.headers.get("x-forwarded-proto") === "https"
  ) {
    url.protocol = "https:";
  }
  return url;
}

// 2. Tilføjer HSTS header til alle svar, så browseren husker at bruge HTTPS
export function create_response_with_hsts(response: NextResponse) {
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );
  return response;
}
