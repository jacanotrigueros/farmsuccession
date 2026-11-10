import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { reportEndpoint } from "../reporting.config.mjs";
import { SEARCH_SLUGS } from "../public/search-scope.js";
import { words } from "../src/lib/words.ts";

const DIST = path.join(import.meta.dirname, "..", "dist");
const REPOSITORY = path.join(import.meta.dirname, "..", "..");
const catalogue = JSON.parse(readFileSync(path.join(REPOSITORY, "data", "territories.json"), "utf8")) as {
  jurisdictions: Record<string, { lang: string }>;
};

const reportPages = [
  { file: path.join(DIST, words("en").reportSlug, "index.html"), language: "en" },
  ...Object.entries(catalogue.jurisdictions)
    .filter(([iso]) => iso !== "EU")
    .map(([iso, { lang }]) => ({ file: path.join(DIST, iso.toLowerCase(), words(lang).reportSlug, "index.html"), language: lang })),
];

test("every jurisdiction has one localized intake with all five reasons and no account", () => {
  assert.equal(reportPages.length, Object.keys(catalogue.jurisdictions).length);
  for (const { file, language } of reportPages) {
    const html = readFileSync(file, "utf8");
    const text = words(language);
    assert.match(html, /<meta name="robots" content="noindex, follow">/u);
    assert.ok(html.includes(text.reportTitle));
    assert.equal([...html.matchAll(/<form\b/gu)].length, 1, `${file}: duplicate forms defeat the shared intake`);
    assert.match(html, /name="kind"[^>]*required/u);
    for (const kind of ["missing", "correction", "looking", "feedback", "removal"]) assert.ok(html.includes(`<option value="${kind}"`));
    assert.match(html, /name="detail"[^>]*required/u);
    assert.ok(html.includes(`data-validation-required="${text.reportRequiredMessage}"`));
    assert.ok(html.includes(`data-validation-url="${text.reportUrlMessage}"`));
    assert.ok(html.includes(text.reportAlternativeEmail));
    assert.match(html, /name="source"[^>]*type="url"/u);
    assert.match(
      html,
      /data-report-only="missing correction removal"(?:(?!data-report-only)[\s\S])*name="source"/u,
      "someone saying a record did not help must not be asked for a URL first",
    );
    assert.match(html, /name="issue"/u);
    assert.match(html, /name="where"/u);
    assert.match(html, /data-prefill="looking"/u);
    for (const name of ["territory", "record", "from"]) assert.ok(html.includes(`name="${name}"`));
    assert.doesNotMatch(html, /name="email"|name="account"|type="file"/u);
    assert.ok(html.includes(text.reportRemovalVerification));
    assert.equal([...html.matchAll(/data-removal-review/gu)].length, 1);
    assert.match(html, /<script[^>]*src="\/report\.js"/u);
  }
});

test("the shared native transport discloses processing and preserves the working unconfigured fallback", () => {
  for (const { file, language } of reportPages) {
    const html = readFileSync(file, "utf8");
    const text = words(language);
    assert.ok(html.includes(`action="${reportEndpoint || "mailto:contact@farmsuccession.eu"}"`));
    assert.ok(html.includes(`data-report-transport="${reportEndpoint ? "post" : "email"}"`));
    assert.match(html, /method="post"/u);
    if (reportEndpoint) {
      assert.match(html, /enctype="application\/x-www-form-urlencoded"/u);
      assert.equal([...html.matchAll(/name="kind"/gu)].length, 1, "the selected reason must not compete with hidden metadata");
      assert.match(html, /name="_subject" value="[^"]+"/u);
      assert.ok(html.includes(`name="_language" value="${language === "pt" ? "pt-PT" : language}"`));
      assert.match(html, /name="_gotcha"[^>]*tabindex="-1"/u);
      assert.ok(html.includes(text.reportSend));
      assert.equal([...html.matchAll(/data-report-privacy/gu)].length, 1);
      assert.ok(html.includes(text.reportDeliveryPrivacy));
      assert.doesNotMatch(html, /data-mail-draft|name="_next"/u);
    } else {
      assert.ok(html.includes(text.reportPrepare));
      assert.match(html, /data-mail-draft/u);
      assert.doesNotMatch(html, /name="_gotcha"|name="_subject"|data-report-privacy/u);
    }
  }
});

