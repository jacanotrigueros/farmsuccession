# M15 — The missing runner remains a decision

17 October 2026. No browser package or Chromium installation was added. Live manual
observations confirmed the enabled Spanish search field and keyboard pagination, but
are not regressions in the pull request job. Markup tests cannot protect either event
path; new assertions about HTML presence would misrepresent what is covered.

The maintainer needs to choose a development-only runner and how Chromium is provisioned
in the check job. A core package with a separately provisioned browser is smaller but
moves version coordination into the workflow. A bundled test runner is easier to keep
coherent but adds development weight. Neither need reach the published site. npm must
write the lockfile; no package version or integrity value is invented here.

Recommendation: one Chromium smoke path in CI, using keyboard where relevant and real
completion conditions such as aria-busy=false rather than sleeps. Cover type/search,
filters, pagination/focus, dated application refresh and the correction form's mail
handoff without actually sending mail. Keep offline pages and actual browser behaviour
as different checks. A failing-control mutation should be demonstrated for each path.

What would overturn it: a chosen runner/browser policy, or different hosting/tooling
already providing that browser in the clean check job. M14bis is shipped language work;
M15 cannot be marked done by another translation or unit-test pass.
