import { resultDescription } from "/result-description.js";

/**
 * The search page, in the reader's browser.
 *
 * Everything it needs is already in the page: the scope, the languages its bundles cover, the words for
 * every code, and the markup of a result as a template the server rendered. This file only fills things
 * in. If it never runs, the page is still the complete list of what is in scope — which is why the field
 * and the filters start hidden and are revealed once the index has answered, while the list under them is
 * part of the page from the start.
 *
 * Results arrive one page at a time. Twenty rows is a result a reader can read to the end; a hundred and
 * thirty is the catalogue again, and scrolling it tells nobody where they are in it. The line above the
 * list says which of them are on screen, and the pages below it are buttons rather than an endless scroll.
 *
 * The URL is kept in step with every change, so any view of a search can be shared or kept. The route
 * fixes the scope and the query string can only narrow it: `search-scope.js` owns that rule, and the same
 * file was read when the page was built.
 */
import { resourcePlace } from "/resource-place.js";
import { createEngine } from "/search-engine.js";
import { effectiveFilters, facetsOf, queryFromState, scopeFromPath, stateFromQuery } from "/search-scope.js";

/** One page of results. Twenty is what a reader can read to the end before deciding to look further. */
const PAGE = 20;

const form = document.querySelector("[data-search]");
const state = document.querySelector("[data-state]");
const resultsList = document.querySelector("[data-results-list]");
const everything = document.querySelector("[data-everything]");
const askBlock = document.querySelector("[data-field]");
const filterBlock = document.querySelector("[data-filters]");
const template = document.querySelector("template[data-result]");

