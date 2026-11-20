/**
 * Sorting a table by any of its columns, where it already is.
 *
 * Every row is in the HTML before this runs, in the order the build chose, and every cell carries the
 * number or name it shows in `data-value`, so a column is sorted by what it means and not by how a locale
 * writes it. Each sortable heading becomes a button; the heading's `aria-sort` says which column orders the
 * rows and in which direction, which is what a screen reader announces. A first press sorts numbers from
 * largest to smallest and names from A to Z; the next press turns the order round. The footer, where the
 * reference row sits, never moves.
 *
 * Without this file the table is complete and stays in the order it was built in.
 */
for (const table of document.querySelectorAll("table[data-sortable]")) {
  const body = table.tBodies[0];
  const headings = [...(table.tHead?.rows[0]?.cells ?? [])];
  if (!body) continue;

  headings.forEach((heading, column) => {
    const kind = heading.dataset.sort;
    if (!kind) return;
    const button = document.createElement("button");
    button.type = "button";
    button.append(...heading.childNodes);
    heading.append(button);

    button.addEventListener("click", () => {
      const current = heading.getAttribute("aria-sort");
      const next =
        current === "descending" ? "ascending" : current === "ascending" ? "descending" : kind === "number" ? "descending" : "ascending";
      for (const other of headings) other.removeAttribute("aria-sort");
      heading.setAttribute("aria-sort", next);

      const value = (row) => row.cells[column]?.dataset.value ?? "";
      const rows = [...body.rows].sort((a, b) => {
        const order =
          kind === "number" ? Number(value(a)) - Number(value(b)) : value(a).localeCompare(value(b), document.documentElement.lang);
        return next === "descending" ? -order : order;
      });
      body.append(...rows);
    });
  });
}
