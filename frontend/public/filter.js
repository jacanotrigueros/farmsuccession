/**
 * Narrowing the records of a page where they already are.
 *
 * Everything this page lists is in it before anything runs, and every kind it offers is a kind something
 * on the page actually is. Choosing one hides the cards that are not it, in every list on the page at
 * once — what this territory recorded and what reaches it from a wider layer.
 *
 * Nothing is left behind pointing at records that are no longer there. A layer whose cards have all gone
 * goes with them, a section with nothing left in it goes too and so does its link in the strip under the
 * title, and every figure beside a list is rewritten with the list. A heading that says twelve records
 * above three cards is worse than no heading: the reader is left to work out which of the two the page
 * means. Each figure carries the two sentences it can be, one record or several, so what is written stays
 * a sentence in its own language instead of a digit swapped inside one that no longer agrees with itself.
 *
 * The control starts hidden and is revealed here: a select that cannot narrow anything is worse than no
 * select. Without this file the page is the whole answer, and the search, which can narrow the whole
 * catalogue, is a link away from every kind in the block above it.
 */
const bar = document.querySelector("[data-filter]");
const choice = bar?.querySelector("select");

if (bar && choice) {
  const cards = [...document.querySelectorAll("[data-records] > [data-kind]")];
  const groups = [...document.querySelectorAll("[data-record-group]")];
  const figures = [...document.querySelectorAll("[data-figure]")];
  const nothing = document.querySelector("[data-none]");
  const sections = [...document.querySelectorAll("section")].filter((section) => section.querySelector("[data-records]"));

  /** How many records are showing inside something: a layer, a section, or the page. */
  const shown = (root) => [...root.querySelectorAll("[data-records] > [data-kind]")].filter((card) => !card.hidden).length;

  const narrow = () => {
    const kind = choice.value;
    for (const card of cards) card.hidden = kind !== "" && card.dataset.kind !== kind;
    for (const group of groups) group.hidden = shown(group) === 0;
    for (const section of sections) {
      // The section the control sits in always stays: it is where a reader undoes the choice.
      const empty = shown(section) === 0 && !section.contains(choice);
      section.hidden = empty;
      const heading = section.getAttribute("aria-labelledby");
      for (const link of document.querySelectorAll(`a[href="#${heading}"]`)) link.hidden = empty;
    }
    // The section that keeps the control keeps its heading too, so it says what became of its records.
    if (nothing) nothing.hidden = shown(nothing.closest("section")) > 0;
    for (const figure of figures) {
      const howMany = shown(figure.closest("[data-record-group]") ?? figure.closest("section"));
      figure.textContent = (howMany === 1 ? figure.dataset.one : figure.dataset.many).replace("{n}", String(howMany));
      // A sentence that explains a list has nothing to explain while the list is empty.
      if (figure.tagName === "P") figure.hidden = howMany === 0;
    }
  };

  choice.addEventListener("change", narrow);
  bar.hidden = false;
  // A reader who comes back to the page finds the browser's restored choice already applied.
  narrow();
}
