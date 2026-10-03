# 021 — A layout asks the column it sits in, not the window

Decided 2026-10-03, milestone 07.

## The question

The record page shows its structured facts as a summary list: label on the left, value on
the right, one row per fact. Two columns need room, so the list has to decide when to
split, and the ordinary way to decide is a breakpoint — split above 640px of window, stack
below it.

The shell around it is three columns on a wide screen: the tree of territories, the page,
the index of the page. So the window and the column the list lives in are two different
widths, and the question is which one the list is entitled to ask.

## What the evidence said

Measured in the browser, on a record page, with both rails open:

- At a **1024px** window — the width at which the three-column shell appears — the middle
  column is **449px**. A label column of 16rem there left **169px** for the answer, and
  "Agencia Gallega de Desarrollo Rural (AGADER)" came out as a ribbon four words wide over
  three lines.
- At **1440px** the same column is 696px and the split is comfortable: 224px of label,
  472px of answer.
- So the window said "plenty of room" through the whole range where there was none. The
  breakpoint was not set too low; it was asking the wrong thing.
- Guessing a higher breakpoint does not fix it either, because it hard-codes the width of
  two rails into a component that knows nothing about them. The rails changed once already
  this milestone.

## The decision

The middle column is a container, and anything inside it that lays itself out in columns
asks that container rather than the window. The summary list and the figures list split at
32rem of **column**, not of window.

What a component measures is part of what it is: a list of label-and-value rows is laid out
against the space it has, and the window is only the space of whatever is outermost.

## What it costs

Container queries need a browser from 2022 or later — Chrome 105, Safari 16, Firefox 110.
An older one ignores the query and the list stays in one column at every width, which is
the layout the small screen gets: still complete, still readable, only taller. That is an
acceptable floor because it is the honest one — the fallback is the simpler layout, not a
broken version of the richer one.

It also costs a shared assumption: the container is declared in the layout and used in
components that do not name it, so somebody moving one of those lists out of the middle
column would see it stop splitting, and nothing would tell them why except this record and
the comment in the layout.

## What would overturn it

A page where the content column is the only column — no rails, nothing beside it. There the
window and the container are the same width, the query is ceremony, and a breakpoint says
the same thing more plainly. That is not this site: every page of it has the tree, and the
index arrives with it.
