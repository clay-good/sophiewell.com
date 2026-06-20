# v12 audit - cdai-crohns

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Best WR, Becktel JM, Singleton JW, Kern F Jr. Gastroenterology. 1976;70(3):439-444 (re-fetched; all 8 multipliers cross-read across igibdscores.it, Omnicalculator, and the canonical formula).

`lib/gi-v126.js cdaiCrohns()` sums liquid stools x2, abdominal pain x5, general
well-being x7, complications x20, antidiarrheal x30, abdominal mass (0/2/5) x10,
hematocrit deficit (47-Hct men / 42-Hct women) x6, and percent below standard body
weight x1. Bands < 150 / 150-220 / 221-450 / > 450. Class A (fixed 1976 weights;
journal+author citation, no ISSUER_PATTERN trip -- no docs/citation-staleness.md row).

## Boundary worked examples added
- worked example (stools 20, pain 14, well-being 7, etc) -> 285, moderate.
- remission band (< 150) not flagged.
- hematocrit deficit x6, sex-specific (men ref 47): -10 Hct -> +60.
- missing labs / zero standard weight -> valid:false (no division by zero).

## Cross-implementation differential
- Reference: all 8 multipliers (2/5/7/20/30/10/6/1) confirmed; hematocrit deficit
  direction (low Hct adds) and weight-percent direction (loss adds) confirmed. The
  150/220/450 band split's mild/moderate boundary is a trial convention, not in the
  1976 paper (documented in the band string). Match. PASS.

## Edge-input handling notes
- Diary items default 0; hct/weight/standardWeight required and positive (standard
  is the division denominator). A scalar fuzz arg -> valid:false.

## A11y / keyboard notes
- Number/checkbox/select inputs each labeled; output aria-live="polite". 320px sweep,
  no hscroll.

## Defects opened
- none
