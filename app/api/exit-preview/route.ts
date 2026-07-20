import { exitPreview } from "@prismicio/next";

export function GET(): ReturnType<typeof exitPreview> {
  return exitPreview();
}
