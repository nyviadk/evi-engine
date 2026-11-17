"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Driver logo-forvandlingen i headeren: sætter `--morph` på `<header>` 1:1 med
 * scrollen, fra 0 øverst til 1, når sidens første sektion er scrollet helt ind
 * under headeren, dog højst én skærm (på fx vilkårssiden er første sektion hele
 * dokumentet). Halvt scrollet er halvt forvandlet; med reduceret bevægelse
 * skiftes der i midten. Lægger også headerens højde i `--planio-header-h` og
 * scroll-padding, så sticky elementer og ankre lander under headeren.
 */
export function PlanioMorphDriver(): React.ReactElement {
  const ref = useRef<HTMLSpanElement>(null);
  // Layoutet (og dermed headeren) bliver stående ved sideskift, men første
  // sektion er en ny, så der måles igen.
  const pathname = usePathname();

  useEffect(() => {
    const header = ref.current?.closest("header");
    if (!header) return;

    const root = document.documentElement;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    let section: Element | null = null;
    let range = 1;
    let frame = 0;

    const update = () => {
      frame = 0;
      const p = Math.min(Math.max(window.scrollY / range, 0), 1);
      header.style.setProperty(
        "--morph",
        (reduce.matches ? Math.round(p) : p).toFixed(4),
      );
    };

    // Sektionen skifter højde med skærmbredden, og når skrifterne er hentet.
    const resized = new ResizeObserver(() => measure());

    const measure = () => {
      // Slås op hver gang: sidens indhold kan komme efter headeren.
      const first = document.querySelector("#main section");
      if (first !== section) {
        if (section) resized.unobserve(section);
        if (first) resized.observe(first);
        section = first;
      }
      const header_h = header.offsetHeight;
      // Skærmhøjden tages ved måling, ikke ved hver resize: mobilens adresselinje
      // ændrer innerHeight under scroll og ville ellers flytte loftet.
      const screen = window.innerHeight - header_h;
      const section_end = section
        ? section.getBoundingClientRect().bottom + window.scrollY - header_h
        : screen;
      range = Math.max(1, Math.min(section_end, screen));
      root.style.setProperty("--planio-header-h", `${header_h}px`);
      root.style.scrollPaddingTop = `${header_h}px`;
      update();
    };

    const on_scroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    resized.observe(header);
    window.addEventListener("scroll", on_scroll, { passive: true });
    reduce.addEventListener("change", update);

    return () => {
      resized.disconnect();
      window.removeEventListener("scroll", on_scroll);
      reduce.removeEventListener("change", update);
      cancelAnimationFrame(frame);
      root.style.removeProperty("--planio-header-h");
      root.style.removeProperty("scroll-padding-top");
    };
  }, [pathname]);

  return <span ref={ref} hidden />;
}
