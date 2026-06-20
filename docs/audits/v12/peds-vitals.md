# v12 audit - peds-vitals

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: American Heart Association, Pediatric Advanced Life Support (PALS) Provider Manual 2020; age-banded normal ranges and the hypotensive-SBP definition cross-checked with the roughlogic.com computePedsVitals reference port.

`lib/ems-v149.js pedsVitals()` returns the age-band normal heart rate (awake / asleep),
respiratory rate, and systolic-BP ranges per AHA PALS 2020, and computes the PALS
hypotensive-SBP threshold for the entered age: < 60 neonate, < 70 infant, < 70 + 2 x age
for ages 1-10, < 90 at >= 10 yr. Class B (the citation names "AHA", which trips
ISSUER_PATTERN -> carries a docs/citation-staleness.md row + accessed date). The
band-specific hypotension cutoff is the computed element, so the tile is a calculator,
not a static lookup table (spec-v29 §3).

## Boundary worked examples added
- 5 yr -> preschool band, hypotension SBP < 80 (70 + 2 x 5).
- age 0 -> neonate band, hypotension SBP < 60.
- 0.5 yr -> infant band, hypotension SBP < 70.
- 14 yr -> adolescent band, hypotension SBP < 90.
- age 10 boundary -> 70 + 2 x 10 = 90.
- no age -> invalid prompt, no NaN.

## Cross-implementation differential
- Reference: roughlogic computePedsVitals returns the same age bands and the same PALS
  hypotension rule; this port derives the band from a single age-in-years input and
  computes the exact 70 + 2 x age cutoff rather than quoting an approximate string.
  Equivalent. PASS.

## Edge-input handling notes
- Age outside 0-18 returns the complete-the-fields prompt. The 28-day neonate boundary
  is expressed as 28/365 years. A scalar / non-object fuzz arg yields an invalid result,
  never a NaN.

## A11y / keyboard notes
- One labeled number input; output aria-live="polite". The HR "awake / asleep" string is
  space-separated to avoid an unbreakable token; 320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
