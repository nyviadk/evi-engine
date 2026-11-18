import { encode } from "uqr";

import { cn } from "@/src/lib/utils/cn";

export type EviQrCodeProps = {
  /** Det, koden skal åbne, fx et link til App Store. */
  value: string;
  className?: string;
};

/**
 * QR-kode genereret på serveren som SVG. Mørke moduler på lys flade uanset
 * sektionens tema: scannere kræver kontrast og den hvide stilhedszone (border).
 * Dekorativ; linket ved siden af er det tilgængelige element.
 */
export function EviQrCode({ value, className }: EviQrCodeProps): React.ReactElement {
  const { data, size } = encode(value, { ecc: "M", border: 4 });
  let path = "";
  data.forEach((row, y) =>
    row.forEach((dark, x) => {
      if (dark) path += `M${x} ${y}h1v1h-1z`;
    }),
  );

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${size} ${size}`}
      shapeRendering="crispEdges"
      className={cn("rounded-evi bg-evi-light text-evi-dark", className)}
    >
      <path d={path} fill="currentColor" />
    </svg>
  );
}
