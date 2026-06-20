# v12 audit - megos

- Auditor: CG
- Date: 2026-06-19
- Citation re-verified against: Walgaard C, Lingsma HF, Ruts L, van Doorn PA, Steyerberg EW, Jacobs BC. Early recognition of poor prognosis in Guillain-Barre syndrome. Neurology. 2011;76(11):968-975 (re-fetched; the point table was cross-read across the Bangladesh validation PMC9380155 and the Frontiers in Neurology 2023 validation, which agree exactly).

`lib/neuro-v121.js megos()` sums three items: age (40 or younger 0, 41-60 1, over
60 2), preceding diarrhea (+1), and the MRC sum-score band, which is weighted by
timing -- at admission 51-60 0, 41-50 2, 31-40 4, 30 or below 6 (total 0-9); at
day 7 51-60 0, 41-50 3, 31-40 6, 30 or below 9 (total 0-12). Class A (fixed point
weights; journal+author citation, no ISSUER_PATTERN trip -- no
docs/citation-staleness.md row).

## Boundary worked examples added
- all 0-point inputs at admission -> 0/9, low.
- admission vs day-7 MRC weighting differs (31-40 -> +4 admission, +6 day 7).
- age >60 + diarrhea + MRC <=30 at day 7 -> 12/12, high.
- clamps to the max (9 admission, 12 day 7); cannot exceed the range.
- scalar fuzz arg -> valid 0, never NaN.

## Cross-implementation differential
- Reference: the two validation reproductions agree exactly on the point table.
  The probability of being unable to walk unaided at 4 and 26 weeks is published
  ONLY as continuous figure curves whose logistic intercept/coefficients are not
  reported and which diverge by region, so -- per the v97 re-fetch discipline and
  the project no-fabrication governance -- the tile reports the total and a relative
  reading of the published 0-max range (higher score -> higher probability of
  inability to walk), inventing no per-score percentage (the v111 snakebite-severity
  relative-range pattern). Match. PASS.

## Edge-input handling notes
- Two selects (age 0-2, MRC band 0-3), a timing select, and one boolean; total
  clamped to its timing-specific max (9 or 12). A scalar fuzz arg yields a valid 0,
  never NaN.

## A11y / keyboard notes
- Three labeled selects, one labeled checkbox; output aria-live="polite". 320px
  sweep, no hscroll.

## Defects opened
- none
