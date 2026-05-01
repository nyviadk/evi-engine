/**
 * Sikker serialisering af JSON-LD.
 * Gør PRÆCIS det samme som 'serialize-javascript' pakken gør for XSS-beskyttelse,
 * men uden overhead, da JSON-LD ikke indeholder funktioner eller Regex.
 */
export function safeJsonLdStringify(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c") // Forhindrer </script> breakout
    .replace(/>/g, "\\u003e") // Ekstra sikkerhed for HTML tags
    .replace(/\//g, "\\u002f") // Gør det umuligt at skrive et validt lukke-tag
    .replace(/\u2028/g, "\\u2028") // Sikrer mod specielle linjeskift-angreb
    .replace(/\u2029/g, "\\u2029");
}
