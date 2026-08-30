# spec-v893 — the unit words the US-English gate could not see

## What was wrong

spec-v871 added `litre` and `metre` to the banned list, and both entries sit inside a pattern
that opens with `\b`. A **compound** unit has no word boundary before its stem — there is none
between the `i` of `milli` and the `m` of `metre` — so `millimetre`, `microlitre`, `centimetre`
and their nine siblings passed the gate untouched.

That left **74 occurrences across 31 files** of reader-facing copy spelling its units the British
way, including on-screen text like *"per cubic millimetre"* in the ascitic-fluid criteria and
*"125 micrometres"* in the AREDS drusen threshold.

It surfaced from a tile: spec-v892 tripped the gate on a bare `litre`, and looking at what else
the entry did and did not catch turned up the compounds.

## What changed

| | |
|---|---|
| Banned list | 22 compound unit words added, spelled out in full |
| Copy fixed | 48 lines across 31 files |

The compounds are listed explicitly rather than by dropping the leading `\b` from the existing
`litre` / `metre` entries. Dropping it would make those entries fire inside ordinary words, and
the whole reason spec-v871 wrote whole words instead of stems was to keep the pattern from
guessing.

Added: microlitre(s), millilitre(s), decilitre(s), centilitre(s), kilolitre(s), nanometre(s),
micrometre(s), millimetre(s), centimetre(s), decimetre(s), kilometre(s).

## What did not change

The citation and journal-token allowlist still protects primary-source strings, and code comments
remain exempt by design.

## Proof

`check-us-english` reports clean over the same 2,308 files it scanned before. Re-running the
post-change gate against the pre-change tree finds the 48 lines; re-running it against the
post-change tree finds nothing.

Catalog unchanged at 1683.
