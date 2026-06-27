# v12 audit - toe-brachial-index

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Aboyans V, Criqui MH, Abraham P, et al. Circulation. 2012;126(24):2890-2909 (TBI ratio and 0.70 threshold cross-verified against vascular-medicine references; ≥ 2 sources, spec-v97).

`lib/oneformula-v167.js toeBrachialIndex()` computes the Toe-Brachial Index. Group E, Class A.

## Source-governance notes
- TBI = toe systolic / higher brachial systolic; the brachial denominator is guarded.
- A TBI below 0.70 is abnormal (PAD); the test of choice when the ABI is non-compressible (> 1.40).
- The 0.70 boundary is unit-tested (0.69 abnormal, 0.70 not).

## Boundary worked examples added
- toe 50 / brachial 120 → 0.42 abnormal; 0.69 abnormal, 0.70 not; toe 100 / brachial 120 → 0.83 normal; zero brachial → valid:false.

## Edge-input handling notes
- toe/brachial guarded > 0; ratio range-checked. Blank/non-finite inputs surface a complete-the-fields fallback; covered by the spec-v59 fuzz harness with zero non-finite leaks.

## A11y / keyboard notes
- Two labelled number inputs; output aria-live. 320px sweep, no horizontal scroll.

## Defects opened
- none

## Status
- PASS
