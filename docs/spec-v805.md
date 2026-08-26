# spec-v805.md — AMTS (Abbreviated Mental Test Score)

> Status: **SHIPPED (2026-08-26).** Builds the `amts` tile. Catalog **1596 → 1597**, group G.

## Why

The brief-cognitive-screen family now runs `sixcit`, `rudas`, `mini-cog`, `ad8`, `slums`,
`bims` — and was missing the oldest and most widely used of them all. The AMTS is public
domain, takes two minutes, and is what a great deal of acute geriatric practice still uses.

## What it does

Ten questions, one point each, total **0–10**, higher is better:

age · time to the nearest hour · recall of the address given at the start · the current year ·
the name of the place · recognizing two people · date of birth · the year the First World War
started · the name of the present monarch · counting backward from 20 to 1

## The interesting part: two cutoffs that disagree

The validation literature reports a threshold of **7 — that is, 6 or below suggests
impairment.** Widespread clinical practice, particularly in the UK, treats **anything under 8**
as impaired.

**A score of exactly 7 falls between them** — impaired by one rule, not by the other. Rather
than pick a winner, the tile reports the score against **both** and says plainly when a result
lands in the gap. A clinician looking at a 7 needs to see that, not a single confident verdict
that happens to depend on which paper the calculator's author read.

The `abnormal` flag follows the **more inclusive** rule, so a 7 is flagged; three tests pin the
6/7/8 behaviour.

**Worked example:** seven questions correct → **7 of 10**, between the two rules.

## Posture (spec-v97)

A brief screen that flags the need for fuller assessment. It is **affected by education and by
language**, and it does not diagnose dementia or delirium, nor tell the two apart — a real
limitation for a test that is often used in exactly the acute setting where delirium is the
question.

## Files

- `lib/amts-v805.js` — `amts()`, `AMTS_NOTE`, `QUESTIONS`.
- `views/group-v805.js` (RV805) — ten checkboxes; the result shows both rules side by side; a11y-checked.
- `mcp/adapters/amts-v805.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, scoring, both cutoffs, related (sixcit, rudas, mini-cog).
- `test/unit/amts.test.js` — 6 tests (ten questions each worth one, both extremes, the two rules diverging, the score-of-7 gap, the flag following the inclusive rule, arbitrary combinations).
- `docs/spec-v805.md` (this file).

## Sourcing (spec-v97)

Hodkinson HM. *Age Ageing.* 1972;1(4):233-238 (PMID 4669880). Both sources agree item for
item on all ten questions. They **disagree on the cutoff** — one states "less than 8 implies
cognitive impairment", the other that "the threshold score for cognitive impairment in AMTS
was 7 points (6 or below)". Under the spec-v97 gate a disagreement is not resolved by
guessing, and here it did not need to be: both thresholds are genuinely in use, so both ship,
labeled by where each comes from.
