# v12 audit - abi

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: Aboyans V, Criqui MH, Abraham P, et al. Circulation. 2012;126(24):2890-2909.

`lib/vascular-v105.js abi()` divides each leg's higher ankle systolic pressure by
the higher of the two brachial systolic pressures, reads the PAD band off the
2-decimal rounded ratio, and reports the lower (governing) leg index. Class A
(arithmetic ratio + fixed bands).

## Boundary worked examples added
- 0.90 -> mild-to-moderate PAD; 0.91 -> borderline (band flip at the published edge).
- 1.10 normal; > 1.40 non-compressible; <= 0.40 severe PAD.
- higher brachial is the divisor (130 not 100 when both arms entered).
- divide-by-zero guard: blank / zero brachial returns valid:false, not ankle/0.
- no ankle measured returns valid:false.
- fuzz: object-aware matrix, no non-finite leak.

## Cross-implementation differential
- Reference: the AHA scientific-statement ABI bands (Aboyans 2012), cross-checked
  against MDCalc and the ESC PAD guideline band set. Match. PASS.

## Edge-input handling notes
- pos() guards each pressure; the band is read from the rounded value so the shown
  index matches its band; non-compressible vessels are flagged to use a toe-brachial
  index instead.

## A11y / keyboard notes
- Labeled number inputs; output aria-live="polite". 320px sweep passes with no
  horizontal scroll. Decision support, not a revascularization order.

## Defects opened
- none

## Status
- PASS
