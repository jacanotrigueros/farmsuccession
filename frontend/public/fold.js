/**
 * Following a link to a folded section opens it.
 *
 * Every section folds from its own heading, and the links under a page's title lead to those headings. A
 * native <details> that a reader closed stays closed when a link scrolls to it, so the link arrived at a
 * heading with nothing under it (Sol, 28 Nov 2026). This opens every fold around the target and moves the
 * focus to the heading's control, so the keyboard continues from where the link led. Without JavaScript
 * every section is open from the start and the links work as they always did.
 */

/**
 * Opens the folds around a target and says what should take the focus: the fold's own control when the
 * target is its heading, otherwise nothing.
 * @param {{ closest(selector: string): any } | null} target
 * @returns {{ focus(options?: { preventScroll?: boolean }): void } | null}
 */
export function revealTarget(target) {
  if (!target) return null;
  for (let fold = target.closest("details"); fold; fold = fold.parentElement?.closest("details") ?? null) fold.open = true;
  return target.closest("summary");
}

if (typeof document !== "undefined") {
  /** @param {string} hash @param {boolean} focus */
  const follow = (hash, focus) => {
    if (!hash || hash.length < 2) return;
    const control = revealTarget(document.getElementById(decodeURIComponent(hash.slice(1))));
    if (focus && control) requestAnimationFrame(() => control.focus({ preventScroll: true }));
  };
  document.addEventListener("click", (event) => {
    const link = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
    if (link) follow(link.getAttribute("href") ?? "", true);
  });
  window.addEventListener("hashchange", () => follow(location.hash, true));
  follow(location.hash, false);
}
