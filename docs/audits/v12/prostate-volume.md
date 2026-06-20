# v12 audit - prostate-volume

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Terris MK, Stamey TA. J Urol. 1991;145(5):984-987. Cross-read against StatPearls NBK557495 / NBK567721 (prostate volume estimation) and the MDCalc prostate-volume convention.

`lib/uro-v130.js prostateVolume()` computes the prolate-ellipsoid volume = AP × TR × CC × 0.52, dimensions in cm, volume in cc (= mL). Class A (journal+author citation, no ISSUER_PATTERN trip — no docs/citation-staleness.md row).

## Source-governance / coefficient note
- The coefficient 0.52 is π/6 (0.5236) rounded to the dominant clinical/MDCalc convention;
  the alternative exact 0.5236 differs by ~0.7%. The 0.52 choice and the geometry are
  stated to the user in the tile note and the band ("AP x TR x CC x 0.52").
- The separate "bullet" coefficient 0.65 (small glands) is a different geometry and is
  deliberately not used here.
- A volume above ~30 cc is the conventional enlarged / BPH range and is the denominator
  for PSA density; the tile flags that band but frames it, not management.

## Boundary worked examples added
- 4 × 5 × 4 cm → 41.6 cc (enlarged, flagged).
- 2.5 × 3 × 3 cm → 11.7 cc (non-enlarged).
- any blank dimension → valid:false; zero dimension → valid:false; scalar → valid:false.

## Edge-input handling notes
- All three dimensions must be positive (pos); volume rounded to one decimal; band
  classified on the rounded volume so the shown number matches the enlarged call.

## A11y / keyboard notes
- Three number inputs each labeled; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
