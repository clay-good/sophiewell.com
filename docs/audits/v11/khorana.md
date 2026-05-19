# v11 audit - khorana

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Khorana AA, Kuderer NM, Culakova E, Lyman GH, Francis CW. *Development and validation of a predictive model for chemotherapy-associated thrombosis.* Blood. 2008;111(10):4902-4907. Five criteria: site of cancer (very-high risk e.g. stomach/pancreas +2; high risk e.g. lung/lymphoma/gynecologic/bladder/testicular +1; other 0), platelet count >=350 +1, Hb <10 or ESA use +1, WBC >11 +1, BMI >=35 +1. Sum 0-6. 2.5-month VTE rates per Khorana 2008 Table 3: 0 -> 0.3% (low), 1-2 -> 2.0% (intermediate), >=3 -> 6.7% (high).

`lib/scoring-v4.js khorana()` sums the published weights. Cancer site is modeled as a mutually-exclusive select (`'very-high' / 'high' / 'other'`) so a clinician cannot double-count both bands; unknown values default to 0 ("other").

## Boundary examples added
- 0 of 6 (no risk factors, "other" cancer; tile example) -> low (0.3%).
- 1 of 6 (high-risk cancer alone) -> intermediate band 2.0%.
- 2 of 6 (very-high cancer alone) -> intermediate band (1-2).
- 3 of 6 (very-high cancer + platelet) -> high band 6.7%.
- 6 of 6 (every factor at maximum) -> high band.

## Cross-implementation differential
- Reference: Khorana 2008 Table 3 worked through manually.
- Test case: very-high cancer (2) + platelet (1) = 3 -> high band.
- Sophie result: 3 of 6, high band 6.7%.
- Reference: same. PASS.

## Edge-input handling notes
- Cancer site select defaults to 'other' (0); unrecognized strings contribute 0.
- All boolean inputs interpreted via `x ? weight : 0`.

## A11y / keyboard notes
- One labeled select + four labeled checkboxes; Tab-reachable; aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
