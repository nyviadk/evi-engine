"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

import { cn } from "@/src/lib/utils/cn";

// Samme brud som EviImage's <picture>, så startbillede og video skifter sammen.
const MOBILE_MEDIA = "(max-width: 768px)";

// Afvist afspilning (fx strømbesparelse) efterlader bare startbilledet.
function play(video: HTMLVideoElement): void {
  video.play().catch(() => undefined);
}

export type EviVideoProps = {
  /** MP4 (16:9). Bruges på alle skærme, hvis der ikke er en mobilvideo. */
  src: string;
  /** MP4 (9:16) til skærme op til 768px. */
  mobileSrc?: string | null;
  /** Etiket på afspil-knappen (kun ikon, så den læses op). */
  playLabel: string;
  /** Etiket på pause-knappen. */
  pauseLabel: string;
  /** Startbilledet (fx EviImage), vist bag videoen, til den spiller. */
  children?: React.ReactNode;
  className?: string;
};

/**
 * EviVideo — lydløs video i loop, fx en forklarende video. Den spiller kun,
 * mens den er synlig, og hentes først der (preload="none"). Ønsker man
 * reduceret bevægelse, starter den på pause med startbilledet, og knappen
 * nederst til højre kan altid stoppe den (WCAG 2.2.2). Ingen cookies: en
 * almindelig <video> uden afspiller fra tredjepart.
 */
export function EviVideo({
  src,
  mobileSrc,
  playLabel,
  pauseLabel,
  children,
  className,
}: EviVideoProps): React.ReactElement {
  const ref = useRef<HTMLVideoElement>(null);
  // En pause, man selv har valgt, skal ikke ophæves, når videoen ruller ind igen.
  const paused_by_user = useRef(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches) paused_by_user.current = true;
    const on_motion = (event: MediaQueryListEvent) => {
      if (!event.matches) return;
      paused_by_user.current = true;
      video.pause();
    };
    motion.addEventListener("change", on_motion);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !paused_by_user.current) {
          play(video);
        } else if (!entry?.isIntersecting) {
          video.pause();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(video);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", on_motion);
    };
  }, []);

  const toggle = () => {
    const video = ref.current;
    if (!video) return;
    if (video.paused) {
      paused_by_user.current = false;
      play(video);
    } else {
      paused_by_user.current = true;
      video.pause();
    }
  };

  const Icon = playing ? Pause : Play;

  return (
    <div
      data-slot="evi-video"
      data-playing={playing || undefined}
      className={cn(
        "relative w-full overflow-hidden rounded-evi border border-current/10",
        mobileSrc ? "aspect-9/16 md:aspect-video" : "aspect-video",
        className,
      )}
    >
      {children && <div className="absolute inset-0">{children}</div>}
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="none"
        width={1920}
        height={1080}
        // Dekorativ: teksten står i sektionens udskrift, og knappen styrer den.
        aria-hidden="true"
        tabIndex={-1}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="absolute inset-0 size-full object-cover"
      >
        {mobileSrc && <source media={MOBILE_MEDIA} src={mobileSrc} type="video/mp4" />}
        <source src={src} type="video/mp4" />
      </video>
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? pauseLabel : playLabel}
        className="absolute right-3 bottom-3 grid size-11 cursor-pointer place-items-center rounded-full bg-evi-dark text-evi-text-on-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-evi-dark md:right-4 md:bottom-4"
      >
        <Icon aria-hidden="true" className="size-5" />
      </button>
    </div>
  );
}
