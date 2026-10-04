/**
 * The search page, in the reader's browser.
 *
 * Everything it needs is already in the page: the scope, the languages its bundles cover, the words for
 * every code, and the markup of a result as a template the server rendered. This file only fills things
 * in. If it never runs, the page is still the complete list of what is in scope — which is why the field
 * and the filters start hidden and are revealed once the index has answered.
 *
 * The URL is kept in step with every change, so any view of a search can be shared or kept. The route
 * fixes the scope and the query string can only narrow it: `search-scope.js` owns that rule, and the same
 * file was read when the page was built.
 */
import { createEngine } from "/search-engine.js";
import { effectiveFilters, facetsOf, queryFromState, scopeFromPath, stateFromQuery } from "/search-scope.js";

const form = document.querySelector("[data-search]");
const state = document.querySelector("[data-state]");
const results = document.querySelector("[data-results]");
const resultsHeading = document.querySelector("[data-results-heading]");
const resultsList = document.querySelector("[data-results-list]");
const everything = document.querySelector("[data-everything]");
const template = document.querySelector("template[data-result]");

if (form && state && results && resultsHeading && resultsList && everything && template) {
  const words = JSON.parse(form.dataset.strings);
  const labels = JSON.parse(form.dataset.labels);
  const languages = JSON.parse(form.dataset.languages);
  const inherits = JSON.parse(form.dataset.inherits ?? "[]");
  const scope = scopeFromPath("/", location.pathname) ?? { country: null };
  const field = form.querySelector("input[type=search]");

  const counted = (howMany, forms) => `${howMany} ${forms[howMany === 1 ? 0 : 1]}`;
  const show = (element, visible) => {
    element.hidden = !visible;
  };

  /** What the reader has chosen, read from the form rather than remembered. */
  function chosen() {
    const selected = {};
    for (const facet of facetsOf(scope.country)) {
      const values = [...form.querySelectorAll(`input[name="${facet}"]:checked`)].map((box) => box.value);
      if (values.length > 0) selected[facet] = values;
    }
    return selected;
  }

  function fill(result) {
    const row = template.content.firstElementChild.cloneNode(true);
    const link = row.querySelector("[data-result-link]");
    link.href = result.url;
    link.textContent = result.meta.title ?? result.url;

    const kind = row.querySelector("[data-result-kind]");
    const code = result.meta.kind;
    kind.dataset.kind = code;
    const icon = document.querySelector(`template[data-icon-for="${code}"]`);
    if (icon) kind.append(icon.content.cloneNode(true));
    kind.append(labels.kind?.[code] ?? code);

    const status = row.querySelector("[data-result-status]");
    status.dataset.status = result.meta.status;
    status.textContent = labels.status?.[result.meta.status] ?? result.meta.status;

    row.querySelector("[data-result-operator]").textContent = result.meta.operator ?? "";
    row.querySelector("[data-result-territory]").textContent = result.meta.territory ?? "";
    // The excerpt is this site's own text, taken from the page the result points at, with the words that
    // matched marked. It comes from the index this build produced and from nowhere else.
    row.querySelector("[data-result-excerpt]").innerHTML = result.excerpt;
    return row;
  }

  /** The counts beside each option, which are the counts of what this query actually found. */
  function recount(counts) {
    for (const box of form.querySelectorAll("input[name]")) {
      const beside = box.closest("label")?.querySelector("[data-count]");
      if (beside) beside.textContent = String(counts[box.name]?.[box.value] ?? 0);
    }
  }

  let engine;
  let latest = 0;

  async function run({ push = true } = {}) {
    const term = field.value.trim();
    const selected = chosen();
    const mine = (latest += 1);

    if (push) {
      history.replaceState(null, "", `${location.pathname}${queryFromState({ q: term, selected }, scope.country)}`);
    }

    const filters = effectiveFilters(selected, scope.country, inherits);
    const { results: found, counts } = await engine.query(term, filters, Object.keys(selected));
    if (mine !== latest) return; // A later keystroke already answered; this one is history.

    recount(counts);

    if (term === "" && Object.keys(selected).length === 0) {
      show(results, false);
      show(everything, true);
      show(state, false);
      return;
    }

    if (found.length === 0) {
      show(results, false);
      show(everything, true);
      state.textContent = words.nothing;
      show(state, true);
      return;
    }

    const shown = await Promise.all(found.slice(0, 50).map((result) => result.data()));
    resultsHeading.textContent = counted(found.length, [words.one, words.many]);
    resultsList.replaceChildren(...shown.map((result) => fill(result)));
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
      engine = await createEngine({ bundles: "/pagefind/", languages });
    } catch {
      // The list is already on the page, so the honest thing is to say what is missing and leave it alone.
      state.textContent = words.failed;
      show(state, true);
      return;
    }

    // Whatever the URL already asked for, before anything is typed: a shared search opens as it was
    // shared — minus whatever it asked for and could not have, which the rewrite below drops for good.
    const asked = stateFromQuery(location.search, scope.country);
    field.value = asked.q;
    for (const facet of facetsOf(scope.country)) {
      for (const value of asked.selected[facet] ?? []) {
        const box = form.querySelector(`input[name="${facet}"][value="${CSS.escape(value)}"]`);
        if (box) box.checked = true;
      }
    }

    show(form, true);
    await run();

    form.addEventListener("submit", (event) => event.preventDefault());
    field.addEventListener("input", soon);
    form.addEventListener("change", () => void run());
    form.addEventListener("reset", () => setTimeout(() => void run(), 0));
  }

  void start();
}