test("the reporting enhancement has no background delivery, credential or browser storage", () => {
  const script = readFileSync(path.join(DIST, "report.js"), "utf8");
  assert.doesNotMatch(script, /fetch\(|XMLHttpRequest|github\.com|api\.github|token|localStorage|sessionStorage|document\.cookie/iu);
  assert.match(script, /mailto:contact@farmsuccession\.eu/u);
});

test("a search that found nothing offers the reader the way to say so", () => {
  const searchPages = [
    { file: path.join(DIST, "search", "index.html"), language: "en", country: "" },
    ...Object.entries(catalogue.jurisdictions)
      .filter(([iso]) => iso !== "EU")
      .map(([iso, { lang }]) => {
        const slug = SEARCH_SLUGS[iso as keyof typeof SEARCH_SLUGS];
        assert.ok(slug, `${iso} has no search slug, so this test would look for a page that cannot exist`);
        return { file: path.join(DIST, iso.toLowerCase(), slug, "index.html"), language: lang, country: `${iso.toLowerCase()}/` };
      }),
  ];
  assert.equal(
    searchPages.length,
    Object.keys(catalogue.jurisdictions).length,
    "a search page is missing for a jurisdiction of the catalogue",
  );

  for (const { file, language, country } of searchPages) {
    const html = readFileSync(file, "utf8");
    const text = words(language);
    assert.ok(html.includes(text.reportLookingForm), `${file} lets a reader who found nothing leave without a word`);
    assert.ok(
      html.includes(`href="/${country}${text.reportSlug}/?type=looking"`),
      `${file} points a reader at the wrong intake page, or at one in another language`,
    );
    assert.match(html, /<script[^>]*src="\/search\.js"/u, `${file} never loads the script that reveals the offer`);
  }
});

test("preparing a report shows a copyable draft without navigating, and an edit invalidates it", async () => {
  const { runInNewContext } = await import("node:vm");
  class Select {
    name = "issue";
    value = "broken";
    dataset = { mailLabel: "Qué ha cambiado" };
    selectedIndex = 0;
    options = [{ text: "El enlace oficial ya no funciona" }];
  }
  const detail = { name: "detail", value: "Revisar <texto> & comillas: café", dataset: { mailLabel: "Revisión" } };
  const context = { name: "from", value: "/es/recursos/example/", dataset: { mailLabel: "Página" } };
  const fields = [new Select(), detail, context];
  const preview = { value: "", focus() {}, select() {} };
  const openMail = { href: "mailto:contact@farmsuccession.eu" };
  const draft = { hidden: true, contains: (target: unknown) => target === preview };
  const listeners: Record<string, (event: { target?: unknown; preventDefault: () => void }) => void> = {};
  const form = {
    dataset: { subject: "[FarmSuccession] Corrección" },
    reportValidity: () => true,
    addEventListener: (type: string, listener: (typeof listeners)[string]) => (listeners[type] = listener),
    querySelectorAll: () => fields,
    querySelector: (selector: string) =>
      ({ "[data-mail-draft]": draft, "[data-mail-preview]": preview, "[data-open-mail]": openMail })[selector],
  };
  const location = { search: "", href: "https://farmsuccession.eu/es/avisar/" };
  runInNewContext(readFileSync(path.join(DIST, "report.js"), "utf8"), {
    window: { location },
    URLSearchParams,
    HTMLSelectElement: Select,
    document: {
      querySelector: () => null,
      querySelectorAll: (selector: string) => (selector === "form[data-report]" ? [form] : []),
    },
  });
  let prevented = false;
  listeners.submit!({ preventDefault: () => (prevented = true) });
  assert.equal(prevented, true);
  assert.equal(location.href, "https://farmsuccession.eu/es/avisar/", "preparing must not launch a mail application");
  assert.equal(draft.hidden, false);
  assert.equal(
    preview.value,
    "[FarmSuccession] Corrección\n\nQué ha cambiado: El enlace oficial ya no funciona\n\nRevisión: Revisar <texto> & comillas: café\n\nPágina: /es/recursos/example/",
  );
  const mail = new URL(openMail.href);
  assert.equal(mail.searchParams.get("subject"), form.dataset.subject);
  assert.equal(mail.searchParams.get("body"), preview.value.split("\n\n").slice(1).join("\n\n"));
  listeners.input!({ target: detail, preventDefault() {} });
  assert.equal(draft.hidden, true, "changed answers must not leave an obsolete draft available");
});

test("reason changes preserve the message, scope fields and require independent removal review without intercepting POST", async () => {
  const { runInNewContext } = await import("node:vm");
  const kinds = ["missing", "correction", "looking", "feedback", "removal"];
  const listeners: Record<string, () => void> = {};
  class Reason {
    selectedIndex = 0;
    options = kinds.map((kind) => ({ dataset: { subject: `Subject ${kind}`, detailLabel: `Label ${kind}`, detailHint: `Hint ${kind}` } }));
    get value() {
      return kinds[this.selectedIndex]!;
    }
    set value(value: string) {
      this.selectedIndex = kinds.indexOf(value);
    }
    addEventListener(type: string, listener: () => void) {
      listeners[type] = listener;
    }
  }
  const reason = new Reason();
  const subject = { value: "" };
  const source = { required: false };
  const verification = { hidden: false };
  const draft = { hidden: false };
  const detail = { value: "", dataset: { mailLabel: "" } };
  const detailLabel = { textContent: "" };
  const detailHint = { textContent: "" };
  const from = { value: "" };
  const safeText = { textContent: "" };
  const groups = ["correction", "looking", "missing correction removal"].map((kind) => ({
    dataset: { reportOnly: kind },
    hidden: false,
    field: { disabled: false },
    querySelectorAll() {
      return [this.field];
    },
  }));
  const formListeners: Record<string, (...args: unknown[]) => void> = {};
  const form = {
    dataset: { reportTransport: "post", kind: "", subject: "", validationRequired: "Obligatorio", validationUrl: "URL inválida" },
    querySelector(selector: string) {
      return (
        (
          {
            "[data-report-kind]": reason,
            "[data-report-detail-label]": detailLabel,
            "[data-report-detail-hint]": detailHint,
            '[name="detail"]': detail,
            '[name="_subject"]': subject,
            "[data-report-source]": source,
            "[data-removal-review]": verification,
            "[data-mail-draft]": draft,
          } as Record<string, unknown>
        )[selector] ?? null
      );
    },
    querySelectorAll() {
      return groups;
    },
    addEventListener(type: string, fn: (...args: unknown[]) => void) {
      formListeners[type] = fn;
    },
  };
  runInNewContext(readFileSync(path.join(DIST, "report.js"), "utf8"), {
    window: { location: { search: "?type=looking&looking=Original+question&from=%2Fes%2Fbuscar%2F&territory=%3CSpain%3E" } },
    URLSearchParams,
    document: {
      querySelector: () => null,
      querySelectorAll: (selector: string) => {
        if (selector === "form[data-report]") return [form];
        if (selector === '[data-prefill="looking"]') return [detail];
        if (selector === '[data-context-input="from"]') return [from];
        if (selector === '[data-context-value="territory"]') return [safeText];
        return [];
      },
    },
  });
  assert.ok(formListeners.invalid, "the form must localize native invalid feedback");
  assert.ok(formListeners.input);
  assert.ok(formListeners.change);
  assert.equal(formListeners.submit, undefined, "native POST must retain browser/provider delivery and errors");
  const invalidField = {
    validity: { valueMissing: true, typeMismatch: false },
    message: "",
    setCustomValidity(message: string) { this.message = message; },
  };
  formListeners.invalid!({ target: invalidField });
  assert.equal(invalidField.message, "Obligatorio");
  formListeners.input!({ target: invalidField });
  assert.equal(invalidField.message, "");
  invalidField.validity.valueMissing = false;
  invalidField.validity.typeMismatch = true;
  formListeners.invalid!({ target: invalidField });
  assert.equal(invalidField.message, "URL inválida");
  assert.equal(reason.value, "looking");
  assert.equal(detail.value, "Original question");
  assert.equal(from.value, "/es/buscar/");
  assert.equal(safeText.textContent, "<Spain>");
  assert.equal(source.required, false);
  assert.equal(verification.hidden, true);
  assert.equal(groups[0]!.field.disabled, true);
  assert.equal(groups[1]!.field.disabled, false);
  assert.equal(groups[2]!.field.disabled, true, "an unmet search has no public page to ask for");
  detail.value = "Edited by visitor";
  for (const kind of kinds) {
    reason.value = kind;
    draft.hidden = false;
    listeners.change!();
    assert.equal(form.dataset.kind, kind);
    assert.equal(subject.value, `Subject ${kind}`);
    assert.equal(detailLabel.textContent, `Label ${kind}`);
    assert.equal(detailHint.textContent, `Hint ${kind}`);
    assert.equal(detail.dataset.mailLabel, `Label ${kind}`);
    assert.equal(source.required, kind === "missing" || kind === "removal");
    assert.equal(verification.hidden, kind !== "removal");
    assert.equal(detail.value, "Edited by visitor", "changing reason must not discard the message");
    assert.equal(draft.hidden, true, "a changed reason invalidates a prepared email");
    for (const group of groups) assert.equal(group.field.disabled, !group.dataset.reportOnly.split(" ").includes(kind));
  }
});
