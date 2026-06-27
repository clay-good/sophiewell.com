# v12 audit - stool-osmotic-gap

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Eherer AJ, Fordtran JS. Gastroenterology. 1992;103(2):545-551 (formula and band thresholds cross-verified against standard GI references; ≥ 2 sources, spec-v97).

`lib/oneformula-v167.js stoolOsmoticGap()` computes the Stool Osmotic Gap. Group E, Class A.

## Source-governance notes
- gap = 290 − 2·(stool Na + stool K), fixed 290 mOsm/kg assumption.
- > 100 osmotic, < 50 secretory, 50–100 indeterminate.
- Na/K accept 0 within [0,200]; the secretory/osmotic boundaries are unit-tested.

## Boundary worked examples added
- Na 30, K 15 → gap 200 osmotic; Na 65, K 65 → 30 secretory; gap 50/100 indeterminate, 102 osmotic; blank → valid:false.

## Edge-input handling notes
- fixed-290 assumption surfaced; gap range-checked to [−200,290]. Blank/non-finite inputs surface a complete-the-fields fallback; covered by the spec-v59 fuzz harness with zero non-finite leaks.

## A11y / keyboard notes
- Two labelled number inputs; output aria-live. 320px sweep, no horizontal scroll.

## Defects opened
- none

## Status
- PASS
