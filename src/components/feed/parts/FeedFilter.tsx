"use client";

import { Fragment, useId, useState } from "react";

import { EviAutoGrid } from "@/src/components/layout/EviAutoGrid";
import { EviStack } from "@/src/components/layout/EviStack";

export type FeedFilterItem = { key: string; tags: string[]; node: React.ReactNode };

const ALL = "";

/**
 * Emne-filtre over Feedens kort: radioknapper som piller (ét emne ad gangen,
 * "Alle" først). Kortene renderes på serveren og sendes ind, så alle står i
 * HTML'en til Google; filteret skjuler kun dem, der ikke matcher. Antallet
 * meddeles høfligt til skærmlæsere, når man skifter emne.
 */
export function FeedFilter({
  legend,
  allLabel,
  status,
  tags,
  items,
}: {
  legend: string;
  allLabel: string;
  /** Fx "{antal} indlæg"; tom = ingen meddelelse. */
  status: string | null;
  tags: string[];
  items: FeedFilterItem[];
}): React.ReactElement {
  const [active, setActive] = useState(ALL);
  const name = useId();
  const visible = active === ALL ? items : items.filter((item) => item.tags.includes(active));

  return (
    <EviStack gap="lg" className="col-span-12">
      <EviStack as="fieldset" direction="row" wrap gap="xs" className="min-w-0">
        <legend className="sr-only">{legend}</legend>
        {[ALL, ...tags].map((tag) => (
          <label
            key={tag}
            className="inline-flex min-h-10 cursor-pointer items-center rounded-full px-4 text-sm font-semibold ring-1 ring-current/25 ring-inset has-checked:bg-evi-primary has-checked:text-evi-text-on-primary has-checked:ring-0 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-current"
          >
            <input
              type="radio"
              name={name}
              value={tag}
              checked={active === tag}
              onChange={() => setActive(tag)}
              className="sr-only"
            />
            {tag === ALL ? allLabel : tag}
          </label>
        ))}
      </EviStack>
      <span role="status" className="sr-only">
        {status?.replace(/\{(antal|count)\}/g, String(visible.length))}
      </span>
      <EviAutoGrid size="trio">
        {visible.map((item) => (
          <Fragment key={item.key}>{item.node}</Fragment>
        ))}
      </EviAutoGrid>
    </EviStack>
  );
}
