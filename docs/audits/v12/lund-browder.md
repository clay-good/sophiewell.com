# v12 audit - lund-browder

- Auditor: CG
- Date: 2026-06-17
- Citation re-verified against: Lund CC, Browder NC. The estimation of areas of burns. Surg Gynecol Obstet. 1944;79:352-358.

`lib/idcrit-v99.js lundBrowder()` sums the age-adjusted Lund-Browder region percentages (head, thighs, lower legs vary with age; the rest are fixed) scaled by each region's burned fraction, and computes the adult Rule of Nines independently as a cross-check. Whole-region constants transcribed and cross-verified against the Joint Trauma System adult/pediatric charts; every age column sums to exactly 100%. Class A.

## Boundary worked examples added
- adult head + anterior trunk fully burned -> 20% TBSA, 25% Rule of Nines.
- infant head (19%) vs adult head (7%) shows the age adjustment.
- every region fully burned -> 100% on both methods.

## Cross-implementation differential
- Reference: the age-adjusted Lund-Browder chart and the adult Rule of Nines. Match. PASS.

## Edge-input handling notes
- Each region fraction clamped to [0,1]; a total above 100% is flagged, not silently capped; a blank age band surfaces valid:false. Fuzz harness covers the module.

## A11y / keyboard notes
- Labeled inputs; output aria-live="polite". 320px sweep passes with no horizontal scroll. Decision support, not a verdict.

## Defects opened
- none

## Status
- PASS
