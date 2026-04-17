import { exitPreview } from "@prismicio/next";

export const dynamic = "force-dynamic";

export function GET() {
  return exitPreview();
}
