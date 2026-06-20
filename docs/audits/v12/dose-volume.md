# v12 audit - dose-volume

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: first-principles dosing arithmetic (volume = dose / concentration); logic cross-checked with the roughlogic.com computeDrugConcentration reference port.

`lib/ems-v149.js doseVolume()` computes the bolus draw-up volume (mL) = ordered dose (mg)
/ stock concentration (mg/mL), with an optional weight x per-kg-dose derivation of the
ordered dose. It is distinct from conc-rate, which solves an infusion rate in mL/hr.
Class A (first-principles arithmetic; no issuer -- no docs/citation-staleness.md row).

## Boundary worked examples added
- 25 mg from 50 mg/mL -> 0.5 mL.
- weight 20 kg x 1 mg/kg, 10 mg/mL -> 2 mL, with the derivation string.
- 600 mg / 10 mg/mL -> 60 mL, large-draw flag.
- 0.04 mg / 1 mg/mL -> tuberculin-syringe flag.
- concentration 0 or negative -> invalid.
- explicitly zeroed dose -> prompt, never "draw 0 mL".
- no dose and no weight/per-kg -> invalid prompt, no NaN.

## Cross-implementation differential
- Reference: roughlogic computeDrugConcentration uses the same volume = dose /
  concentration relation, the same weight x per-kg derivation, and the same > 50 mL /
  < 0.05 mL verification flags. Match. PASS.

## Edge-input handling notes
- Non-positive concentration and non-positive / explicitly-zeroed dose return prompts
  rather than a "draw 0 mL" output (the DR-14 guard from the source port). A non-finite
  volume returns an out-of-range prompt. A scalar / non-object fuzz arg yields an invalid
  result, never a NaN.

## A11y / keyboard notes
- Four labeled number inputs (two optional); output aria-live="polite". 320px sweep, no
  hscroll.

## Defects opened
- none

## Status
- PASS
