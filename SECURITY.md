# Security policy

## What there is to attack

This project publishes a static site and a public dataset. It has no accounts, no
forms that submit anywhere, no cookies, no analytics and no server of its own, so
the usual surface is mostly absent. What it does do is **read public pages from
the open internet and store what they said**, which is where the real risks are:

- a cited page returning something hostile to whatever parses it;
- a dependency of the checks being compromised;
- the published data being altered to say something a source never said;
- the site shipping a third-party request it never promised.

Reports about any of these are welcome.

## Reporting

Use GitHub's private vulnerability reporting on this repository (Security →
Report a vulnerability). Please do not open a public issue for something
exploitable.

Include what you did, what happened, and what you expected. A proof of concept is
welcome; please do not run anything against third-party portals on this project's
behalf — their pages are read politely, one request at a time, and a burst of
traffic traced back here costs the project the access it depends on.

This is a single-maintainer project. Expect an acknowledgement within a few days
rather than within hours.

## What the checks already do about it

Stated so a reviewer can see where the lines are:

- **Certificate verification is never disabled.** Two official portals serve an
  incomplete TLS chain; the missing public intermediates are committed, pinned by
  fingerprint, and each is installed only after it is shown to be a real
  intermediate, not self-signed, issued and signed by a root the runtime already
  trusts, and unexpired. See [`decisions/008`](decisions/008-complete-a-tls-chain.md).
- **A fetched page is never executed.** It is read as text or as PDF text, and
  nothing in it is evaluated, rendered or followed except redirects.
- **A response body is bounded** and a larger one is cancelled rather than held in
  memory.
- **The checker identifies itself** rather than posing as a browser, and visits one
  host at a time with a pause between requests.
- **Dependencies are pinned to exact versions** and kept few on purpose. The
  production dependencies are a JSON Schema validator, its format package, an HTML
  entity decoder and a PDF text extractor; the site adds Astro and Tailwind.
- **One advisory is open and will stay open: `npm audit` reports two highs in
  `frontend/`.** Both are CVE-2026-93748 in `http-cache-semantics`, which arrives as a
  dependency of Astro. No patched release of that library exists, and the fix `npm audit`
  offers is Astro five major versions back, which patches nothing and swaps a library
  nobody can reach here for an unmaintained framework. Astro imports it in exactly one
  file, the build-time cache for images fetched from other hosts, and this site fetches
  none: `image.domains` and `image.remotePatterns` are empty, a test keeps them empty,
  and nothing of it reaches the published pages.
  [`decisions/017`](decisions/017-an-advisory-with-no-patch.md) has the full reading and
  what would change it. If you find a path that makes it reachable, that is exactly the
  kind of report this policy wants.
- **The published site is cookie-free**, carries no analytics, and makes no
  third-party requests. A change that introduced one would be a bug of the same
  seriousness as a security defect.

## Out of scope

Reports that a cited third-party portal is itself insecure, or that its page is
wrong, belong with that portal. If one of them publishes something that makes our
record wrong, that is a data correction and the fastest route is an issue with the
page and the date.
