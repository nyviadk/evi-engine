/**
 * onMouseDown for klikbar tekst (accordion-titler, afkrydsnings-labels): stopper
 * browserens ordmarkering ved dobbelt-/trippelklik, der ellers blinker, når man
 * klikker hurtigt. Kun ved `detail > 1`, så enkeltklik og træk-markering virker
 * som normalt, og teksten stadig kan kopieres.
 */
export function prevent_double_click_select(event: React.MouseEvent): void {
  if (event.detail > 1) event.preventDefault();
}

/**
 * onClick på en `<label>` eller `<summary>`: har man lige trukket for at
 * markere teksten (for at kopiere), skal klikket ikke også krydse af eller
 * åbne/lukke. Tastaturklik (`detail === 0`) og klik på selve feltet røres
 * ikke, så en gammel markering aldrig blokerer Enter/mellemrum.
 */
export function ignore_click_after_text_select(
  event: React.MouseEvent<HTMLElement>,
): void {
  if (event.detail === 0 || event.target instanceof HTMLInputElement) return;
  const selection = window.getSelection();
  if (
    selection &&
    !selection.isCollapsed &&
    event.currentTarget.contains(selection.anchorNode)
  ) {
    event.preventDefault();
  }
}
