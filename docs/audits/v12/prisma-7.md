# v12 audit - prisma-7

- Auditor: CG
- Date: 2026-06-29
- Citation re-verified against: Raiche M, Hebert R, Dubois MF. PRISMA-7: a case-finding tool to identify older adults with moderate to severe disabilities. Arch Gerontol Geriatr. 2008;47(1):9-18. The 7 items, the reverse-scored support item ("can you count on someone close" scores on "no"), 0-7 total, and the >= 3 cutoff cross-verified against the PRISMA-7 user guide (>= 2 sources, spec-v97).

`lib/ltcga-v177.js prisma7()` sums the 7 items to 0-7. Group G, Class A.

## Source-governance notes
- Items: age > 85; male; health problems limiting activities; needs help regularly; health problems requiring staying home; cannot count on someone close (reverse-scored, +1 on "no"); uses a mobility aid. Total 0-7; >= 3 flags. Journal issuer; does not trip ISSUER_PATTERN; no citation-staleness row.

## Boundary worked examples added
- all-low 0; support item reverse-scored (cannot count -> +1); 2 negative and 3 positive (the >= 3 cut flip); blank -> valid:false.

## Edge-input handling notes
- All 7 yes/no required; blank -> valid:false; never NaN (spec-v59 fuzz pass).
