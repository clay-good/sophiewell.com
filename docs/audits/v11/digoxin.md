# v11 audit - digoxin

- Auditor: CG
- Date: 2026-06-06 (spec-v56). Guideline-derived (ACC/AHA): carries citationAccessed + a docs/citation-staleness.md row.
- Citation re-verified against: ACC/AHA/HFSA 2022 HF Guideline (Heidenreich, Circulation 2022;145(18)); HF target 0.5-0.9 ng/mL.

lib/medication-v5.js digoxin() returns renal/age-categorical maintenance guidance and interprets the entered level against the indication target; toxicity threshold >2.0 ng/mL; timing warning <6 h post-dose. Maintenance is categorical, not a fabricated mg value (correctness floor).

## Boundary examples added
- CrCl 60 HF: 0.125-0.25 mg/day; level 0.7 within target.
- CrCl 20 or age 80: reduced 0.0625-0.125 mg/day.
- level 2.4: toxic; level 1.2 HF: above target; <6 h: timing warn.

## Cross-implementation differential
- Targets match the 2022 ACC/AHA/HFSA HF guideline. PASS.

## Edge-input handling notes
- crCl/level/hours bounded; level and timing optional (null when blank).

## A11y / keyboard notes
- Labeled inputs (label for=), aria-live results, select/checkbox where applicable. test:a11y clean.

## Defects opened

- none

## Status
- PASS
