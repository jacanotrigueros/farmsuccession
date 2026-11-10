/**
 * Prefill report context without requests. Native POST forms keep browser validation and provider
 * confirmation/errors. Only the validation message is localized to the page language.
 * Unconfigured builds prepare a copyable draft. No background delivery or secret.
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

const kinds = ["missing", "correction", "looking", "feedback", "removal"];
const requested = kinds.includes(params.get("type")) ? params.get("type") : "missing";

for (const form of document.querySelectorAll("form[data-report]")) {
  // Native browser validation normally uses the reader's browser language rather than the page
  // language. Keep required/type=url and native POST; replace only the built-in error sentence.
  form.addEventListener(
    "invalid",
    (event) => {
      const field = event.target;
      if (typeof field?.setCustomValidity !== "function") return;
      if (field.validity?.valueMissing) field.setCustomValidity(form.dataset.validationRequired);
      else if (field.validity?.typeMismatch) field.setCustomValidity(form.dataset.validationUrl);
    },
    true,
  );
  const clearValidation = (event) => {
    if (typeof event.target?.setCustomValidity === "function") event.target.setCustomValidity("");
  };
  form.addEventListener("input", clearValidation);
  form.addEventListener("change", clearValidation);

  const reason = form.querySelector("[data-report-kind]");
  if (reason) {
    reason.value = requested;
    const updateReason = () => {
      const kind = reason.value;
      form.dataset.kind = kind;
      form.dataset.subject = reason.options[reason.selectedIndex]?.dataset.subject ?? "FarmSuccession";
      const subject = form.querySelector('[name="_subject"]');
      if (subject) subject.value = form.dataset.subject;
      const option = reason.options[reason.selectedIndex];
      const label = form.querySelector("[data-report-detail-label]");
      const hint = form.querySelector("[data-report-detail-hint]");
      const detail = form.querySelector('[name="detail"]');
      if (label) label.textContent = option.dataset.detailLabel;
      if (hint) hint.textContent = option.dataset.detailHint;
      if (detail) detail.dataset.mailLabel = option.dataset.detailLabel;
      const source = form.querySelector("[data-report-source]");
      if (source) source.required = kind === "missing" || kind === "removal";
      const verification = form.querySelector("[data-removal-review]");
      if (verification) verification.hidden = kind !== "removal";
      for (const group of form.querySelectorAll("[data-report-only]")) {
        group.hidden = !group.dataset.reportOnly.split(" ").includes(kind);
        for (const field of group.querySelectorAll("input, select, textarea")) field.disabled = group.hidden;
      }
      const preview = form.querySelector("[data-mail-draft]");
      if (preview) preview.hidden = true;
    };
    updateReason();
    reason.addEventListener("change", updateReason);
  }
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
      if (!field.value || field.disabled) continue;
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
