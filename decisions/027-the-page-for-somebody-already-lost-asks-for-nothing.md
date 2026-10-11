# 027 — The page for somebody already lost asks for nothing

**2026-10-11.** The page that answers an address which does not exist says what happened
in all six languages of the site at once, with no script and nothing hidden.

## The question

GitHub Pages serves one file for every unknown path. This site is written in six
languages — the European layer in English, each country in its own — and that one file
cannot know which of them the person who mistyped was reading.

Both answers are reasonable. **One block, chosen by a script** that reads the broken path
and shows the Spanish panel for a path under `/es/`: the reader sees one short page, in
their language, and nothing irrelevant. **Every block at once**, no script: the reader
sees six, one of which is theirs.

## What the evidence said

The closed design this site converges on took the first answer, and it is the better page
for anybody whose browser runs it.

The measurement that settles it is not about browsers, though. It is who this page is
for. Every reader of this page arrived from something that already failed — a link that
rotted, a path typed wrong, a bookmark from an edition that moved. It is the one page on
the site whose entire audience is people for whom something has just gone wrong, and the
only honest assumption to make about them is that one more thing may be wrong too.

The site ships JavaScript on exactly one page, the search, and that one still works
without it. A 404 that needs a script to name the reader's language would be the first
page here whose main content depends on one.

The cost of the second answer is measurable and small: the page carries five short blocks
a given reader does not need, about 40 words each, on a page nobody stays on.

## The decision

1. **Six languages, one page, no script.** The heading and the European search are in the
   language of the European layer; under them, every country says what happened in its own
   language and offers the way back into itself, each marked with the language it is
   written in so a screen reader changes voice for it.
2. **Nothing is hidden.** No block is collapsed or `hidden`, because a reader who cannot
   run a script would never see it, and because the reader who needs the Portuguese block
   is the one least likely to find a control for it.
3. **The page is not offered to anybody.** It is excluded from the sitemap: it answers
   addresses that do not exist, and it is not one.

## What it costs

A reader on a working browser reads five blocks that are not theirs before or after the
one that is. If that ever reads as noise rather than as help, the fix is to order the
blocks by the broken path **on the server**, which this host cannot do — not to hide five
of them behind a script.

## What would overturn it

A host that can serve a different file per path prefix, which would make the choice free.
Or a sixth, seventh and eighth language: six blocks are a short page, twelve would not be,
and the answer then is to show the European block and link to a page per language rather
than to hide them.
