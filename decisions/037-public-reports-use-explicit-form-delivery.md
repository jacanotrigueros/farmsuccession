# 037 — Public reports use explicit form delivery

**2026-11-07. Status: Formspree selected; integration implemented, account activation pending.**
The maintainer wants visitors to submit a short form rather than compose an email.
This records the selected provider, the complete existing-form inventory and
the implemented integration and the remaining activation work. This PR adds native
Formspree delivery when configured; no operational endpoint is committed.

## The question

Should reports continue through the visitor's mail application, or should an external
service deliver them to the maintainer? The first keeps the present architecture;
the second removes a dependency that prevents some visitors from sending anything.

## What the evidence said

The site is a static GitHub Pages build. Decision [030](030-public-correction-stays-outside-github.md)
chose email and explicitly permits reconsideration while retaining no third-party
request merely from opening a page. The maintainer has now requested a free delivery
alternative. No measured submission or abandonment rate is claimed.

Provider documentation checked on **7 November 2026**:

| Option        | Free allowance and destination                                                                               | Fit and limitations                                                                                                                                                                                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Formspree** | 50 submissions per month per account; email notifications and a dashboard with 30 days of submission history | Native HTML POST preserves our forms and works without JavaScript. No visitor account needed. Free includes basic spam filtering and domain restriction, but not submission export, integrations or a custom thank-you redirect. The confirmation is hosted by Formspree. |
| **Tally**     | Unlimited forms/submissions subject to fair use; free native Google Sheets integration                       | Prefer this if a spreadsheet or a larger free allowance matters more than retaining our form UI. Use a hosted-form link, not an embed that contacts another host during reading. Tally states it is based in Belgium and stores form data in Europe.                      |
| **Web3Forms** | 250 submissions per month; email delivery and CSV export                                                     | Another direct-POST option. Current pricing/privacy pages describe stored submissions, potentially up to three years, and international processing. Do not rely on older FAQ wording that says submissions are not stored.                                                |

Sources:

