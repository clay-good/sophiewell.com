# v12 audit - pospom

- Auditor: CG
- Date: 2026-06-17
- Citation re-verified against: Le Manach Y, Collins G, Rodseth R, et al. Preoperative Score to Predict Postoperative Mortality (POSPOM): derivation and validation. Anesthesiology. 2016;124(3):570-579.

`lib/periop-v97.js pospom()` sums age-band points + comorbidity points (15 named comorbidities) + procedure-category points and maps the total to the published predicted in-hospital mortality. The age table, comorbidity points, procedure points, and the points->mortality lookup were transcribed verbatim from Supplemental Digital Content 3 of the original paper (Oxford open-access accepted manuscript) and spot-verified against the supplemental source text.

## Boundary worked examples added
- age 70 (66-70 -> 10) + cancer (4) + major-GI (16) = 30 -> 7.403% (SDC 3).
- floor: age 18 (0) + ophthalmologic (0) = 0 -> < 0.001%.
- table value: age 45 (5) + CHF (4) + major-GI (16) = 25 -> 1.732%.
- ceiling: a total >= 51 reports > 97.865% (off the published table).

## Cross-implementation differential
- Reference: SDC 3 age/comorbidity/surgery point tables and the total->mortality mapping. Match. PASS.

## Edge-input handling notes
- Age and procedure category required; an unknown comorbidity key contributes 0, never NaN. Age clamped to [18, 120]. The points->mortality array is keyed so index total-1 is the value for that total; total 0 and total >= 51 are handled explicitly. Fuzz harness covers the module; zero non-finite leaks.

## A11y / keyboard notes
- Age numeric input + procedure select + 15 labeled comorbidity checkboxes; output aria-live="polite". 320px sweep passes with no horizontal scroll. A preoperative estimate, not a guarantee.

## Defects opened
- none

## Status
- PASS
