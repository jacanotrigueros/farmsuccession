<!--
  A pull request here is read against the evidence, not against the diff. Nothing in this template is
  ceremony: each line is something a reviewer would otherwise have to ask for.
-->

## What changes, and why

<!-- One or two sentences. What a reader of the site would notice, or what stops being possible. -->

## The evidence

<!--
  For anything that touches data: the public page you read, the day you read it, and the sentence on it
  that supports the change, quoted word for word. A change to a record without a citable public source
  cannot be merged, however obviously true it is.
-->

## What you ran

- [ ] `npm run check` — type-check, lint, formatting, generated types, tests, validate
- [ ] `npm run check --prefix frontend` — the site's own gate, which builds it
- [ ] `npm run check:territory -- <year> <territory>` if an edition file changed
- [ ] Documentation that comes in pairs was updated on both sides

<!--
  The live checks (check:sources, check:links) reach the network and never gate anything. If one of
  them is what sent you here, say which page and paste the verdict.
-->
