import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * clsx håndterer conditional klasser; twMerge løser Tailwind-konflikter
 * (sidste utility vinder).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
