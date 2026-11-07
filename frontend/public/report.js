/**
 * Prefill report context without requests. Native POST forms keep browser validation and provider
 * confirmation/errors. Unconfigured builds prepare a copyable draft. No background delivery or secret.
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

// What a reader who found nothing was looking for, carried from the search that found nothing, so
// nobody is asked to type the same words twice. It fills a field they can see and edit before anything
// is sent, which is the only reason it is safe to carry at all.
const looking = params.get("looking");
if (looking) for (const field of document.querySelectorAll('[data-prefill="looking"]')) field.value = looking;

const kinds = ["missing", "correction", "looking", "removal"];
const requested = kinds.includes(params.get("type")) ? params.get("type") : "missing";
for (const section of document.querySelectorAll("[data-report-section]")) {
  if (section.dataset.reportSection !== requested) section.hidden = true;
}
for (const link of document.querySelectorAll("[data-report-choice]")) {
  const query = new URLSearchParams(params);
  query.set("type", link.dataset.reportChoice);
  link.search = "?" + query;
  if (link.dataset.reportChoice === requested) link.setAttribute("aria-current", "true");
}

for (const form of document.querySelectorAll("form[data-report]")) {
  if (form.dataset.reportTransport === "post") continue;
  const draft = form.querySelector("[data-mail-draft]");
  // A changed answer invalidates the prepared draft, so a stale message cannot be opened accidentally.
  form.addEventListener("input", (event) => {
    if (draft && !draft.contains(event.target)) draft.hidden = true;
  });
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
    const message = lines.join("\n\n");
    const preview = form.querySelector("[data-mail-preview]");
    const openMail = form.querySelector("[data-open-mail]");
    if (!draft || !preview || !openMail) return;
    preview.value = subject + "\n\n" + message;
    openMail.href = "mailto:contact@farmsuccession.eu?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(message);
    draft.hidden = false;
    preview.focus();
    preview.select();
  });
}
