# v11 audit - rosier

- Auditor: CG
- Date: 2026-05-22
- Citation re-verified against: Nor AM, Davis J, Sen B, Shipsey D, Louw SJ, Dyker AG, Davis M, Ford GA. *The Recognition of Stroke in the Emergency Room (ROSIER) scale: development and validation of a stroke recognition instrument.* Lancet Neurol. 2005;4(11):727-734. Seven binary items: two stroke-mimic items each subtract 1 (LOC/syncope, seizure activity), five focal-deficit items each add 1 (facial weakness, arm weakness, leg weakness, speech disturbance, visual-field defect). Total range -2 to +5. Stroke is likely when total > 0 (sensitivity 93%, specificity 83% in the derivation cohort).

`lib/scoring-v4.js rosier()` validates each of the seven items as boolean, sums with the correct signs to a -2..+5 total, and returns `strokeLikely: score > 0` plus the Nor 2005 band.

## Boundary examples added

- Score 0 (tile example, all-false) -> low probability of stroke.
- Score 1 (single focal-deficit item) -> stroke likely (lower edge of stroke-likely band).
- Score -1 (LOC alone) -> low probability.
- Score -2 (LOC + seizure, both mimics) -> low probability (minimum).
- Score 0 (LOC + arm weakness, one focal + one mimic) -> low probability.
- Score +5 (all five focal-deficit items, no mimic) -> stroke likely (maximum).

## Cross-implementation differential

- Reference: Nor 2005 reports the >0 threshold with sensitivity 93% / specificity 83%; the same threshold appears in the published ROSIER form in routine ED use.
- Sophie result: ROSIER 0 returns `strokeLikely: false`; ROSIER 1 returns `strokeLikely: true`. PASS against Nor 2005's >0 cutoff.
- Per-item sign cross-check: the two mimic items (LOC/syncope, seizure) are weighted -1, the five focal items are weighted +1. Confirmed against the Nor 2005 Table 2 form.

## Edge-input handling notes

- Non-boolean inputs throw (numeric 0/1 or string "yes" not accepted; this is a strict-typing guardrail per spec-v11 §3.1 step 4).
- Missing items throw (every item must be specified).

## A11y / keyboard notes

- Seven checkboxes, each labeled with the item name and explicit ±1 weight; aria-live result region wraps the tile output. `npm run test:a11y` clean.

## Defects opened

- none

## Status

- PASS
