# v11 audit - step-by-step

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Gomez B, Mintegi S, Bressan S, Da Dalt L, Gervaix A, Lacroix L, European Group for Validation of the Step-by-Step Approach. *Validation of the "Step-by-Step" approach in the management of young febrile infants.* Pediatrics. 2016;138(2):e20154381. Sequential decision tree per Gomez 2016 Figure 1: (1) unwell appearance -> HIGH; (2) age <=21 d -> HIGH; (3) abnormal urinalysis -> HIGH; (4) procalcitonin >=0.5 ng/mL -> HIGH; (5) CRP >20 mg/L or ANC >10 x10^9/L -> INTERMEDIATE; (6) otherwise -> LOW.

`lib/scoring-v4.js stepByStep()` walks the five decision steps in order and short-circuits on the first hit, returning the categorical risk plus a `reason` string identifying which step triggered. This preserves the published sequential structure (later steps are only evaluated when earlier ones are negative).

## Boundary examples added
- All negative (tile example) -> LOW (reason: all preceding steps negative).
- Unwell only -> HIGH (step 1 short-circuits).
- Age <=21 d only -> HIGH (step 2).
- UA abnormal only -> HIGH (step 3).
- PCT >=0.5 only -> HIGH (step 4).
- CRP/ANC only -> INTERMEDIATE (step 5).
- All positive -> HIGH (step 1 short-circuits; later positives masked, as Gomez 2016 intends).

## Cross-implementation differential
- Reference: Gomez 2016 Figure 1.
- Test case: well + age 60 d + abnormal UA -> HIGH (step 3).
- Sophie result: risk 'high', reason 'abnormal urinalysis (leukocyturia)'.
- Reference: same. PASS.

## Edge-input handling notes
- Each step uses a boolean. The CRP/ANC step is exposed as a single OR-of-thresholds checkbox so the clinician resolves the threshold ahead of time per Gomez 2016 (which presents the two thresholds together).
- Sequential short-circuit means the first positive step wins; later positives are silenced, matching the published rubric.

## A11y / keyboard notes
- Five labeled checkboxes; Tab-reachable; aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
