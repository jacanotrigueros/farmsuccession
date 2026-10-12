/**
 * Narrowing the records of a page where they already are.
 *
 * Everything this page lists is in it before anything runs, and every kind it offers is a kind something
 * on the page actually is. Choosing one hides the cards that are not it, in every list on the page at
 * once — what this territory recorded and what reaches it from a wider layer — and a list that empties
 * goes with it, because an empty heading answers nothing.
 *
 * The control starts hidden and is revealed here, for the same reason the search field is: a select that
 * cannot narrow anything is worse than no select. Without this file the page is the whole answer, and
 * the search page, which can narrow the whole catalogue, is a link away.
 */
const bar = document.querySelector("[data-filter]");
const choice = bar?.querySelector("select");

if (bar && choice) {
  const cards = [...document.querySelectorAll("[data-records] > [data-kind]")];
  const groups = [...document.querySelectorAll("[data-record-group]")];

  const narrow = () => {
    const kind = choice.value;
    for (const card of cards) card.hidden = kind !== "" && card.dataset.kind !== kind;
    for (const group of groups) {
      const inside = [...group.querySelectorAll("[data-records] > [data-kind]")];
      group.hidden = inside.length > 0 && inside.every((card) => card.hidden);
    }
  };

  choice.addEventListener("change", narrow);
  bar.hidden = false;
  narrow();
}
