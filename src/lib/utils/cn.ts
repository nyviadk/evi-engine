import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Konsekvent class-merge: clsx håndterer conditional klasser,
 * twMerge løser Tailwind-konflikter (sidste utility vinder).
 *
 * Rækkefølge: base styles → variant styles → conditional styles →
 * user-provided className. Sidste argument vinder konflikter.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
