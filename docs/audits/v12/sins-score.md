# v12 audit - sins-score

- Auditor: CG
- Date: 2026-06-23
- Citation re-verified against: Fisher CG, DiPaola CP, Ryken TC, et al. A novel classification system for spinal instability in neoplastic disease. Spine. 2010;35(22):E1221-E1229 (cross-verified against the Fisher reliability paper PMC3995991 and MDCalc /calc/10548).

`lib/spine-v146.js sinsScore()` consumes the six radiographic/clinical components
(location, mechanical pain, bone lesion, alignment, vertebral-body collapse,
posterolateral element involvement) and computes the total 0-18 with the
published stability band. Class A.

## Source-governance notes
- Six components sum 0-18: location (junctional 3 / mobile 2 / semirigid 1 /
  rigid 0), mechanical pain (3 / occasional 1 / none 0), lesion (lytic 2 / mixed
  1 / blastic 0), alignment (subluxation 4 / deformity 2 / normal 0), collapse
  (>50% 3 / <50% 2 / no collapse but >50% involved 1 / none 0), posterolateral
  (bilateral 3 / unilateral 1 / none 0).
- Bands: 0-6 stable, 7-12 indeterminate (potentially unstable), 13-18 unstable;
  a 7-18 score warrants a surgical / spine-oncology consult.
- A blank component renders the complete-the-fields fallback, never a partial
  total scored as if a missing component were zero.

## Boundary worked examples added
- total 6 -> stable; 7 -> indeterminate (6->7 flip).
- total 12 -> indeterminate; 13 -> unstable (12->13 flip).
- ceiling 18.

## Edge-input handling notes
- Six required selects; unrecognized keys ignored. Total is a bounded integer
  0-18 -- no non-finite path. Covered by the spec-v59 fuzz harness.

## A11y / keyboard notes
- Six labeled selects (leading blank placeholder); output aria-live="polite".
  320px sweep, no hscroll.

## Defects opened
- none
