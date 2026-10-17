# 033 — A new entrant is a person entering farming, intended or recent

**2026-10-17.** NEW_ENTRANT includes a person planning to enter farming and a person
who has entered recently. The schema describes that meaning and all six labels name
that person. No assignment in the edition changes.

## The question

Should NEW_ENTRANT mean somebody already established, or include somebody preparing
to enter farming too? The narrower reading resembles some establishment schemes'
terminology. The broader reading also covers land access and preparation services
whose sources explicitly address future farmers.

## What the evidence said

At develop `88fc645`, the enum in `schema/edition.schema.json` gives NEW_ENTRANT no
definition. English and German name a person; Spanish, Italian and Portuguese name
an entry or establishment event. French says "Nouvel·le installé·e", which describes
somebody already established.

The 2026 edition assigns the code to 242 resources, including 58 written in French.
Reproduce the count from the record language rather than a substring of its path:

```bash
node --input-type=module <<'JS'
import { globSync, readFileSync } from "node:fs";
const counts = {};
for (const file of globSync("data/editions/2026/**/*.json")) {
  const snapshot = JSON.parse(readFileSync(file, "utf8"));
  for (const resource of snapshot.resources ?? []) {
    if (resource.targetProfiles?.includes("NEW_ENTRANT")) {
      const language = snapshot.metadata.language;
      counts[language] = (counts[language] ?? 0) + 1;
    }
  }
}
console.log(counts);
JS
```

This gives en 3, es 105, de 21, fr 58, it 43 and pt 12. One concrete French
counterexample is `auvergne-rhone-alpes-safer-aura` in
`data/editions/2026/regions/fr/auvergne-rhone-alpes.json`. Its audience includes
project holders and future farmers; its source says "Futurs agriculteurs". A label
that requires them already to be established contradicts that documented purpose.
Decision 022 forbids adding such a restriction.

The primary page https://safer-aura.fr/ was opened again on 17 October 2026.
It still says, verbatim: "Futurs agriculteurs : nous vous accompagnons dans vos
recherches et démarches d'installation." This supports the enum description; it
does not add evidence to or re-date the edition's frozen record.

## The decision

Define NEW_ENTRANT in the enum's description as a person entering farming, whether
the entry is intended or recent. Name that person, including both stages, in every
language's profile label in `frontend/src/lib/vocabulary.ts`.

Do not add an age, a number of years, a first-time requirement or an ownership test.
A source's own access conditions remain in its record. This is a broad documentary
profile, not a finding that a person meets a scheme's eligibility conditions.

Keep the code, enum members and all existing data assignments. Regenerate types
from the schema rather than editing generated output. The description and labels
are editorial meaning; no test merely repeats their wording. Existing schema,
generated-type and vocabulary-coverage checks hold the mechanical contract.

## What it costs

Naming both stages costs a word in every language. The first attempt cost far more
than that: at eighty-two characters the Spanish label took four lines in the filter
column of a 375px phone, beside options of one, and on a record it put a middle dot
between two words and a sentence. Each language now names the person the way it
already names a young farmer, which says the same thing and fits the control.

It does not supply a universal definition of how recent an entry must be. That boundary belongs to each
source, and making one up globally would exclude readers whose source does not.
The existing assignments need no data migration because neither intended nor recent
entry is excluded by the definition.

## What would overturn it

A need, evidenced across sources, to distinguish preparation from recent entry as
separate documentary profiles. That would need its own schema and research decision,
with a review of assignments against their sources. A scheme's particular time or
age limit would not justify silently imposing that limit on this shared code.
