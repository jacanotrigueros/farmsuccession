# 048 — Distinguish territory links from record disclosures

**2026-11-26.**

## The question

How can a reader tell whether a control opens the territory page or
expands its records in place?

## What the evidence said

At 390 CSS px both controls looked like adjacent rows. In Spain,
Aragón's featured grant sat between the territory link and «Otros
recursos (12)». In Austria, Kärnten's link and its two-record disclosure
looked like two rows with similar arrows.

## The decision

Give the territory name an underlined primary link. Put a secondary
«Show {count}» action below it, written in the page's language, with
the territory name in the accessible label. Keep native details and
summary, which exposes the expanded state and works with Enter and
Space. Show «Hide {count}» when open. Use the same control for grouped
territories and keep both targets at least 44 CSS px in each dimension.

## What it costs

The secondary control needs a little inset space. The number refers
to the records behind it, as featured grants are already visible.

## What would overturn it

A phone or keyboard walkthrough in which readers still open the wrong
control, or cannot tell which territory the action belongs to.
