# v11 audit - digoxin

- Auditor: CG
- Date: 2026-06-11 (spec-v69 re-audit: indication-aware "below" threshold). Original audit 2026-06-06 (spec-v56). Guideline-derived (ACC/AHA): carries citationAccessed + a docs/citation-staleness.md row.
- Citation re-verified against: ACC/AHA/HFSA 2022 HF Guideline (Heidenreich, Circulation 2022;145(18)); HF target 0.5-0.9 ng/mL. AF rate-control therapeutic range 0.8-2.0 ng/mL (the band the function and renderer already commit to; self-consistency, no new citation).

lib/medication-v5.js digoxin() returns renal/age-categorical maintenance guidance and interprets the entered level against the indication target; toxicity threshold >2.0 ng/mL; timing warning <6 h post-dose. Maintenance is categorical, not a fabricated mg value (correctness floor).

## Boundary examples added
- CrCl 60 HF: 0.125-0.25 mg/day; level 0.7 within target (HF 0.5 floor).
- CrCl 20 or age 80: reduced 0.0625-0.125 mg/day.
- level 2.4: toxic; level 1.2 HF: above target; <6 h: timing warn.
- **spec-v69 rate-control band**: indication=af, level 0.7 (in [0.5, 0.8)) now reads "below 0.8-2.0 ng/mL (rate control)" — before v69 it fell through to "within", contradicting the printed target. level 0.9 reads "within". HF 0.7 unchanged (still "within", 0.5 floor preserved).

## Cross-implementation differential
- HF targets match the 2022 ACC/AHA/HFSA HF guideline (0.5-0.9 ng/mL). PASS.
- spec-v69: the "below target" threshold is now indication-aware (HF floor 0.5, rate-control floor 0.8), matching the function's own printed target band for each indication; the previously-untested rate-control level path is now covered. PASS-WITH-FIXES.

## Edge-input handling notes
- crCl/level/hours bounded; level and timing optional (null when blank).

## A11y / keyboard notes
- Labeled inputs (label for=), aria-live results, select/checkbox where applicable. test:a11y clean.

## Defects opened

- spec-v69 (fixed this PR): the rate-control ("af") "below target" threshold was hardcoded to the HF floor of 0.5, so a rate-control level of 0.6-0.7 ng/mL rendered "within 0.8-2.0 ng/mL (rate control)", contradicting the function's own printed target. Fixed by deriving an indication-aware `targetLow` (0.5 HF / 0.8 rate control). Root cause: the rate-control level path had no unit test (every prior level test used indication=hf); +3 tests added.

## Status
- PASS-WITH-FIXES
