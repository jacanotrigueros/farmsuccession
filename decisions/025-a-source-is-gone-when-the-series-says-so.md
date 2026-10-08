# 025 — A source is gone when the series says so, not when a run does

**2026-10-09.** Every live check now appends one line to
[`reports/source-checks.jsonl`](../reports/source-checks.jsonl), which is committed, and
`npm run report:sources` answers from the series rather than from the last reading.

## What happened, which is the whole argument

On the evening of 8 October 2026 the nineteen French territories were checked one by
one before their first publication. The result:

|               |     |
| ------------- | --- |
| Pages re-read | 89  |
| PASS          | 53  |
| FAIL          | 0   |
| UNCHECKED     | 36  |

Forty per cent of the French corpus unread, with four regions — Occitanie, Nouvelle-
Aquitaine, Provence-Alpes-Côte d'Azur and Pays de la Loire — failing almost wholesale.
Quoted as it stands, that is a sentence about France: _forty per cent of its cited pages
could not be read_.

It was a sentence about this machine. Every one of the 36 was a transport failure —
`EAI_AGAIN` or `UND_ERR_CONNECT_TIMEOUT`, no HTTP status at all. Three things settled it:

- `curl` returned 200 from the same hosts, in the same minutes, from the same shell;
- Node's own `fetch`, with the checker's own user agent, returned 200 in 194 ms for a
  page the checker had just failed to reach twice;
- Occitanie, 0 of 14 that evening, answered **14 of 14** on the next run.

And the reverse, which is the part worth keeping: Bretagne went from 6 of 8 to 0 of 8
between two runs an hour apart. A reading taken at a moment is a reading taken at a
moment, whichever direction it points.

## Why nothing caught it

[`decisions/007`](007-unchecked-is-a-third-answer.md) already said that UNCHECKED is an
answer and not a softer failure, and the checker already behaved that way. What was
missing was that nothing _kept_ the answers. `reports/sources.json` is overwritten by
the next run, `reports/` was ignored by git, and what survived a run was a sentence
somebody typed into the README — "218 PASS, 1 FAIL, 11 UNCHECKED on 2 October 2026" —
with nothing behind it to compare against, question, or recount.

A project whose entire claim is that every statement traces to evidence was making one
statement that traced to nobody: its own freshness.

## The decision

1. **Every run is kept.** `checkSources` appends one line per run: when, which edition,
   which scope, the totals, and each URL with its status, HTTP code and, when it did not
   pass, the reason. One run of the whole edition is about 40 KB; one of a territory is a
   few hundred bytes.
2. **A verdict is a property of the series, not of a run.** `npm run report:sources`
   classifies each cited page as HEALTHY, FLAKY, UNREACHABLE, GONE or NEW.
3. **GONE — the only verdict that asks for a record to be changed — requires an answered
   failure on two different days.** A refusal or a missing quote, twice, on separate
   days. Two readings half an hour apart are one reading.
4. **Silence never becomes GONE.** A page nobody could reach taught us nothing about the
   page. Repeated silence is UNREACHABLE: worth a person opening it in a browser, never
   worth editing a record over.
5. **A run where half or more of what it checked never answered at all is labelled as a
   reading about this machine**, so its totals are not quoted as a measurement of the
   corpus. The French sweep above is the first entry that earns the label.

A page that passes once is FLAKY rather than broken, however often it fails afterwards,
because something answered correctly at least once and the record is therefore not
wrong.

## What was rejected

**Retrying harder, or raising the timeout.** It would have turned those 36 into passes
and taught nobody anything. The instability is real and belongs in the record, not
smoothed out of it.

**Treating UNCHECKED as a failure.** It would have condemned 36 French pages that were
fine, and `decisions/007` exists precisely to prevent that.

**Keeping only the latest report, as before.** It is what made the question
unanswerable: with one reading there is no way to tell a dead page from a bad evening.

**Deciding GONE from a single run of several days ago.** The temptation is strong at the
end of a long sweep, when the last thing you have is a list of failures. Rule 3 is there
for that moment, and it is a test rather than a convention:
`test/source-ledger.test.ts` fails if one reading can produce a verdict.

## What it costs

The ledger grows by one line per run and is never rewritten. It is the only file in the
repository that records what happened rather than what is true, which is why it is
append-only: a reading that was taken is not edited afterwards.
