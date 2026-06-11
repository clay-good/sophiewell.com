# v11 audit - ttkg

- Auditor: CG
- Date: 2026-06-06 (spec-v55)
- Citation re-verified against: Halperin ML, Kamel KS. Kidney Int. 1998;53(5):1313-1327. TTKG = (urine K / plasma K) / (urine osm / plasma osm). Interpretable only when urine osm > plasma osm AND urine Na > 25 mEq/L.

`lib/clinical-v6.js ttkg()` enforces the two interpretability preconditions as a *surfaced guard* (returns valid:false + note) rather than computing on invalid conditions. When valid, it returns TTKG and a hypo-/hyperkalemia-context band.

spec-v68 correction: the hypokalemia interpretation threshold was 2 (label "TTKG >2-4") but the tile's own committed spec-v19 3.2.4 documents the contract as "hypokalemia: TTKG >3 suggests renal K wasting" (Ethier 1990). Aligned the code to the spec -- now a clean <3 (appropriate conservation) / >3 (renal wasting) split, mirroring the structurally-identical <7 / >7 hyperkalemia pair. The committed boundary example (TTKG 6.4) and the META example are both >3, so neither changed; the 2-3 zone now reads as appropriate conservation instead of wasting.

## Boundary examples added
- hypokalemia wasting: uK 40, pK 3.0, uOsm 600, pOsm 290, uNa 40 -> 6.4 (renal K wasting; >3).
- hypokalemia conservation (spec-v68 zone): uK 17, pK 3.0, uOsm 580, pOsm 290, uNa 40 -> 2.8 (<3, appropriate conservation; was "wasting" under the old threshold of 2).
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
