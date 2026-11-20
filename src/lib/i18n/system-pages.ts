/**
 * Oversættelser til vores SYSTEM-sider (404/500). Dette er ENGINE-UI, ikke
 * kunde-indhold — derfor hardcodet her og IKKE i Prismic (error-siden skal
 * kunne rendere selvom Prismic er nede). Tilføj sprog efter behov; ukendt
 * sprog falder tilbage til engelsk.
 */
export type SystemPageCopy = {
  notFoundTitle: string;
  notFoundBody: string;
  home: string;
  errorTitle: string;
  errorBody: string;
  retry: string;
  /** Skip-link (WCAG 2.4.1) i root-layout'et — engine-chrome, oversættes her. */
  skipToContent: string;
  /** EviVideo's knap og udskriftens åbner. */
  videoPlay: string;
  videoPause: string;
  videoTranscript: string;
};

const EN: SystemPageCopy = {
  notFoundTitle: "Page not found",
  notFoundBody: "We couldn't find the page you were looking for.",
  home: "Go to homepage",
  errorTitle: "Something went wrong",
  errorBody: "An unexpected error occurred. Please try again shortly.",
  retry: "Try again",
  skipToContent: "Skip to content",
  videoPlay: "Play video",
  videoPause: "Pause video",
  videoTranscript: "Read the text in the video",
};

const COPY: Record<string, SystemPageCopy> = {
  en: EN,
  da: {
    notFoundTitle: "Siden blev ikke fundet",
    notFoundBody: "Vi kunne ikke finde den side, du ledte efter.",
    home: "Gå til forsiden",
    errorTitle: "Noget gik galt",
    errorBody: "Der opstod en uventet fejl. Prøv igen om lidt.",
    retry: "Prøv igen",
    skipToContent: "Spring til indhold",
    videoPlay: "Afspil video",
    videoPause: "Sæt video på pause",
    videoTranscript: "Læs teksten i videoen",
  },
};

/** Oversættelse ud fra en locale ("da-dk" → da-delen). Ukendt sprog → engelsk. */
export function system_copy(locale: string | null | undefined): SystemPageCopy {
  const lang = ((locale ?? "").split("-")[0] ?? "").toLowerCase();
  return COPY[lang] ?? EN;
}
