# Memos

A memo is a question that is open, with whatever measurement exists for it and
what each answer would cost. It is not a decision: nothing here is a rule, and
nothing here is binding on anybody.

The difference matters. [`decisions/`](../../decisions/) records a line that has
been drawn and the evidence that settled it. A memo records a line that has not,
so that the next person starts from what was measured instead of from preference.
A memo becomes a decision when somebody chooses, or it is deleted when the
question stops mattering.

Each one is dated and names the commit it was written against, because a measured
claim has a shelf life. If what a memo says disagrees with the repository now, the
repository wins — re-run the measurement rather than trusting the number.

## Where each one stood on 18 October 2026

| Memo                                                      | The question                                                        | State                                                                                                                                  |
| --------------------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| [M0](M0-observation.md)                                   | Who actually arrives                                                | **Answered in part.** It was written without a Search Console export; one exists now, in [`audience-2026.md`](../audience-2026.md)     |
| [M13](M13-task-meaning.md) · [counts](M13-task-counts.md) | What a task card counts, and what makes a record relevant to a task | Open. Needs an editorial choice, not a measurement                                                                                     |
| [M14](M14-recency.md)                                     | Whether a recent failure should outweigh an old success             | **Settled by [035](../../decisions/035-a-measurement-defends-025.md).** The measurement is reproducible from `npm run measure:recency` |
| [M15](M15-browser-regression.md)                          | What should drive a browser, and whether anything should            | Open. Needs a choice of runner and an owner                                                                                            |
| [M16](M16-second-edition.md)                              | What a second edition has to prove                                  | Open, and the expensive one: it needs a real research pass                                                                             |
| [M17](M17-citation-policy.md)                             | What somebody cites when they cite this                             | Open. The checksum tool exists; the policy and the stable payload do not                                                               |
| [search widening](search-widening.md)                     | When a search should widen its own scope                            | Open                                                                                                                                   |
| [sitemap dates](sitemap-dates.md)                         | Which clock a sitemap date should follow                            | Open                                                                                                                                   |

The milestones these refer to are in [`what-comes-next.md`](../what-comes-next.md).
