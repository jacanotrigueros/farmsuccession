# 003 — No `maxItems`, because of what it generates

Decided 2026-10-01, milestone 01.

## The question

Bounding a list looks like ordinary hygiene. A resource with forty sources is
almost certainly a mistake, and `minItems: 1` with `maxItems: 20` states the
intended range in the contract.

The types in [`src/types/`](../src/types/) are generated from the schemas, so
every keyword has a second effect nobody sees until the file is opened.

## What the evidence said

`minItems: 1` generates a readable type:

```ts
sources: [Source, ...Source[]];
```

`minItems: 1` together with `maxItems: 20` generates the union of every allowed
length:

```ts
sources:
  | [Source]
  | [Source, Source]
  | [Source, Source, Source]
  // … twenty branches
```

That type is what every consumer of the data sees in an editor, and it says
nothing a reader can use. The same happened to `quotes`. Six `maxItems` were in
the schemas; all six produced this.

## The decision

No `maxItems` anywhere in `schema/`. A test scans every schema and fails if one
appears, with the reason in the failure message, so the next person to reach for
it reads why before removing the test.

Length is not left unbounded by accident: free text is bounded with `maxLength`,
measured from the longest real value rather than invented, and a list that is too
long is a judgement a person makes, not a number the contract should guess.

## What it costs

Nothing stops a file from carrying two hundred sources. The schema will accept it
and a reviewer has to notice. That is the right place for that judgement — two
hundred sources is a research problem, not a shape problem.

## What would overturn it

A generator that reads `maxItems` as a bound rather than as an enumeration of
lengths. The rule is about what the keyword produces, not about the keyword, so
the day the output is readable the rule has no reason left.
