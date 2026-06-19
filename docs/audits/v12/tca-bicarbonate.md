# v12 audit - tca-bicarbonate

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: Boehnert MT, Lovejoy FH Jr. N Engl J Med. 1985;313(8):474-479.

`lib/tox-v110.js tcaBicarbonate()` bands TCA-toxicity risk by maximal QRS (>= 100 ms
seizure risk, >= 160 ms ventricular-arrhythmia risk) and computes the
sodium-bicarbonate bolus 1-2 mEq/kg from weight, target serum pH 7.45-7.55.
Class A.

## Boundary worked examples added
- QRS 120 ms at 70 kg: seizure risk, 70-140 mEq.
- band flip: QRS crosses 100 then 160 ms into successive risk bands.
- the abnormal flag is set at and above 100 ms.
- the bolus scales with weight (1-2 mEq/kg).
- zero / blank / negative weight or a missing QRS returns a surfaced fallback.

## Cross-implementation differential
- Reference: the 100 ms / 160 ms QRS thresholds and the 1-2 mEq/kg target
  cross-verified against the Boehnert paper and MDCalc. Match. PASS.

## Edge-input handling notes
- a dosing aid carrying the second-check caveat; the bolus and pH ceiling stay
  with the clinician.

## A11y / keyboard notes
- Labeled QRS / weight inputs; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
