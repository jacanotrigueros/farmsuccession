/**
 * Turn a public correction/suggestion form into an ordinary email draft.
 *
 * There is deliberately no network request here. FarmSuccession is served by GitHub Pages and promises
 * that reading it never tells a third party that the reader was here. A serverless form service would
 * break that promise; a repository credential cannot safely live in a public bundle. The user's own mail client is
 * therefore the transport, and GitHub can remain the maintainer's internal editorial queue afterwards.
 */
const params = new URLSearchParams(window.location.search);
const context = {
  territory: params.get("territory") ?? "",
  record: params.get("record") ?? "",
  from: params.get("from") ?? "",
};

let hasContext = false;
for (const [key, value] of Object.entries(context)) {
  if (!value) continue;
  hasContext = true;
  for (const node of document.querySelectorAll(`[data-context-value="${key}"]`)) node.textContent = value;
  for (const row of document.querySelectorAll(`[data-context-row="${key}"]`)) row.hidden = false;
  for (const input of document.querySelectorAll(`[data-context-input="${key}"]`)) input.value = value;
}
const contextBox = document.querySelector("[data-report-context]");
if (contextBox && hasContext) contextBox.classList.remove("hidden");

const requested = params.get("type");
if (requested === "missing" || requested === "correction") {
  for (const section of document.querySelectorAll("[data-report-section]")) {
    if (section.dataset.reportSection !== requested) section.hidden = true;
  }
  document.querySelector(`[data-report-section="${requested}"]`)?.scrollIntoView();
}

for (const form of document.querySelectorAll("form[data-report]")) {
  form.addEventListener("submit", (event) => {
    if (!form.reportValidity()) return;
    event.preventDefault();

    const lines = [];
    const fields = form.querySelectorAll("input[name], textarea[name], select[name]");
    for (const field of fields) {
      if (!field.value) continue;
      const label = field.dataset.mailLabel ?? field.name;
      const value = field instanceof HTMLSelectElement ? (field.options[field.selectedIndex]?.text ?? field.value) : field.value;
      lines.push(`${label}: ${value}`);
    }

    const subject = form.dataset.subject ?? "FarmSuccession";
    window.location.href =
      "mailto:contact@farmsuccession.eu?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines.join("\n\n"));
  });
}
