/**
 * Narrowing the records of a page where they already are.
 *
 * The strip under the title is a row of links, one per kind, each leading to the search for that kind:
 * that is what it does with no script, and what it falls back to if this file never arrives. Here it
 * stops being a journey. Choosing a kind hides the cards that are not it, in every list on the page at
 * once — what this territory recorded and what reaches it from a wider layer — and a list that empties
 * goes with it, because an empty heading answers nothing.
 */
const strip = document.querySelector("[data-filter]");
const pills = strip ? [...strip.querySelectorAll("[data-kind-pill]")] : [];

if (strip && pills.length > 0) {
  const cards = [...document.querySelectorAll("[data-records] > [data-kind]")];
  const groups = [...document.querySelectorAll("[data-record-group]")];

  const narrow = (kind) => {
    for (const card of cards) card.hidden = kind !== "" && card.dataset.kind !== kind;
    for (const group of groups) {
      const inside = [...group.querySelectorAll("[data-records] > [data-kind]")];
      group.hidden = inside.length > 0 && inside.every((card) => card.hidden);
    }
    for (const pill of pills) {
      if (pill.dataset.kindPill === kind) pill.setAttribute("aria-current", "true");
      else pill.removeAttribute("aria-current");
    }
  };

  for (const pill of pills) {
    pill.addEventListener("click", (event) => {
      // A reader who asks for the link itself — a new tab, a saved address — gets the search it points at.
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
      event.preventDefault();
      narrow(pill.dataset.kindPill ?? "");
    });
  }
}
