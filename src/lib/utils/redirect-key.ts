const DANISH_LETTERS: Record<string, string> = { æ: "ae", ø: "oe", å: "aa" };

/**
 * Sammenligningsnøgle for vanity-redirects: små bogstaver og æøå skrevet som
 * ae/oe/aa, så "/Tænk-nyt", "/taenk-nyt" og "/tænk-nyt" rammer samme række.
 * NFC først, fordi macOS kan sende "å" som "a" + kombinerende ring.
 */
export function redirect_key(path: string): string {
  return path
    .normalize("NFC")
    .toLowerCase()
    .replace(/[æøå]/g, (letter) => DANISH_LETTERS[letter] ?? letter);
}
