# 017 — An advisory with no patch is assessed, not silenced

Decided 2026-10-03, milestone 06.

## The question

Installing Astro brings one open advisory with it, and `npm audit` reports it as
**2 high severity vulnerabilities** the moment the site's dependencies exist. The tool
also offers a fix, and taking the fix is the reflex: a clean audit is a good thing to be
able to claim, and a repository that ships known highs looks careless.

The fix it offers is `astro@2.10.9` — five major versions back, from a line nobody
maintains. So the question is what a maintainer owes a reader here: a green `npm audit`,
or an answer.

## What the evidence said

The advisory is **CVE-2026-93748** (GHSA-ch52-4w7c-c8xp), published on 18 September
2026, high severity, in `http-cache-semantics`. Read first-hand rather than through the
tool's summary:

- **Affected versions: through 4.2.0. Patched versions: "None".** There is no release of
  that library to upgrade to, so `npm audit fix` and an `overrides` pin both have nothing
  to point at. Downgrading Astro does not patch the flaw; it removes a dependency edge,
  and trades a library nobody can exploit here for five years of unmaintained framework.
- **What it takes to exploit it**: network access to a shared HTTP cache that uses the
  library to serve more than one user, and repeated requests carrying a large
  `max-stale`, which can return another user's cached response.
- **Where the library is in this tree**: `npm ls` shows one path, a direct dependency of
  `astro`, and `grep` over the installed package shows exactly one file importing it —
  `astro/dist/assets/build/remote.js`, which computes a time-to-live for images fetched
  from other hosts at build time. Nothing else in Astro touches it.

So the published artifact cannot contain it — the site is HTML, CSS and one SVG — and the
build cannot reach it either, because fetching a remote image requires `image.domains` or
`image.remotePatterns` to list a host, and this site has none: every asset is
first-party and committed, which was already decided for coverage and licensing reasons
rather than for this one.

## The decision

The advisory is recorded and left in place, and the property that makes it unreachable is
made enforceable instead of assumed.

- `astro.config.mjs` states `image: { domains: [], remotePatterns: [] }` explicitly,
  although that is already the default, because here it is load-bearing.
- A test asserts both lists stay empty, with the reason in its failure message. The day
  somebody needs a remote image, that test fails and this decision is re-made by a person
  who can see what it rests on — which is the opposite of an assessment that quietly
  expires.
- `SECURITY.md` says what `npm audit` reports and why, so a reader who runs it finds the
  answer where they are already looking.
- Never downgrade a dependency by majors to make a tool quiet. A tool reports what is in
  the tree; whether it can be reached is the maintainer's to establish and to write down.

## What it costs

`npm audit` keeps printing two highs, and anybody who treats that number as a verdict
will think less of the project until they read this. That is the honest price of not
making a false claim with a downgrade, and it is why the assessment is written in the two
places a reader looks rather than only here.

It also costs a standing obligation: an advisory assessed once is not assessed forever.
When the library is patched, the pin goes away and the record says so; if Astro ever uses
it somewhere other than remote images, the whole argument has to be redone.

## What would overturn it

A patched release of `http-cache-semantics`, which makes all of this unnecessary — upgrade
and delete this record's conclusion. Astro dropping the dependency, same outcome. Or the
site ever needing a remote image, in which case the code path becomes reachable and the
question changes from "can it run" to "does a build-time cache on one machine, serving
one user, meet the conditions the advisory describes" — which is a different argument,
and it needs making before the test is changed.