if (form && state && resultsList && everything && template && askBlock && filterBlock) {
  const words = JSON.parse(form.dataset.strings);
  const labels = JSON.parse(form.dataset.labels);
  const languages = JSON.parse(form.dataset.languages);
  const inherits = JSON.parse(form.dataset.inherits ?? "[]");
  const scope = scopeFromPath("/", location.pathname) ?? { country: null };
  const field = form.querySelector("input[type=search]");

  const heading = document.querySelector("#results");
  const summary = document.querySelector("[data-summary]");
  const hint = document.querySelector("[data-hint]");
  const active = document.querySelector("[data-active]");
  const chipTemplate = document.querySelector("template[data-chip]");
  const pagination = document.querySelector("[data-pagination]");
  const progress = document.querySelector("[data-progress]");
  const pages = document.querySelector("[data-pages]");
  const fallback = document.querySelector("[data-search-fallback]");
  const recovery = document.querySelector("[data-recovery]");
  const reset = document.querySelector("[data-reset]");
  const clearQuery = document.querySelector("[data-clear-query]");
  const chosenRow = document.querySelector("[data-chosen]");
  const clearFilters = document.querySelector("[data-clear-filters]");
  const showResults = document.querySelector("[data-show-results]");
  const panel = document.querySelector("#narrow-panel");

  const counted = (howMany, forms) => `${howMany} ${forms[howMany === 1 ? 0 : 1]}`;
  const found = (howMany) => counted(howMany, words.result);
  const show = (element, visible) => {
    if (element) element.hidden = !visible;
  };
  const labelOf = (facet, value) => labels.options?.[facet]?.[value] ?? value;

  /** What the reader has chosen, read from the form rather than remembered. */
  function chosen() {
    const selected = {};
    for (const facet of facetsOf(scope.country)) {
      const values = [...form.querySelectorAll(`input[name="${facet}"]:checked`)].map((box) => box.value);
      if (values.length > 0) selected[facet] = values;
    }
    return selected;
  }

  function fill(result, term) {
    const row = template.content.firstElementChild.cloneNode(true);
    const link = row.querySelector("[data-result-link]");
    link.href = result.url;
    link.textContent = result.meta.title ?? result.url;

    const kind = row.querySelector("[data-result-kind]");
    const code = result.meta.kind;
    kind.dataset.kind = code;
    const icon = document.querySelector(`template[data-icon-for="${code}"]`);
    if (icon) kind.append(icon.content.cloneNode(true));
    kind.append(labelOf("kind", code));

    const status = row.querySelector("[data-result-status]");
    status.dataset.status = result.meta.status;
    status.textContent = labelOf("status", result.meta.status);

    row.querySelector("[data-result-operator]").textContent = result.meta.operator ?? "";
    row.querySelector("[data-result-territory]").textContent = resourcePlace(
      result.meta.territory ?? "",
      result.meta.area,
      words.area,
      words.separator,
    );
    // The place and the body that runs it carry the same icons here as on every other list of records.
    for (const which of ["territory", "operator"]) {
      const slot = row.querySelector(`[data-result-${which}-icon]`);
      const drawing = document.querySelector(`template[data-icon-for="__${which}"]`);
      if (slot && drawing) slot.append(drawing.content.cloneNode(true));
    }
    // Browsing starts with what the record offers. A text query keeps the contextual match excerpt;
    // only that excerpt is marked HTML from this build's index. Summary metadata is always plain text.
    const description = resultDescription(result, term);
    const excerpt = row.querySelector("[data-result-excerpt]");
    if (description.format === "html") excerpt.innerHTML = description.value;
    else excerpt.textContent = description.value;
    return row;
  }

  /**
   * The counts beside each option, which are the counts of what this query actually found.
   *
   * Only the facet checkboxes. The form holds one other named control, the query field, and it has no
   * counts of its own: reached by this loop it would be read as an option that answers with nothing and
   * disabled, which is to say the search would switch its own search box off as soon as it could search.
   */
  function recount(counts) {
    for (const box of form.querySelectorAll("input[type=checkbox][name]")) {
      const label = box.closest("label");
      const beside = label?.querySelector("[data-count]");
      const howMany = counts[box.name]?.[box.value] ?? 0;
      if (beside) beside.textContent = String(howMany);
      // An option that would answer with nothing cannot be chosen — unless it is the one already chosen,
      // which a reader has to be able to untick.
      label?.toggleAttribute("data-empty", howMany === 0);
      box.disabled = howMany === 0 && !box.checked;
    }
  }

  /** The chosen filters, as chips that remove themselves: the one place a reader sees all of them. */
  function renderChips(selected) {
    if (!active || !chipTemplate) return;
    active.replaceChildren();
    for (const [facet, values] of Object.entries(selected)) {
      for (const value of values) {
        const name = `${labels.titles?.[facet] ?? facet}: ${labelOf(facet, value)}`;
        const chip = chipTemplate.content.firstElementChild.cloneNode(true);
        chip.setAttribute("aria-label", `${words.remove}: ${name}`);
        chip.querySelector("[data-chip-label]").textContent = name;
        chip.addEventListener("click", () => {
          const box = form.querySelector(`input[name="${facet}"][value="${CSS.escape(value)}"]`);
          if (box) box.checked = false;
          void run().then(() => (active.querySelector("button") ?? field).focus());
        });
        active.append(chip);
      }
    }
    show(active, active.children.length > 0);
    show(chosenRow, active.children.length > 0);
  }

  let engine;
  let latest = 0;
  let hits = [];
  let hitsTerm = "";
  let page = 1;

  const totalPages = () => Math.max(1, Math.ceil(hits.length / PAGE));

  /** The current page, the first, the last, and a gap where the numbers between them were. */
  function pageNumbers(current, total) {
    const kept = [1, total, current, current - 1, current + 1].filter((number) => number >= 1 && number <= total);
    const sorted = [...new Set(kept)].toSorted((a, b) => a - b);
    const out = [];
    let previous = 0;
    for (const number of sorted) {
      if (previous && number - previous > 1) out.push(null);
      out.push(number);
      previous = number;
    }
    return out;
  }

  function renderPagination() {
    show(pagination, hits.length > 0);
    if (hits.length === 0) return;
    const total = totalPages();
    const from = (page - 1) * PAGE + 1;
    const to = Math.min(page * PAGE, hits.length);
    if (progress) progress.textContent = total > 1 ? words.pageOf.replace("{page}", page).replace("{total}", total) : "";
    state.textContent =
      total > 1 ? words.range.replace("{from}", from).replace("{to}", to).replace("{count}", found(hits.length)) : found(hits.length);

    if (!pages) return;
    pages.replaceChildren();
    if (total <= 1) return;
    const button = (text, target, { current = false, disabled = false, name } = {}) => {
      const item = document.createElement("li");
      const control = document.createElement("button");
      control.type = "button";
      control.textContent = text;
      control.className = current
        ? "flex size-(--spacing-target) items-center justify-center rounded-md border border-brand bg-brand font-bold text-on-brand"
        : "flex size-(--spacing-target) items-center justify-center rounded-md border border-line-strong text-ink hover:border-brand disabled:opacity-40";
      if (name) control.setAttribute("aria-label", name);
      if (current) control.setAttribute("aria-current", "page");
      control.disabled = disabled;
      if (!current && !disabled) control.addEventListener("click", () => void renderPage(target, { move: true }));
      item.append(control);
      pages.append(item);
    };
    button("‹", page - 1, { disabled: page <= 1, name: words.previous });
    for (const number of pageNumbers(page, total)) {
      if (number === null) {
        const item = document.createElement("li");
        const gap = document.createElement("span");
        gap.textContent = "…";
        gap.className = "px-2 text-muted";
        gap.setAttribute("aria-hidden", "true");
        item.append(gap);
        pages.append(item);
      } else {
        button(String(number), number, { current: number === page, name: words.pageLabel.replace("{n}", number) });
      }
    }
    button("›", page + 1, { disabled: page >= total, name: words.next });
  }

  async function renderPage(target, { move = false } = {}) {
    const mine = latest;
    page = Math.min(Math.max(1, target), totalPages());
    resultsList.setAttribute("aria-busy", "true");
    const offset = (page - 1) * PAGE;
    const shown = await Promise.all(hits.slice(offset, offset + PAGE).map((hit) => hit.data()));
    if (mine !== latest) return;
    resultsList.replaceChildren(...shown.map((hit) => fill(hit, hitsTerm)));
    resultsList.setAttribute("aria-busy", "false");
    renderPagination();
    if (move && heading) {
      heading.scrollIntoView({ block: "start", behavior: "smooth" });
      heading.focus({ preventScroll: true });
    }
  }

  async function run({ push = true } = {}) {
    const term = field.value.trim();
    const selected = chosen();
    const mine = (latest += 1);

    if (push) {
      history.replaceState(null, "", `${location.pathname}${queryFromState({ q: term, selected }, scope.country)}`);
    }
    show(recovery, false);
    renderChips(selected);

    const filters = effectiveFilters(selected, scope.country, inherits);
    show(state, true);
    state.textContent = words.loading;
    const { results, counts } = await engine.query(term, filters, Object.keys(selected));
    if (mine !== latest) return; // A later keystroke already answered; this one is history.

    recount(counts);
    hits = results;
    hitsTerm = term;

    const howMany = Object.values(selected).reduce((total, values) => total + values.length, 0);
    const narrowed = term !== "" || howMany > 0;
    // Once the index has answered, the list of everything is what the results are: it stays in the page
    // for a reader who never got this far.
    show(everything, false);
    show(fallback, false);
    show(reset, narrowed);
    show(hint, !narrowed);
    show(clearQuery, field.value !== "");
    if (summary) {
      summary.textContent = term
        ? // A function, so a "$&" typed in the box is shown as typed rather than as a replacement pattern.
          words.resultsFor.replace("{count}", found(hits.length)).replace("{q}", () => term)
        : howMany > 0
          ? words.filtered.replace("{count}", found(hits.length))
          : summary.dataset.default;
    }
    const filterCount = document.querySelector("[data-filter-count]");
    if (filterCount) filterCount.textContent = howMany > 0 ? ` (${howMany})` : "";
    for (const element of form.querySelectorAll("[data-group-count]")) {
      const here = selected[element.dataset.groupCount]?.length ?? 0;
      element.textContent = here > 0 ? ` (${here})` : "";
    }
    if (showResults) showResults.textContent = words.showResults.replace("{count}", found(hits.length));

    state.toggleAttribute("data-empty", hits.length === 0);
    if (hits.length === 0) {
      state.textContent = words.nothing;
      resultsList.replaceChildren();
      show(pagination, false);
      return;
    }
    await renderPage(1);
  }

  /** The index is the one part of this page that can fail: say so, and offer the way on. */
  function failed() {
    show(state, true);
    show(everything, true);
    show(fallback, true);
    state.textContent = words.failed;
    state.toggleAttribute("data-empty", true);
    show(recovery, true);
    show(pagination, false);
    resultsList.replaceChildren();
    resultsList.setAttribute("aria-busy", "false");
  }

  const safely = () => run().catch(failed);

  let pending;
  const soon = () => {
    clearTimeout(pending);
    pending = setTimeout(safely, 150);
  };

  async function start() {
    try {
      engine = await createEngine({ bundles: "/pagefind/", languages });
    } catch {
      // The list is already on the page, so the honest thing is to say what is missing and leave it alone.
      failed();
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
    // On a narrow screen the filters fold away under the box, and each group inside them folds too, so
    // the results are not pushed below a hundred checkboxes; a wide screen opens the panel again.
    const narrow = matchMedia("(max-width: 1023px)");
    if (panel) {
      panel.open = !narrow.matches;
      if (narrow.matches) for (const group of panel.querySelectorAll("[data-group]")) group.open = false;
      narrow.addEventListener("change", (event) => (panel.open = !event.matches));
    }

    // A group holding a choice opens itself, so a shared search never hides what it was filtered by.
    for (const box of form.querySelectorAll("input[type=checkbox]:checked")) {
      for (let group = box.closest("[data-group]"); group; group = group.parentElement?.closest("[data-group]")) {
        group.setAttribute("open", "");
      }
    }

    show(askBlock, true);
    show(filterBlock, true);
    await safely();

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      clearTimeout(pending);
      void safely();
    });
    field.addEventListener("input", () => {
      show(clearQuery, field.value !== "");
      soon();
    });
    form.addEventListener("change", () => void safely());
    form.addEventListener("reset", () => {
      clearTimeout(pending);
      setTimeout(safely, 0);
    });
    // The box's own clear button empties the words and keeps the filters; "clear filters" does the
    // opposite; the reset above the results clears both.
    clearQuery?.addEventListener("click", () => {
      field.value = "";
      field.focus();
      void safely();
    });
    clearFilters?.addEventListener("click", () => {
      for (const box of form.querySelectorAll("input[type=checkbox]")) box.checked = false;
      void safely();
    });
    // On a phone the filters sit above the results: this closes them and takes the reader down to them.
    showResults?.addEventListener("click", () => {
      if (panel) panel.open = false;
      heading?.focus();
    });
    document.querySelector("[data-retry]")?.addEventListener("click", () => location.reload());
  }

  void start();
}
