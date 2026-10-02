# 009 — A caught error never becomes a value that reads as success

Decided 2026-10-02, milestone 03.

## The question

Turning a failure into a harmless-looking value is the most comfortable line of
code there is. Listing a directory that is not there and returning an empty list
reads as defensive programming: a new edition simply has no files yet, and the
caller carries on.

The question is what the caller then reports. If the caller is a check, it reports
that it found nothing wrong.

## What the evidence said

The listing used by the edition loader did exactly this:

```ts
} catch (error) {
  if (hasErrorCode(error, "ENOENT")) return [];
  throw error;
}
```

Nothing was swallowed in the usual sense — the error was examined, and only the
expected one was converted. And yet `validate --edition 2027` over an edition
nobody has written would have printed that there was nothing wrong with it. The
same shape was in the duplicate-key scanner, where a missing directory produced a
clean tree.

Two further cases were already in the code and are the counter-examples that make
the line clear: `JSON.parse` keeps only the last of two identical keys, losing the
first value with no error at all; and `JSON.parse` of a file with a pasted
fragment appended reports a syntax error that never mentions that a complete value
ended twenty lines earlier.

## The decision

A caught error is never converted into a value a caller can report as success.

- A directory that is not there is an error naming it, with the original as its
  cause. An edition that exists and holds nothing is a different thing, and that
  is what an empty list means.
- Every command says how much it checked. `0 edition file(s) checked` is printed
  precisely so that a run over nothing cannot be read as a clean run.
- A library does not print; it reports to its caller. "Add a log line" is the
  weaker version of this rule and not the rule: the test is whether a real failure
  can reach something that will call it success.
- Damage a parser hides is looked for on purpose, before anything is read as data.

The rule lives in a test — an edition nobody has written fails loudly — with the
reason in the failure message.

## What it costs

A genuinely optional directory now needs the caller to say that it is optional,
rather than the listing deciding for everybody. That is one line at the call site
and it is visible, which is the point.

## What would overturn it

Nothing about this is a trade-off to re-measure. It can only become narrower: a
caller with a real reason to treat an absent directory as empty says so itself.
