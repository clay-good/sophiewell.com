# v11 audit - driving-pressure

- Auditor: CG
- Date: 2026-06-06 (spec-v55)
- Citation re-verified against: Amato MBP, et al. NEJM. 2015;372(8):747-755. dP = plateau - PEEP; static compliance = Vt / dP; dynamic compliance = Vt / (peak - PEEP). dP <=15 cmH2O is the lung-protective target.

`lib/clinical-v6.js drivingPressure()` returns dP, static compliance, dynamic compliance (when peak given), and the target band. A plateau <= PEEP returns a surfaced guard, not a number.

## Boundary examples added
- at target: plateau 25, PEEP 10, Vt 400 -> dP 15, Cstat 26.7 (within target).
- above target + dynamic: plateau 30, PEEP 5, Vt 420, peak 35 -> dP 25, Cstat 16.8, Cdyn 14.
- low: plateau 20, PEEP 8, Vt 450 -> dP 12, Cstat 37.5.
- invalid: plateau 10 <= PEEP 12 -> null with guard note.

## Cross-implementation differential
- Hand-calc dP 25-10 = 15; Cstat 400/15 = 26.67 -> 26.7. Sophie 26.7. PASS.

## Edge-input handling notes
- dP <= 0 returns null compliances with a surfaced note (no divide-by-zero); peak optional.

## A11y / keyboard notes
- Four labeled inputs (peak optional), aria-live results. test:a11y clean.

## Defects opened

- none

## Status
- PASS
