import type { NextRequest } from "next/server";

import { planio_styleguide_file } from "@/src/components/planio/styleguide/files";

// Filnavne med endelse (.json/.svg/.png/.zip) springer middleware over og lander
// her uden sprog-præfiks; selve siden ligger under app/[lang]/styleguide.
export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/styleguide/[file]">,
): Promise<Response> {
  const { file } = await ctx.params;
  return planio_styleguide_file(file);
}