- Formspree [plans](https://formspree.io/plans), [HTML setup](https://formspree.io/html/),
  [account limits](https://help.formspree.io/articles/account-management/account-limits),
  [limit errors](https://help.formspree.io/articles/form-and-project-settings/system-limits),
  [honeypot](https://help.formspree.io/articles/building-your-form/honeypot-spam-filtering),
  [reCAPTCHA settings](https://help.formspree.io/articles/form-and-project-settings/recaptcha-settings/),
  [privacy](https://formspree.io/legal/privacy-policy/) and
  [US hosting](https://formspree.io/security/).
- Tally [free plan and hosting](https://tally.so/help/faq) and
  [Google Sheets integration](https://tally.so/help/google-sheets-integration).
- Web3Forms [pricing](https://web3forms.com/pricing) and
  [privacy](https://web3forms.com/privacy).

These are current allowances, not a promise that a provider will remain free forever.
No paid plan, trial upgrade or cloud billing account is needed for the proposed scope.

### Existing forms and what must migrate

All three message forms live in
[`frontend/src/pages/[...report].astro`](../frontend/src/pages/[...report].astro).
Before this change they used `mailto:` and
[`frontend/public/report.js`](../frontend/public/report.js) prepares a selectable
draft. They now share `ReportDelivery.astro`, using native POST when configured
and retaining that draft flow when no endpoint has been supplied.

| Kind                              | Entry points                                                                | Required answers                        | Optional/context data to preserve                                                                |
| --------------------------------- | --------------------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `missing`: suggest a resource     | Country, region, grouping and EU directory links; project contact page      | Public source URL and short explanation | Resource name; territory and originating page when supplied                                      |
| `correction`: report a change     | The correction link on every resource detail page; project contact page     | Issue category and short explanation    | Replacement public URL; resource name, territory and originating record page                     |
| `looking`: report an unmet search | The no-results offer in `SearchView.astro`, populated by `public/search.js` | What the visitor was looking for        | Place; territory and search-page path; prefilled search wording must remain visible and editable |

Relevant entry-point files are `src/pages/[...territory].astro`,
`src/pages/[...record].astro`, `src/pages/[...about].astro`,
`src/components/SearchView.astro` and `public/search.js`, all under `frontend/`.
Use one delivery configuration for all three kinds, not three separately maintained
integrations. Send a stable `kind`, interface language and distinguishable subject.
Do not silently discard the issue category or contextual fields.

The current catalogue builds **seven intake routes**: EU, DE, ES, FR, IT, PT and AT;
Austria shares German interface words. The existing three kinds produced 21 rendered forms. With the added removal kind,
there are now 28 forms across those routes, all sharing one delivery configuration. The integration derives routes from the catalogue; no country list is hard-coded.
All seven dictionaries in `src/lib/words.ts`, including Dutch, have delivery and
removal wording without adding a territory.

### Other form-like and email entry points

- `SearchBox.astro` and `SearchView.astro` contain **search GET forms**. Keep these
  local: ordinary search terms must never be sent to the report service. The
  no-results link leads to an editable report; it must not submit automatically.
- The resource detail page has both a correction button and email-only helper copy.
  Make the form the primary correction action and the printed address an alternative.
- `Footer.astro` and the project page offer **removal requests only by email**.
  This gap is now covered by a distinct `removal` intake kind
  with the affected public URL and a short explanation. Preserve direct email as an
  alternative, especially for a person who does not want to use another processor.
  Do not label a removal request as a broken link or automatically remove records.
- Institutional email addresses in a resource's **provider contacts** are different:
  they contact the documented service. Keep them pointed at that service; never
  redirect them into FarmSuccession's inbox.
- No existing file-upload, newsletter, account-registration or application-submission
  form was found. Do not introduce these as part of this change.

Reproduce the source inventory from the repository root:

```bash
rg -n '<form|mailto:|reportSlug|data-not-found-link' frontend/src frontend/public --glob '!words.ts'
```

## The decision

**Use Formspree Free for the existing UI.** The maintainer selected this option after
reviewing the alternatives. The integration is implemented; account configuration and activation
remain pending; there is no operational endpoint in this PR.
It removes the mail-client dependency without adding our own backend, SDK, secret
or deployment. Tally remains the documented alternative if the free spreadsheet
integration or higher allowance is the priority. Do not configure both by default:
duplicating receipts into extra services adds work and data copies.

Implementation requirements:

1. Use native HTML `POST` to one fixed, validated public Formspree `/f/…` endpoint.
   This endpoint is public configuration, not a credential. Never put an account/API
   secret in Git, the HTML or browser JavaScript. The query string must not select
   the destination. Keep the current context prefill and selected report section.
2. Permit the chosen origin in CSP `form-action` only when configured; retain
   `connect-src 'self'` and first-party-only scripts/assets. A page load, typing,
   search or field edit must make no request to the provider. Do not add a widget,
   embed, remote CAPTCHA script, preconnect, analytics, cookie or browser storage.
3. Explain beside the send action, in the page's language, that submitting sends
   the answers and technical request data, including IP address, to Formspree for
   delivery to FarmSuccession. Identify its US processing and link its privacy
   policy. Update the project privacy section and clarify the reading/submitting
   distinction recorded in `AGENTS.md` and decision 030. An external
   confirmation page has the provider's own privacy behaviour; our site's browser
   guarantees cannot be claimed for that page.
4. Require neither a visitor account nor a name/email. Do not request attachments,
   identity details or private application papers. Treat submitted text/context as
   untrusted. Every report remains a lead for human investigation, never publication.
5. Add the standard `_gotcha` honeypot, basic provider spam filtering and domain
   restriction. Configure CAPTCHA off initially to avoid a Google step; reconsider
   if actual abuse requires it. Honeypots do not guarantee spam prevention.
6. Use a clear localized “Send report” action. Keep the visible email alternative.
   Let the provider own the native POST confirmation/error; do not show a local
   success message before acceptance. Do not assume a paid custom redirect is free.
   If JavaScript delivery is later chosen, handle rejection, quota/rate-limit,
   network failure and repeated clicks explicitly, preserving the entered answers.
7. Until an endpoint is configured, preserve the honest email-draft flow and its
   existing labels. Do not ship a fake endpoint, disabled send button or success
   screen for a message that has gone nowhere.

### Remaining maintainer configuration

The shared transport, per-form privacy disclosure, metadata, honeypot, conditional
CSP and removal links are implemented. A four-choice navigation shows one form at a
time with JavaScript and preserves the original context when changing kinds; native
fragment links keep every form reachable without JavaScript. Every interface dictionary includes the new wording. Configure
one location: `frontend/reporting.config.mjs`, whose `reportEndpoint` is intentionally
empty until the maintainer supplies the real public form URL.

The following account/receipt work has **not** been performed:

1. The maintainer creates a **Free** Formspree account/form and verifies
   `contact@farmsuccession.eu` as the notification destination. Review the applicable
   processor terms and international-transfer provisions before enabling collection.
   Do not subscribe to a paid plan or use a trial as the free solution.
2. Configure notification delivery, allowed production domain and spam settings.
   Set `reportEndpoint` in `frontend/reporting.config.mjs` to the public `/f/…` URL,
   then rebuild the static site. Recheck
   current free allowances and settings at activation; all report kinds share the
   account's 50-submission monthly allowance.
3. Keep provider management access private. No user-submitted reports,
   inbox contents or personal test data belong in this public repository.
4. Complete the live receipt checks below, then let the maintainer decide when to publish. Record
   the activation state and configuration instructions here so another implementer
   does not mistake a configured UI for a verified operational inbox.

## What it costs

This introduces an external processor **on submission** and an account the maintainer
must own. Formspree uses US infrastructure. Free history is 30 days, which is not a
promise that every technical log or backup is deleted after 30 days; emails also
remain in the receiving mailbox under the maintainer's retention policy.

The account-wide free quota is a real limit. Formspree documents an error response
when limits are reached; visitors must not be told their report was delivered then.
The native confirmation takes them off-site. Spreadsheet integration/export is not
included in this free option; use Tally if that becomes a requirement.

### Acceptance and browser checks before activation

- Update `frontend/test/reporting.test.ts` for configured and unconfigured builds.
  Check every catalogue-derived intake route, each kind's required fields and
  preserved context, localized delivery/privacy wording and the provider subject.
- Keep `frontend/test/built-site.test.ts` strict: no remote asset/script or background
  connection, no storage, no inline JavaScript; only explicit form delivery gains
  the named CSP exception. Run both root and frontend `npm run check`.
- In a real browser, follow a correction from the Madrid young-farmer record, a
  missing-resource link from Cataluña and a no-results search offer. Confirm the
  selected form, original page, territory, record/category and editable search text.
  Also check project/footer removal links and an institutional provider email.
- Exercise validation and delivery without JavaScript, the unconfigured fallback,
  narrow layouts and keyboard use. For an eventual AJAX implementation, use a local
  test stub for failure/rate-limit scenarios; do not exhaust a live free quota.
- Opening any page and editing its fields must produce **zero provider requests**.
  A submit must send exactly the intended fields. With the maintainer's configured
  account, use clearly marked fictional reports to verify each kind reaches the
  inbox/dashboard and the provider displays a genuine confirmation. Check rejection
  behaviour, record the results and add representative screenshots to the PR.

No provider account, real submission or inbox receipt is claimed. Browser and build
verification of the configured interface uses a temporary fixture URL only; the
fixture is never submitted and is not the committed configuration. The earlier UX
screenshots exercise the email draft, not provider delivery.

### Verification of this implementation

- Root `npm run check`: passed, 251 tests; corpus validation retains 0 errors,
  the existing metric warning and the existing shared-access-page review item.
- Frontend `npm run check`: passed, 161 tests, in both a configured fixture build
  and the final unconfigured build. Every catalogue-derived intake route contains
  all four native forms with the same transport, appropriate encoding, metadata
  and no visitor account/email requirement. CSP keeps background connections local.
- Chrome: followed the Madrid resource correction link and retained its context;
  followed Cataluña's missing-resource link; followed a zero-result search and
  edited its prefilled wording; used the footer removal link. Confirmed that the
  empty removal URL blocks submission and that removal reasons are optional.
- With the committed empty configuration restored, prepared a removal email draft
  in Chrome without navigation, opening a mail client or sending a message.
- The configured screenshots below use fictional input and a temporary fixture
  endpoint. They demonstrate the interface, not successful provider delivery.
  No fixture endpoint is committed and no valid report was submitted to it.
- New form layouts have been inspected at desktop width. No new phone/device or
  no-JavaScript browser run is claimed; native HTML operation without JavaScript
  is covered by built-page checks. Provider acceptance, quota error pages and
  mailbox receipt remain live activation checks.

![Configured correction with privacy beside Send](assets/037/correction-configured.jpg)

![Configured removal with optional explanation](assets/037/removal-configured.jpg)

## What would overturn it

Choose Tally if a free spreadsheet or the Formspree allowance makes it the better
fit; re-evaluate if provider terms change, spam prevents useful reports, or first-party
hosting gains a suitable endpoint. Keep the same public boundaries: no account for
contributors, no private documents, no automatic publication and no third-party
request just to read the directory.
