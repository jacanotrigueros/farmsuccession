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

## The memos kept here

| Memo                          | The question                                            | State                                                                                                                                  |
| ----------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| [M14](M14-recency.md)         | Whether a recent failure should outweigh an old success | **Settled by [035](../../decisions/035-a-measurement-defends-025.md).** The measurement is reproducible from `npm run measure:recency` |
| [M17](M17-citation-policy.md) | What somebody cites when they cite this                 | **Settled by [`CITATION.md`](../../CITATION.md)**, which names the edition, pins its files to a commit and publishes their checksums   |
