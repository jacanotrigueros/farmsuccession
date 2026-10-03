/**
 * The one piece of JavaScript this site ships, and the only thing it is allowed to do: filter a list that
 * is already on the page.
 *
 * It is written here rather than in `src/`, so it is served exactly as it reads — no bundler, no transform,
 * nothing a reader would have to take on trust. If it never runs, the search page is still complete: every
 * record in scope is in the HTML, which is why the field starts hidden and is only revealed once the index
 * has answered. A field that cannot search is worse than no field.
 *
 * It sets no cookie, stores nothing, and asks no host but this one.
 */

const form = document.querySelector("[data-search]");
const state = document.querySelector("[data-state]");
const results = document.querySelector("[data-results]");
const resultsHeading = document.querySelector("[data-results-heading]");
const resultsList = document.querySelector("[data-results-list]");
const everything = document.querySelector("[data-everything]");

if (form && state && results && resultsHeading && resultsList && everything) {
  const words = JSON.parse(form.dataset.strings);
  const scope = JSON.parse(form.dataset.scope);
  const field = form.querySelector("input[type=search]");

  /** How many of a thing, with its noun in the form the language gives it. */
  const counted = (howMany, forms) => `${howMany} ${forms[howMany === 1 ? 0 : 1]}`;

  const show = (element, visible) => {
    element.hidden = !visible;
  };

  /** The filters a query carries: the layers this territory inherits, and whatever the reader ticked. */
  function filters() {
    const situations = [...form.querySelectorAll("input[name=situation]:checked")].map((box) => box.value);
    // "any", not a bare list: a list means every value at once, and a record is recorded at one layer,
    // so asking for three layers as a list asks for a record that is in all three and finds nothing.
    return {
      ...(scope.length > 0 ? { recordedAt: { any: scope } } : {}),
      ...(situations.length > 0 ? { situation: { any: situations } } : {}),
    };
  }

  function render(found) {
    resultsList.replaceChildren(
      ...found.map((result) => {
        const row = document.createElement("article");
        row.className = "border-t border-line py-5 first:border-t-0";

        const title = document.createElement("h3");
        title.className = "text-lead font-semibold";
        const link = document.createElement("a");
        link.href = result.url;
        link.className = "inline-flex min-h-tap items-center";
        link.textContent = result.meta.title ?? result.url;
        title.append(link);

        const where = document.createElement("p");
        where.className = "mt-1 text-meta text-ink-soft";
        where.textContent = [result.meta.kind, result.meta.operator, result.meta.territory].filter(Boolean).join(" · ");

        const summary = document.createElement("p");
        summary.className = "mt-2 max-w-measure";
        // The excerpt is this site's own text, taken from the page the result points at, with the words
        // that matched marked. It is the one place markup is set rather than written, and it comes from
        // the index this build produced.
        summary.innerHTML = result.excerpt;

        row.append(title, where, summary);
        return row;
      }),
    );
  }

  /** The counts beside each filter, which are the counts of what the current query actually found. */
  function recount(counts) {
    for (const element of form.querySelectorAll("[data-count]")) {
      const found = counts?.situation?.[element.dataset.count];
      element.textContent = String(found ?? 0);
    }
  }

  let pagefind;
  let latest = 0;

  async function run() {
    const query = field.value.trim();
    const mine = (latest += 1);

    if (query === "") {
      show(results, false);
      show(everything, true);
      show(state, false);
      const all = await pagefind.filters();
      recount(all);
      return;
    }

    const search = await pagefind.search(query, { filters: filters() });
    if (mine !== latest) return; // A later keystroke already answered; this one is history.

    const found = await Promise.all(search.results.slice(0, 50).map((result) => result.data()));
    recount(search.filters);

    if (found.length === 0) {
      show(results, false);
      show(everything, true);
      state.textContent = words.nothing;
      show(state, true);
      return;
    }

    resultsHeading.textContent = counted(search.results.length, [words.one, words.many]);
    render(found);
    show(results, true);
    show(everything, false);
    show(state, false);
  }

  let pending;
  const soon = () => {
    clearTimeout(pending);
    pending = setTimeout(() => void run(), 150);
  };

  async function start() {
    try {
      // One index per language, each holding the whole catalogue: a Spanish page searching only the
      // Spanish index would never reach the European layer, which is written in English.
      pagefind = await import(`/pagefind/${form.dataset.language}/pagefind.js`);
      await pagefind.init();
    } catch {
      // The list is already on the page, so the honest thing is to say what is missing and leave it alone.
      state.textContent = words.failed;
      show(state, true);
      return;
    }

    show(form, true);
    recount(await pagefind.filters());

    form.addEventListener("submit", (event) => event.preventDefault());
    field.addEventListener("input", soon);
    form.addEventListener("change", () => void run());
    form.addEventListener("reset", () => setTimeout(() => void run(), 0));
  }

  void start();
}
