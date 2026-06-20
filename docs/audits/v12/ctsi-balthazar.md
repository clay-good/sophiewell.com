# v12 audit - ctsi-balthazar

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Balthazar EJ, Robinson DL, Megibow AJ, Ranson JH. Radiology. 1990;174(2):331-336 (re-fetched; grade and necrosis points cross-read across PMC11336560 and Radiopaedia).

`lib/gi-v126.js ctsiBalthazar()` sums the CT grade (A-E -> 0-4) and necrosis (none 0,
<= 30% 2, 30-50% 4, > 50% 6) to 0-10. Bands 0-3 mild, 4-6 moderate, 7-10 severe. Class
A (journal+author citation, no ISSUER_PATTERN trip -- no docs/citation-staleness.md row).

## Boundary worked examples added
- grade E + > 50% necrosis -> 10, severe.
- mild band 0-3.
- moderate band 4-6.
- clamps; scalar fuzz arg -> 0.

## Cross-implementation differential
- Reference: A-E = 0-4 and necrosis 0/2/4/6 confirmed; the FPNotebook 33% outlier is
  NOT used (30%/50% bands per Balthazar). Match. PASS.

## Edge-input handling notes
- Two selects (grade 0-4, necrosis 0/2/4/6); total clamped 0-10. A scalar fuzz arg -> 0.

## A11y / keyboard notes
- Two labeled selects; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
