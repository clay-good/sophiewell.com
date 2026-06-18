# v12 audit - bova-pe

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: Bova C, Sanchez O, Prandoni P, et al. Eur Respir J. 2014;44(3):694-703.

`lib/vte-v106.js bovaPe()` sums the four weighted items (sBP 90-100 +2, troponin +2,
RV dysfunction +2, HR >= 110 +1) to a total clamped 0-7 and maps it to Stage I/II/III
with the published 30-day complication and PE-related mortality framing. Class A.

## Boundary worked examples added
- no items -> 0, Stage I (~4.4% complications, ~3.1% mortality).
- band flip: total 4 (Stage II) -> 5 (Stage III, > 4).
- Stage II lower edge at 3 (troponin + HR).
- all four items clamp to the published 0-7 maximum (Stage III).

## Cross-implementation differential
- Reference: items/points cross-verified against MDCalc and The Hospitalist; the
  stage outcomes (4.4% / 18% / 42% complications; 3.1% / 6.8% / 10.5% mortality)
  triangulated against the Bova 2014 paper and its validation literature. The
  published score is 0-7 (MDCalc's interface max of 9 sums all items at face value,
  but the categorical staging caps Stage III at "> 4"). We implement the 0-7 staging.
  Match. PASS.

## Edge-input handling notes
- normotensive, confirmed PE only -- the note states the population; the tile does
  not infer hemodynamic status.

## A11y / keyboard notes
- Labeled checkboxes; output aria-live="polite". 320px sweep passes with no
  horizontal scroll. An intermediate-risk stratifier, not a disposition order.

## Defects opened
- none

## Status
- PASS
