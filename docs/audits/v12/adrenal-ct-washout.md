# v12 audit - adrenal-ct-washout

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Caoili EM, Korobkin M, Francis IR, et al. Radiology. 2002;222(3):629-633 (APW/RPW formulas and thresholds cross-verified against standard adrenal-imaging references; ≥ 2 sources, spec-v97).

`lib/radiology-v165.js adrenalCtWashout()` computes the Adrenal CT Washout. Group E, Class A.

## Source-governance notes
- APW = (E − D)/(E − U) × 100 (≥ 60% lipid-poor adenoma); RPW = (E − D)/E × 100 (≥ 40% adenoma).
- Unenhanced ≤ 10 HU is flagged as a lipid-rich adenoma; HU values accept negative/zero (fat) within [−200,600].
- The (E − U) and E denominators are guarded — equal E/U or E=0 → valid:false, never a divide-by-zero.

## Boundary worked examples added
- E80/D35/U15 → APW 69.2% adenoma, RPW 56.3%; RPW-only path (no U); E=0 and E−U=0 → valid:false.

## Edge-input handling notes
- U optional (RPW path); APW vs RPW selection unit-tested; washout below threshold does not exclude an adenoma (noted). Blank/non-finite inputs surface a complete-the-fields fallback; covered by the spec-v59 fuzz harness with zero non-finite leaks.

## A11y / keyboard notes
- Three labelled HU number inputs (U optional); output aria-live. 320px sweep, no horizontal scroll.

## Defects opened
- none

## Status
- PASS
