import { cn } from "@/src/lib/utils/cn";

export type PlanioLogoPart = "word" | "body" | "screen" | "line" | "shape";

export type PlanioLogoProps = Omit<React.ComponentProps<"svg">, "children"> & {
  /**
   * Stil pr. del, fx headerens forvandling. Hver del er sin egen gruppe med
   * fill-box som reference, så en skalering sker om delens egen midte.
   */
  partStyle?: Partial<Record<PlanioLogoPart, React.CSSProperties>>;
};

// Ordmærkerne "planio" og "MY" (geometri fra PlanioLive/design/forside.html).
const PLANIO_PATH = "M8.9,0A2.427,2.427,0,0,1,7.1-.7,2.427,2.427,0,0,1,6.4-2.5V-47.488a2.427,2.427,0,0,1,.7-1.792,2.427,2.427,0,0,1,1.792-.7H21.7A16.627,16.627,0,0,1,30.08-47.9a14.845,14.845,0,0,1,5.7,5.728,16.966,16.966,0,0,1,2.048,8.448,16.523,16.523,0,0,1-2.048,8.288,14.908,14.908,0,0,1-5.7,5.7,16.627,16.627,0,0,1-8.384,2.08h-10.3V-2.5a2.427,2.427,0,0,1-.7,1.792A2.427,2.427,0,0,1,8.9,0Zm2.5-22.464H21.7A11.672,11.672,0,0,0,27.52-23.9a10.3,10.3,0,0,0,4-4,11.672,11.672,0,0,0,1.44-5.824,11.936,11.936,0,0,0-1.44-5.952,10.525,10.525,0,0,0-4-4.032A11.472,11.472,0,0,0,21.7-45.184h-10.3ZM48.064,0A2.457,2.457,0,0,1,46.3-.7,2.372,2.372,0,0,1,45.568-2.5V-47.488a2.4,2.4,0,0,1,.736-1.76,2.4,2.4,0,0,1,1.76-.736,2.4,2.4,0,0,1,1.76.736,2.4,2.4,0,0,1,.736,1.76V-4.736H75.584a2.52,2.52,0,0,1,1.76.672,2.2,2.2,0,0,1,.736,1.7,2.2,2.2,0,0,1-.736,1.7A2.52,2.52,0,0,1,75.584,0ZM83.328,0a2.2,2.2,0,0,1-2.112-1.216,2.594,2.594,0,0,1-.128-2.368L99.9-48.256a2.472,2.472,0,0,1,2.432-1.728,2.432,2.432,0,0,1,2.368,1.728L123.584-3.52a2.309,2.309,0,0,1-.16,2.368A2.333,2.333,0,0,1,121.344,0a2.522,2.522,0,0,1-1.376-.384,2.8,2.8,0,0,1-.992-1.152l-17.6-42.688h1.984L85.632-1.536A2.407,2.407,0,0,1,84.7-.384,2.522,2.522,0,0,1,83.328,0Zm4.224-11.9,1.92-4.288h25.984l1.92,4.288ZM133.568,0a2.427,2.427,0,0,1-1.792-.7,2.427,2.427,0,0,1-.7-1.792V-47.488a2.427,2.427,0,0,1,.7-1.792,2.427,2.427,0,0,1,1.792-.7,2.425,2.425,0,0,1,1.92.9L166.08-8.9V-47.488a2.427,2.427,0,0,1,.7-1.792,2.427,2.427,0,0,1,1.792-.7,2.457,2.457,0,0,1,1.76.7,2.372,2.372,0,0,1,.736,1.792V-2.5A2.372,2.372,0,0,1,170.336-.7a2.457,2.457,0,0,1-1.76.7,2.9,2.9,0,0,1-1.024-.192,1.762,1.762,0,0,1-.832-.64L136.064-41.024V-2.5A2.372,2.372,0,0,1,135.328-.7,2.457,2.457,0,0,1,133.568,0Zm52.8,0a2.427,2.427,0,0,1-1.792-.7,2.427,2.427,0,0,1-.7-1.792V-47.488a2.427,2.427,0,0,1,.7-1.792,2.427,2.427,0,0,1,1.792-.7,2.427,2.427,0,0,1,1.792.7,2.427,2.427,0,0,1,.7,1.792V-2.5a2.427,2.427,0,0,1-.7,1.792A2.427,2.427,0,0,1,186.368,0Zm38.4.64a26.685,26.685,0,0,1-10.24-1.92,24.216,24.216,0,0,1-8.1-5.376,24.4,24.4,0,0,1-5.312-8.128,27.083,27.083,0,0,1-1.888-10.24A26.908,26.908,0,0,1,201.12-35.2a24.4,24.4,0,0,1,5.312-8.128,24.216,24.216,0,0,1,8.1-5.376,26.685,26.685,0,0,1,10.24-1.92,26.514,26.514,0,0,1,10.176,1.92,24.568,24.568,0,0,1,8.128,5.376,24.162,24.162,0,0,1,5.344,8.128A26.909,26.909,0,0,1,250.3-25.024a27.083,27.083,0,0,1-1.888,10.24,24.162,24.162,0,0,1-5.344,8.128,24.568,24.568,0,0,1-8.128,5.376A26.514,26.514,0,0,1,224.768.64Zm0-4.736a21.149,21.149,0,0,0,8.192-1.568,19.552,19.552,0,0,0,6.56-4.416,20.254,20.254,0,0,0,4.32-6.656,21.951,21.951,0,0,0,1.536-8.288,21.778,21.778,0,0,0-1.536-8.224,20.254,20.254,0,0,0-4.32-6.656,19.552,19.552,0,0,0-6.56-4.416,21.149,21.149,0,0,0-8.192-1.568,21.318,21.318,0,0,0-8.256,1.568,19.552,19.552,0,0,0-6.56,4.416,20.254,20.254,0,0,0-4.32,6.656,21.778,21.778,0,0,0-1.536,8.224,21.951,21.951,0,0,0,1.536,8.288,20.254,20.254,0,0,0,4.32,6.656,19.552,19.552,0,0,0,6.56,4.416A21.318,21.318,0,0,0,224.768-4.1Z";
const MY_PATH = "M3.336,0a.9.9,0,0,1-.66-.276A.9.9,0,0,1,2.4-.936V-17.808a.89.89,0,0,1,.276-.672.921.921,0,0,1,.66-.264.89.89,0,0,1,.84.48l8.088,16.08h-.816l7.944-16.08a.923.923,0,0,1,.84-.48.881.881,0,0,1,.648.264.91.91,0,0,1,.264.672V-.936a.921.921,0,0,1-.264.66A.862.862,0,0,1,20.232,0a.929.929,0,0,1-.684-.276.9.9,0,0,1-.276-.66V-15.384l.408.024L12.6-.888a.878.878,0,0,1-.816.456.893.893,0,0,1-.864-.576L3.792-15.264l.48-.12V-.936A.9.9,0,0,1,4-.276.9.9,0,0,1,3.336,0ZM31.32,0a.9.9,0,0,1-.66-.276.9.9,0,0,1-.276-.66v-6L23.856-17.28a.94.94,0,0,1-.18-.7.943.943,0,0,1,.3-.552.863.863,0,0,1,.6-.216.829.829,0,0,1,.468.12,1.186,1.186,0,0,1,.324.336l6.48,10.44H30.84L37.3-18.24a1.144,1.144,0,0,1,.372-.384.954.954,0,0,1,.492-.12.766.766,0,0,1,.564.228.91.91,0,0,1,.264.564,1.022,1.022,0,0,1-.18.672L32.256-6.936v6a.9.9,0,0,1-.276.66A.9.9,0,0,1,31.32,0Z";

