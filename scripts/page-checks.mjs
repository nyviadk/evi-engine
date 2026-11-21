// Tjek der køres inde i siden via page.evaluate(). Funktionerne serialiseres,
// så de må ikke bruge noget uden for sig selv.

/**
 * Tekst der stikker ud af sin egen kasse, fx et langt ord i en smal kolonne.
 * Sidens vandrette overflow fanger det ikke, når kassen ligger inde i et kort
 * eller en sektion med overflow-x: clip. Kasser med overflow hidden/clip/auto
 * (afkortning, sr-only, scroll) springes over.
 */
export function find_text_spills() {
  const spills = new Map();
  // sr-only: klippet ned til 1px med vilje.
  const visually_hidden = (el) => {
    for (let a = el; a; a = a.parentElement) {
      if (getComputedStyle(a).overflowX !== "visible" && a.getBoundingClientRect().width <= 1) {
        return true;
      }
    }
    return false;
  };
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!node.textContent.trim()) continue;

    let box = node.parentElement;
    while (box && ["inline", "contents"].includes(getComputedStyle(box).display)) {
      box = box.parentElement;
    }
    if (!box || spills.has(box)) continue;

    const style = getComputedStyle(box);
    if (style.overflowX !== "visible" || style.visibility === "hidden") continue;
    if (visually_hidden(box)) continue;

    // hanging-punctuation (globals.css, kun Safari) lader citationstegn og
    // parenteser hænge ud i margenen med vilje; mål teksten uden dem.
    const hang = style.hangingPunctuation ?? "";
    const text = node.textContent;
    const lead = hang.includes("first") ? text.match(/^\s*[\p{Ps}\p{Pi}\p{Pf}"']?/u)[0].length : 0;
    const trail = hang.includes("last") ? text.match(/[\p{Pe}\p{Pi}\p{Pf}"']?\s*$/u)[0].length : 0;
    if (lead + trail >= text.length) continue;
    const range = document.createRange();
    range.setStart(node, lead);
    range.setEnd(node, text.length - trail);
    const rect = box.getBoundingClientRect();
    const left = rect.left + parseFloat(style.borderLeftWidth);
    const right = rect.right - parseFloat(style.borderRightWidth);
    const spill = Math.max(
      0,
      ...[...range.getClientRects()].map((r) => Math.max(r.right - right, left - r.left)),
    );
    if (spill > 1) {
      const text = node.textContent.trim().replace(/\s+/g, " ").slice(0, 50);
      spills.set(box, `"${text}" stikker ${Math.round(spill)}px ud af <${box.tagName.toLowerCase()}>`);
    }
  }
  return [...spills.values()];
}
