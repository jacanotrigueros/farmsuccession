# Sitemap lastmod uses the evidence clock

17 October 2026. The public sitemap reports 2026-09-14 for the home page after the
October 1.2.0 interface/metadata release. sitemap.ts reads territory.data.published
for both territory and record URLs. That value is honest evidence provenance, but not
necessarily the page's last significant modification. Google documents that distinction:
https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
(read 17 October 2026).

Options: omit lastmod; derive it from content-relevant repository history plus the
record's inherited layers; or keep the source-publication date while describing it as
such elsewhere. The third does not change what the sitemap standard means. A build
clock is also wrong: rebuilding unchanged HTML must not imply fresh evidence or content.

Recommend omission until a reproducible page-modification model exists. Git history
could later supply that model, but shallow CI checkouts, shared-template edits and
inherited records must all be covered; data.published alone misses those relationships.
028's noindex/sitemap exclusion stays unchanged, and 025's ledger dates do not decide
page-modification dates. No source consultation date or edition publication date should
be moved to solve this metadata problem.

What would overturn it: a tested provenance model for significant page changes or
Search Console evidence supporting a more useful conservative signal. No observed
ranking loss is claimed. The direct 404 canonical/indexing policy is a separate decision,
not a reason to add an unapproved noindex rule to 027's recovery page.
