# v12 audit - gahs

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Forrest EH, Evans CD, Stewart S, et al. Gut. 2005;54(8):1174-1179 (re-fetched; the banded point table cross-read across the Forrest 2007 corticosteroid paper PMC2095721, GlobalRPH, and Gastrotraining, all in agreement on the 5-12 range).

`lib/hep-v125.js gahs()` sums five banded items -- age (< 50 = 1, >= 50 = 2), WBC
(< 15 = 1, >= 15 = 2), urea in mmol/L (< 5 = 1, >= 5 = 2), INR (< 1.5 = 1, 1.5-2.0 =
2, > 2.0 = 3), bilirubin in micromol/L (< 125 = 1, 125-250 = 2, > 250 = 3) -- total
5-12. >= 9 marks higher mortality and steroid benefit. Class A (fixed banded points;
journal+author citation, no ISSUER_PATTERN trip -- no docs/citation-staleness.md row).

## Boundary worked examples added
- all minimum bands -> 5/12, not flagged.
- all maximum bands -> 12/12, >= 9 flagged.
- the >= 9 band-flip (8 vs 9).
- SI bilirubin band: umol/L cutoffs 125/250 (200 -> +2, 300 -> +3).
- non-positive / missing -> valid:false.

## Cross-implementation differential
- Reference: UNIT TRAP captured -- urea is in mmol/L (cutoff 5) and bilirubin in
  micromol/L (cutoffs 125/250), UK/SI units, NOT BUN mg/dL or bilirubin mg/dL; the
  renderer labels both with their SI units. Range 5-12 (the stray "6-13" in one
  secondary source is an arithmetic error and is NOT followed). Match. PASS.

## Edge-input handling notes
- Five number inputs in SI units; all required and positive or the tile surfaces a
  complete-the-fields fallback. A scalar fuzz arg -> valid:false.

## A11y / keyboard notes
- Five labeled number inputs; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
