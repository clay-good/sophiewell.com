# v12 audit - digifab-dosing

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: Smith TW, Butler VP Jr, Haber E, et al. N Engl J Med. 1982;307(22):1357-1362 (product-label dosing basis).

`lib/tox-v110.js digifabDosing()` computes the DigiFab vial count in three modes:
by amount ingested (vials = amount x 0.8 / 0.5, rounded up), by steady-state serum
level (vials = level x weight / 100, rounded up), or empiric (acute 10-20, chronic
3-6). Class A.

## Boundary worked examples added
- level mode: 4.5 ng/mL x 70 kg / 100 = 3.15 -> 4 vials.
- amount mode: 5 mg x 0.8 / 0.5 = 8 vials.
- band flip: the same body burden gives a different vial count by mode.
- empiric acute is 10-20, chronic is 3-6.
- rounds up at the fractional boundary; exact whole values are not bumped.

## Cross-implementation differential
- Reference: the 0.8 bioavailability, 0.5 mg-bound-per-vial, and /100 level
  divisor cross-verified against the product label and MDCalc. Match. PASS.

## Edge-input handling notes
- a dosing aid carrying the second-check caveat; zero / blank / negative weight,
  level, or amount returns a surfaced fallback, never a dose.

## A11y / keyboard notes
- Labeled mode select + numeric level/weight/amount inputs + empiric select;
  output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