const PART = "[transform-box:fill-box] origin-center";
const SHAPE = "fill-evi-light stroke-evi-primary";

/**
 * My Planios logo: en planner med figurer om sig og "MY planio". "MY" og
 * forbindelseslinjerne følger tekstfarven (lyse på mørk baggrund); resten er
 * brand-farverne.
 */
export function PlanioLogo({
  partStyle,
  className,
  ...props
}: PlanioLogoProps): React.ReactElement {
  const part = (name: PlanioLogoPart) => ({
    "data-part": name,
    className: PART,
    style: partStyle?.[name],
  });
  const line = {
    "data-part": "line",
    pathLength: 1,
    fill: "none",
    strokeLinecap: "round" as const,
    strokeWidth: 2,
    className: "stroke-current",
    style: partStyle?.line,
  };

  return (
    <svg
      viewBox="0 0 388.904 146"
      className={cn("aspect-[388.904/146] overflow-visible", className)}
      {...props}
    >
      <g transform="translate(-54 -229)">
        <g {...part("word")}>
          <path d={PLANIO_PATH} transform="translate(192.6 339.364)" className="fill-evi-primary" />
        </g>
        <g transform="translate(-16.5 158.5)">
          <g {...part("shape")}>
            <circle cx="7.849" cy="7.849" r="7.849" transform="translate(71.5 90.842)" strokeWidth={2} className={SHAPE} />
          </g>
          <g {...part("shape")}>
            <rect width="13" height="13" transform="translate(202.415 71.5)" strokeWidth={2} className={SHAPE} />
          </g>
          <g {...part("shape")}>
            <path d="M311.228,304.5,304.5,317.955h13.455Z" transform="translate(-102.455 -102.455)" strokeWidth={2} className={SHAPE} />
          </g>
          <g {...part("shape")}>
            <path d="M99.288,285l7.288,4.2v8.41l-7.288,4.2L92,297.614V289.2Z" transform="translate(-9.007 -93.888)" strokeWidth={2} className={SHAPE} />
          </g>
          <path d="M120.54,123.767q-21.3-25.79-35.04-8.97" transform="translate(-6.151 -16.106)" {...line} />
          <path d="M252,112.934q15.7-25.79,36.161-29.434" transform="translate(-79.389 -5.272)" {...line} />
          <path d="M129.108,272Q113.41,293.3,105,287.7" transform="translate(-14.718 -88.176)" {...line} />
          <path d="M252,272q15.7,26.911,36.161,26.07" transform="translate(-79.389 -88.176)" {...line} />
          <g {...part("body")}>
            <rect width="67.277" height="98.588" rx="16" transform="translate(109.861 94.206)" className="fill-evi-primary" />
          </g>
          <g {...part("screen")}>
            <rect width="49.337" height="80.647" rx="8" transform="translate(118.832 103.176)" className="fill-evi-light" />
          </g>
          <g {...part("screen")}>
            <rect width="38.124" height="3.364" rx="1.682" transform="translate(123.318 109.881)" className="fill-evi-primary" />
          </g>
          <g {...part("screen")}>
            <rect width="38.124" height="3.364" rx="1.682" transform="translate(123.318 121.087)" className="fill-evi-dark" />
          </g>
          <g {...part("screen")}>
            <rect width="22.426" height="3.364" rx="1.682" transform="translate(123.323 125.569)" className="fill-evi-dark" />
          </g>
          <g {...part("screen")}>
            <rect width="29.153" height="3.364" rx="1.682" transform="translate(123.321 136.775)" className="fill-evi-primary" />
          </g>
          <g {...part("screen")}>
            <rect width="38.124" height="3.364" rx="1.682" transform="translate(123.318 147.981)" className="fill-evi-dark" />
          </g>
          <g {...part("screen")}>
            <rect width="38.124" height="3.364" rx="1.682" transform="translate(123.318 152.464)" className="fill-evi-dark" />
          </g>
          <g {...part("screen")}>
            <rect width="17.941" height="3.364" rx="1.682" transform="translate(123.324 156.946)" className="fill-evi-dark" />
          </g>
          <g {...part("screen")}>
            <line x2="8.97" transform="translate(154.703 174.877)" fill="none" strokeLinecap="round" strokeWidth={2} className="stroke-evi-dark" />
          </g>
          <g {...part("screen")}>
            <line y2="8.97" transform="translate(159.189 170.391)" fill="none" strokeLinecap="round" strokeWidth={2} className="stroke-evi-dark" />
          </g>
        </g>
        <g {...part("word")}>
          <path d={MY_PATH} transform="translate(197 283)" className="fill-current" />
        </g>
      </g>
    </svg>
  );
}
