"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

import { EviStack } from "@/src/components/layout/EviStack";
import { cn } from "@/src/lib/utils/cn";

// Samme brud som EviImage's <picture>, så startbillede og video skifter sammen.
const MOBILE_MEDIA = "(max-width: 768px)";

// Afvist afspilning (fx strømbesparelse) efterlader bare startbilledet.
function play(video: HTMLVideoElement): void {
  video.play().catch(() => undefined);
}

/** 74.3 → "1:14". */
function clock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export type EviVideoLabels = {
  play: string;
  pause: string;
  /** Tidslinjens navn, fx "Spol i videoen". */
  seek: string;
  /** Ordet mellem tiderne til skærmlæsere, fx "af" i "0:12 af 0:31". */
  of: string;
};

export type EviVideoProps = {
  /** MP4 (16:9). Bruges på alle skærme, hvis der ikke er en mobilvideo. */
  src: string;
  /** MP4 (9:16) til skærme op til 768px. */
  mobileSrc?: string | null;
  labels: EviVideoLabels;
  /** Startbilledet (fx EviImage), vist bag videoen, til den spiller. */
  children?: React.ReactNode;
  className?: string;
};

/**
 * EviVideo — lydløs video i loop, fx en forklarende video. Den spiller kun,
 * mens den er synlig, og hentes først der (preload="none"). Ønsker man
 * reduceret bevægelse, starter den på pause med startbilledet. Bjælken nederst
 * kan altid stoppe den (WCAG 2.2.2) og spole frem og tilbage. Ingen cookies:
 * en almindelig <video> uden afspiller fra tredjepart.
 */
export function EviVideo({
  src,
  mobileSrc,
  labels,
  children,
  className,
}: EviVideoProps): React.ReactElement {
  const ref = useRef<HTMLVideoElement>(null);
  // En pause, man selv har valgt, skal ikke ophæves, når videoen ruller ind igen.
  const paused_by_user = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

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
        if (entry?.isIntersecting && !paused_by_user.current) play(video);
        else if (!entry?.isIntersecting) video.pause();
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

  // Står videoen på pause fra start (reduceret bevægelse), er intet hentet
  // endnu; længden hentes, så snart man nærmer sig bjælken.
  const load_duration = () => {
    const video = ref.current;
    if (!video || video.readyState > 0) return;
    video.preload = "metadata";
    video.load();
  };

  const seek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const video = ref.current;
    if (!video) return;
    const value = Number(event.target.value);
    video.currentTime = value;
    setTime(value);
  };

  const Icon = playing ? Pause : Play;
  const progress = duration ? (time / duration) * 100 : 0;
  const seek_style: React.CSSProperties & { "--seek-progress": string } = {
    "--seek-progress": `${progress}%`,
  };

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
        // Dekorativ: teksten står skjult i sektionen til skærmlæsere, og
        // bjælken styrer den.
        aria-hidden="true"
        tabIndex={-1}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        className="absolute inset-0 size-full object-cover"
      >
        {mobileSrc && <source media={MOBILE_MEDIA} src={mobileSrc} type="video/mp4" />}
        <source src={src} type="video/mp4" />
      </video>
      <EviStack
        direction="row"
        align="center"
        gap="sm"
        onPointerEnter={load_duration}
        onFocus={load_duration}
        className="absolute inset-x-3 bottom-3 rounded-full bg-evi-dark py-1 ps-1 pe-4 text-evi-text-on-dark md:inset-x-4 md:bottom-4"
      >
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? labels.pause : labels.play}
          className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-current"
        >
          <Icon aria-hidden="true" className="size-5" />
        </button>
        <input
          type="range"
          min={0}
          max={duration || 1}
          // Ét sekund pr. piletast; 0,1 var for langsomt at spole med.
          step={1}
          value={time}
          onChange={seek}
          aria-label={labels.seek}
          aria-valuetext={`${clock(time)} ${labels.of} ${clock(duration)}`}
          style={seek_style}
          className="evi-seek min-w-0 flex-1"
        />
        <span aria-hidden="true" className="text-xs whitespace-nowrap tabular-nums">
          {clock(time)} / {clock(duration)}
        </span>
      </EviStack>
    </div>
  );
}
