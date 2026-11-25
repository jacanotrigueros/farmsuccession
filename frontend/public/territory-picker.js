/** Close the native picker from its summary or from any focused option inside it.
 * @param {{ key: string, preventDefault(): void }} event
 * @param {{ open: boolean, querySelector(selector: string): { focus(): void } | null }} picker
 */
export function dismissTerritoryPicker(event, picker) {
  if (event.key !== "Escape" || !picker.open) return;
  event.preventDefault();
  picker.open = false;
  picker.querySelector("summary")?.focus();
}

if (typeof document !== "undefined") {
  const picker = document.querySelector("details.territory-picker");
  if (picker instanceof HTMLDetailsElement) {
    picker.addEventListener("keydown", (event) => dismissTerritoryPicker(event, picker));
  }
}
