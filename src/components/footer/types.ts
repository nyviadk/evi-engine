import type { LinkResolverFunction } from "@prismicio/client";

/**
 * Context passed by <SliceZone> to every footer column slice. Kept minimal
 * — columns only need the link resolver. If future column types need more
 * context (settings, tenant), add here without breaking existing columns.
 */
export type EviFooterSliceContext = {
  linkResolver: LinkResolverFunction;
};
