# 030 — A public correction uses email; GitHub stays behind the site

**2026-10-15.** The maintainer chose an account-free public form for missing resources
and corrections. It prepares an ordinary email to `contact@farmsuccession.eu`;
GitHub remains an editorial tool behind the site.

## The question

Should a reader who knows that FarmSuccession is missing a resource or carries stale
information submit that knowledge through GitHub, through a hosted form/API, or through
a form that hands the message to their own mail client?

All three are plausible. GitHub already holds the editorial work; a hosted form could
turn a submission directly into an issue; email adds one manual step.

## What the evidence said

The current site is a static GitHub Pages build. `frontend/astro.config.mjs` has no
server adapter, and `.github/workflows/publish.yml` uploads `frontend/dist` directly
to Pages.

The browser contract is stricter than "static":
`frontend/test/built-site.test.ts` fails if a page fetches a subresource from another
host, if a script is inline, or if anything shipped to the browser uses cookies or
browser storage. That contract exists for readers on rural connections and because
reading the directory should not tell another service that they were here.

The repository already has two issue forms under `.github/ISSUE_TEMPLATE/`, but using
either requires a GitHub account and exposes GitHub as part of the public task. The
site's About page instead publishes `contact@farmsuccession.eu` for corrections and
already tells readers not to send personal application documents.

Reproduce the relevant facts with:

```bash
cat frontend/astro.config.mjs
cat .github/workflows/publish.yml
grep -n "another host\|browser storage\|inline script" frontend/test/built-site.test.ts
cat .github/ISSUE_TEMPLATE/missing-or-wrong.yml
cat .github/ISSUE_TEMPLATE/source-moved.yml
grep -n "contact@farmsuccession.eu\|personal application" frontend/src/pages/'[...about].astro'
```

## The decision

1. **The public surface is a FarmSuccession form, not GitHub.** A reader does not need
   an account and does not have to understand the repository.
2. **The form makes no network request.** A first-party script prepares a structured
   email in the reader's own mail client and the address remains visible as a fallback.
3. **A submission is only a lead for investigation.** It never changes `research/`,
   `data/` or a published page automatically.
4. **GitHub stays behind the site.** The maintainer may turn a useful message into an
   issue and then follows the same evidence and review process as any other lead.

## What it costs

This relies on the reader having a configured mail client, and converting a useful
message into an issue is manual. Some webmail-only readers may prefer copying the
printed address instead of using the button.

A server endpoint could remove both costs, but on the present hosting it would add an
external processor or a second deployed service, a secret, abuse handling and a new
privacy surface for a feature expected to receive little traffic.

## What would overturn it

Change this when real submissions show that the mail-client handoff is losing useful
reports, or when FarmSuccession moves to first-party hosting that already has a
server-side endpoint and secret management.

The replacement still has to preserve the public boundary: no GitHub account for the
reader, no automatic publication, no personal application documents, and no third-party
request merely from opening a page.
