# Research prompt versions

[`research-territory.md`](research-territory.md) is the standard research
process: what counts as a resource, how to search, what makes a claim admissible,
and what to deliver. It is followed by a person or an assistant, and it changes as
the passes it produced revealed what the instructions failed to prevent.

Every superseded version is kept whole in [`versions/`](versions/), and every file
a pass produces records which one it followed in
`metadata.generatedBy.promptVersion`. That is the point of this directory: a
record written in March can be read against the instructions of March rather than
against today's, and a mistake that a later version exists to prevent can be
recognised as the mistake of its time instead of as carelessness.

Versions are semantic. A new rule, a new section or a changed requirement is a
minor version; clarifying what an existing rule already meant is a patch.

## The versions

### 1.0.0 — the first stable process

The research territory prompt as a single document: what to collect, how to
evaluate a candidate, and what to deliver.

### 1.1.0 — hardened discovery

Discovery became a method rather than an instruction to search: which levels of a
country's own organisation to cover, and in what order.

### 1.2.0 — an example, a compact mode and a path for assistants that cannot run commands

Added a real schema-valid resource to imitate, a compact mode for assistants that
can run the repository's commands, and the two-fenced-block delivery format for a
chat that cannot — which is what made the process usable by anybody.

### 1.3.0 — closed measures and units

Figures stopped being free text. A metric takes its `measure` from a closed list
and a unit that fits it, so the same figure stays comparable from one territory to
the next.

### 1.4.0 — what it offers, who can use it, how to access it

The three fields a reader actually needs, made explicit and required, instead of
one description that answered whichever of them the researcher happened to have.

### 1.5.0 — a pass changes two files and nothing else

One pass produces one edition file and one brief. Scope creep in a research pass
is how a territory's work ends up unreviewable.

### 1.6.0 — the pre-delivery checklist, non-governmental services, and a gate

Fourteen checks to run before delivering. Farmers' organisations, chambers of
agriculture, cooperatives, foundations and land trusts were added explicitly,
because who operates a service does not decide admission — what it offers does.
A pass became something that has to pass `check:territory`.

### 1.6.1 — what a passing gate proves

Clarified that passing proves the technical check found no blocking failure. Not
exhaustive coverage, not that an instrument still operates, not a human review.

### 1.7.0 — the hub layer

A hub of several regions can carry its own file, for an instrument whose sources
show it applies to every region of the hub. A service delivered separately in some
regions stays in the region that delivers it.

### 1.8.0 — documented manual checks

A source the automatic check cannot read may support a published resource, but
only through a manual check recorded in the lead: the validated connection, the
quotes confirmed, the tool, who checked and why the automatic check cannot. The
automatic result stays UNCHECKED, and a manual check by an assistant is not a
human review.

### 1.9.0 — evidence per claim

Each material claim needs its own support, not one quote standing for a whole
record: status, eligibility, access route, and every amount and date separately.

### 1.10.0 — what the automatic checks reject

A new section listing the rules the validators enforce, written from the mistakes
the 2026 passes actually made. Quotes must keep the page's own apostrophes and
spacing and avoid a word a PDF splits across lines; lead reasons are in the
territory's language; every resource of an edition file needs an ADMITTED lead,
and an `instrumentChecks` answer may not contradict the resources published.

### 1.13.0 — never narrower than the source

Current version. Building the record pages showed what the corpus had been saying
quietly: 11 of 132 records were aimed at "anyone" and at named profiles at once, which
the schema's wording made a contradiction, and in eight of them both halves were true
— the source opened the thing to anyone and also said who it had in mind. Two of the
rest named no audience anywhere, because a policy plan and an announced observatory
have nothing to apply for.

The rule the prompt was missing is larger than that one field: **never record a limit
the source does not state**. A reader turned away by an invented restriction never
finds out they were eligible, which makes it worse than an invented instrument —
nothing contradicts it later. Where a page sets no age, no sector, no fee and no
profile, the record sets none; where it opens the door and also names who it expects,
both go in; where it names no audience at all, the field is left out.

### 1.12.0 — what the first published edition taught

Both changes come from running the gate over 33 real files instead
of over fixtures, and both are in the paragraph about figures in the file's own
voice:

- **Summary, limitations and news may use the evidence of the layers the file
  inherits**, not only its own. A lower layer is forbidden to repeat a fact recorded
  above it, so the earlier instruction left an author two ways out and both were worse
  than the sentence it refused: copy the national fact down, or write something vaguer
  than the source says. The code changed with the prompt, and a resource's own text
  still uses only its own evidence.
- **A dated fact about something the file does not publish belongs in `news`, with
  its page and its quote.** Two limitations of the first edition dated a closed tender
  and an announced land bank, and in both the date existed only in the researcher's
  own prose — one unverified sentence citing another. `limitations` carries no
  sources, so such a date has to go where sources go, and it has to be written while
  the page is open: a file published today cannot gain a source read tomorrow without
  re-dating a review nobody repeated.

### 1.11.0 — the rules as they are actually enforced

Section 3 described the checks from memory in three places where
they no longer matched the code, and a prompt that misdescribes a check teaches a
researcher to avoid the wrong thing:

- A figure in prose is now compared **as a figure**: a date against the dates of
  the file, and a value against the value _and unit_ of the evidence. The prompt
  said every number of two or more digits, which was true of the old reading and
  is now imprecise about both dates and units.
- Digits glued to letters (`SRE01`, `MR404A`) are read as codes and **not**
  checked as figures. The prompt claimed they were.
- `published` is rejected when it is in the future or earlier than a
  `consultedOn`; the prompt said it "is today", which is the instruction, not the
  rule.
- A `FORM` contact whose value is the cited page itself needs no quote, because a
  form is published by being that page. The prompt required a quote for every
  contact.

Nothing was relaxed: the three corrections describe checks that already existed,
and the figure rule became stricter in this repository, not looser.

## How the process matured

Read in order, the versions are a record of what unverifiable work looks like and
what stops it:

1. **1.0.0–1.2.0** — a process at all, and a way for somebody without a terminal
   to take part.
2. **1.3.0–1.5.0** — structure where free text was hiding judgement, and a
   bounded scope per pass.
3. **1.6.0–1.6.1** — a checklist, an automatic gate, and honesty about what
   passing it means.
4. **1.7.0** — territory as data rather than as a fixed two-level assumption.
5. **1.8.0–1.9.0** — what to do when a page cannot be read automatically, and
   evidence for each claim rather than for each record.
6. **1.10.0–1.11.0** — the machine rules stated up front, and then corrected to
   match the machine.
7. **1.12.0** — the first published edition, which found the two places where the
   rule was asking the wrong file.
8. **1.13.0** — the first published pages, which found the project recording limits
   its sources had not set.

## Comparing versions

```bash
diff prompts/versions/research-territory-v1.6.0.md prompts/versions/research-territory-v1.7.0.md
diff prompts/versions/research-territory-v1.10.0.md prompts/research-territory.md
```

Each file in `versions/` is the complete prompt at that point, self-contained and
unedited. They are history: a correction to a superseded version would make the
record of what a pass was told to do a record of what we now wish it had been
told.
