# v12 audit - pasi

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Fredriksson T, Pettersson U. Severe psoriasis — oral therapy with a new retinoid. Dermatologica. 1978;157(4):238-244 (formula, region weights, and area-grade mapping cross-verified against DermNet "PASI score" and a peer-reviewed PASI methods guide; ≥ 2 independent sources, spec-v97).

`lib/derm-v151.js pasi()` consumes per-region erythema/induration/desquamation
(each 0-4) and the % area involved for the four body regions, maps each % to the
0-6 area grade, and computes PASI = Σ (E+I+D) × area × region weight with the
published interpretive band. Class A.

## Source-governance notes
- Region weights head 0.1, upper limbs 0.2, trunk 0.3, lower limbs 0.4 (sum 1.0).
- The per-sign scale is 0-4 (FIVE levels) — NOT 0-3 like EASI/SCORAD; a common
  transcription trap. Cross-verified.
- Area grade from %: 0 -> 0, 1-9 -> 1, 10-29 -> 2, 30-49 -> 3, 50-69 -> 4,
  70-89 -> 5, 90-100 -> 6.
- Range 0-72; common bands mild < 10, moderate 10-20, severe > 20.

## Boundary worked examples added
- region-weight worked total 16.2 (moderate); area-grade %-mapping boundaries;
  mild/moderate at 10 and moderate/severe at 20; max all-severe full-area = 72.

## Edge-input handling notes
- A blank/invalid severity is treated as 0 and a blank area as 0% (grade 0), so
  the weighted sum is always finite; covered by the spec-v59 fuzz harness, zero
  non-finite leaks.

## A11y / keyboard notes
- Twelve labeled severity selects + four % number inputs; output aria-live. 320px
  sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
