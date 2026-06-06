# v11 audit - ttkg

- Auditor: CG
- Date: 2026-06-06 (spec-v55)
- Citation re-verified against: Halperin ML, Kamel KS. Kidney Int. 1998;53(5):1313-1327. TTKG = (urine K / plasma K) / (urine osm / plasma osm). Interpretable only when urine osm > plasma osm AND urine Na > 25 mEq/L.

`lib/clinical-v6.js ttkg()` enforces the two interpretability preconditions as a *surfaced guard* (returns valid:false + note) rather than computing on invalid conditions. When valid, it returns TTKG and a hypo-/hyperkalemia-context band.

## Boundary examples added
- hypokalemia wasting: uK 40, pK 3.0, uOsm 600, pOsm 290, uNa 40 -> 6.4 (renal K wasting).
- hyperkalemia impaired: uK 60, pK 6.0, uOsm 500, pOsm 290, uNa 40 -> 5.8 (impaired excretion).
- invalid (uOsm <= pOsm): uOsm 280, pOsm 290 -> guard, no number.
- invalid (uNa <= 25): uNa 20 -> guard, no number.

## Cross-implementation differential
- Hand-calc (40/3.0)/(600/290) = 13.33/2.069 = 6.44 -> 6.4. Sophie 6.4. PASS.

## Edge-input handling notes
- plasmaK floor 1, osm floors prevent divide-by-zero; the precondition guards are the primary safety surface.

## A11y / keyboard notes
- Five labeled inputs, aria-live results. test:a11y clean.

## Defects opened

- none

## Status
- PASS
