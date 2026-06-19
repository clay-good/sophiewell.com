# v12 audit - ich-volume-abc2

- Auditor: CG
- Date: 2026-06-19
- Citation re-verified against: Kothari RU, Brott T, Broderick JP, et al. The ABCs of measuring intracerebral hemorrhage volumes. Stroke. 1996;27(8):1304-1305 (re-fetched; cross-read with MDCalc calc/3802 and the ICH-score derivation that consumes the >= 30 mL threshold).

`lib/neuro-v117.js ichVolumeAbc2()` computes the hematoma volume by the ellipsoid
approximation A x B x C / 2 with the three orthogonal diameters in cm (mL out).
A volume >= 30 mL is flagged as meeting the ICH-score threshold (Hemphill 2001).
Class A (fixed geometric formula).

## Boundary worked examples added
- 5 x 4 x 3 cm -> 30 mL, crossing the ICH-score >= 30 mL threshold (band flip up).
- 3 x 2 x 2 cm -> 6 mL, below the threshold (band flip down).
- a missing diameter renders a complete-the-fields fallback.
- a negative diameter is rejected (never a volume from a bad sign).
- zero diameters compute a valid 0 mL volume.

## Cross-implementation differential
- Reference: the ABC/2 formula and the cm -> mL convention are identical across
  Kothari 1996 and MDCalc. The 30 mL flag mirrors the ICH-score input threshold
  exactly. Match. PASS.

## Edge-input handling notes
- A, B, C are required, non-negative, finite-guarded; a blank or negative
  diameter returns a surfaced valid:false fallback rather than a volume from NaN.
  The /2 division is always safe. An extreme (1e9 cm) product stays finite
  (no Infinity leak) and is reported as a large finite volume.

## A11y / keyboard notes
- Three labeled number inputs (step 0.1); output aria-live="polite". 320px
  sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
