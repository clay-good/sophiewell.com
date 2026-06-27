# v12 audit - calcium-phosphate-product

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: KDIGO CKD-MBD Work Group. KDIGO clinical practice guideline for CKD-MBD. Kidney Int Suppl. 2009;(113):S1-130 (updated 2017); historical target KDOQI 2003 (cross-verified against the KDIGO 2017 summary and the KDOQI 2003 targets review PMC2696636; >= 2 sources, spec-v97).

`lib/endo-metab-v161.js calciumPhosphateProduct()` computes Ca x PO4. Group E,
Class A. KDIGO trips the issuer-acronym pattern, so a documentation-only
docs/citation-staleness.md row is carried.

## Source-governance notes
- Product = serum Ca (mg/dL) x serum PO4 (mg/dL), in mg^2/dL^2. Historical
  caution threshold > 55 (KDOQI 2003). Contemporary KDIGO guidance favors tracking
  calcium and phosphate individually over the product, surfaced so the tile does
  not imply a retired product target.
- SI conversion: Ca mg/dL = mmol/L x 4.008, PO4 mg/dL = mmol/L x 3.097.

## Boundary worked examples added
- the tile example (9.5 x 6.0 = 57, above 55); at/below 55 not flagged; the SI
  mmol/L toggle converts before multiplying; blank/non-positive -> valid:false.

## Edge-input handling notes
- Each lab is finite and > 0; a blank surfaces a complete-the-fields fallback.
  Covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- A unit select + two labelled number inputs; output aria-live. 320px sweep, no
  horizontal scroll.

## Defects opened
- none

## Status
- PASS
