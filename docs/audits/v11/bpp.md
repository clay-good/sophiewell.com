# v11 audit - bpp

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Manning FA, Platt LD, Sipos L. *Antepartum fetal evaluation: development of a fetal biophysical profile.* Am J Obstet Gynecol. 1980;136(6):787-795. Five components each scored 0 (absent) or 2 (present per Manning 1980 rubric): fetal breathing movements, fetal body movements, fetal tone, amniotic fluid volume, reactive NST. Sum 0-10. Bands per Manning 1980 + ACOG Practice Bulletin 145 (2014): 8-10 normal, 6 equivocal, <=4 abnormal.

`lib/scoring-v4.js bpp()` sums five 0/2 component contributions. Each input is coerced to 2 if truthy, else 0; the binary 0/2 scoring (no intermediate +1) matches Manning 1980's published rubric.

## Boundary examples added
- 10 of 10 (all present; tile example) -> normal band.
- 8 of 10 (one component absent) -> normal band (lower edge of 8-10).
- 6 of 10 (two components absent) -> equivocal band.
- 4 of 10 (three components absent) -> abnormal band (upper edge of <=4).
- 0 of 10 (none present) -> abnormal band.

## Cross-implementation differential
- Reference: Manning 1980 worked through manually.
- Test case: breathing + movement + tone present (2+2+2=6, AF and NST absent) -> 6, equivocal.
- Sophie result: BPP 6 of 10, equivocal band.
- Reference: same. PASS.

## Edge-input handling notes
- Each input interpreted via truthy-2-else-0 so non-boolean values are coerced consistently.

## A11y / keyboard notes
- Five labeled checkboxes; Tab-reachable; aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
