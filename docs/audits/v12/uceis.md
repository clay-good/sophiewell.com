# v12 audit - uceis

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Travis SP, Schnell D, Krzeski P, et al. Gut. 2012;61(4):535-542 (re-fetched; the 0-based vs 1-based scale conflict resolved across MDCalc, PMC4584567, and PMC9399578).

`lib/gi-v126.js uceis()` sums vascular pattern (0-2), bleeding (0-3), and
erosions/ulcers (0-3) to 0-8. Remission 0-1, mild 2-4, moderate 5-6, severe 7-8.
Class A (fixed descriptor scale; journal+author citation, no ISSUER_PATTERN trip --
no docs/citation-staleness.md row).

## Boundary worked examples added
- vascular 2 + bleeding 3 + erosions 2 -> 7, severe.
- remission (0-1).
- max 8.
- clamps; scalar fuzz arg -> 0.

## Cross-implementation differential
- Reference: the 0-based scale (MDCalc / modern practice, 0-8) is used; the ORIGINAL
  Travis 2012 paper was 1-based (3-11), later rebased to zero -- documented in the
  note. The mdapp hybrid (1-based anchors but 0-8 total, mathematically impossible) is
  NOT replicated. Match. PASS.

## Edge-input handling notes
- Three selects clamped to their ranges; a scalar fuzz arg -> 0/8.

## A11y / keyboard notes
- Three labeled selects; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
