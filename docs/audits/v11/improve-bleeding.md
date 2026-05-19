# v11 audit - improve-bleeding

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Decousus H, Tapson VF, Bergmann JF, et al. *Factors at admission associated with bleeding risk in medical patients: findings from the IMPROVE investigators.* Chest. 2011;139(1):69-79. Weighted criteria: active gastroduodenal ulcer +4.5, bleeding in 3 months prior +4, platelet <50 +4, age >=85 +3.5, hepatic failure +2.5, severe renal failure +2.5, ICU/CCU +2.5, central venous catheter +2, rheumatic disease +2, active cancer +2, age 40-84 +1.5, moderate renal failure +1, male +1. Cutoff >=7 = high bleeding risk -> favor mechanical over pharmacologic prophylaxis.

`lib/scoring-v4.js improveBleeding()` sums the published weights. Age and renal-failure are modeled as mutually-exclusive category strings (`'<40'/'40-84'/'>=85'` and `'none'/'moderate'/'severe'`) so a clinician cannot double-count a 92-year-old as both "40-84" and ">=85"; unknown values default to 0 per Decousus 2011's missing-data convention. The sum is non-integer (fractional weights 0.5 and 1.5 are published); the renderer formats one decimal place when needed.

## Boundary examples added
- All-zero (tile example) -> 0, not high bleeding risk.
- score 7 boundary (age >=85 (3.5) + hepatic failure (2.5) + male (1) = 7) -> high bleeding risk band.
- score 6.5 (just below cutoff: age >=85 (3.5) + severe renal (2.5) + male (0.5? no, male=1 -> 7); use age 40-84 (1.5) + hepatic (2.5) + ICU (2.5) = 6.5) -> not high.
- score 30.5 (every criterion at maximum) -> high.
- non-integer formatting: age 40-84 alone -> '1.5' rendered as "1.5".

## Cross-implementation differential
- Reference: Decousus 2011 Table 4 worked through manually.
- Test case: active ulcer (4.5) + age >=85 (3.5) = 8 -> high bleeding risk.
- Sophie result: 8, high band.
- Reference: same. PASS.

## Edge-input handling notes
- Age and renal-failure category selects default to the published baseline ('<40' and 'none' = 0); an unrecognized string contributes 0.
- All boolean inputs interpreted via `x ? weight : 0`.

## A11y / keyboard notes
- Two labeled select elements + nine labeled checkboxes; Tab-reachable; aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
