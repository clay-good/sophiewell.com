# v11 audit - peds-gcs

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Reilly PL, Simpson DA, Sprod R, Thomas L. *Assessing the conscious level in infants and young children: a paediatric version of the Glasgow Coma Scale.* Childs Nerv Syst. 1988;4(1):30-33. Verbal age-adjustment: James HE. *Neurologic evaluation and support in the child with an acute brain insult.* Pediatr Ann. 1986;15(1):16-22. Eye opening 1-4, age-adjusted verbal response 1-5 (under 2 / 2-5 / older), motor response 1-6. Sum 3-15. Severity bands same as adult GCS: <=8 severe, 9-12 moderate, 13-15 mild.

`lib/scoring-v4.js pedsGcs()` clamps eye to [1, 4], verbal to [1, 5], motor to [1, 6]. The age-band selector controls which verbal-scale rubric the clinician uses (under 2: cry/sounds; 2-5: word recognition; older: adult verbal scale), but the numeric weight ranges are identical -- the rubric mapping happens in the renderer label/help text, per James 1986.

## Boundary examples added
- 15 of 15 (tile example: eye 4 + verbal 5 + motor 6) -> mild band.
- 13 of 15 (lower edge of mild) -> mild.
- 12 of 15 (upper edge of moderate) -> moderate.
- 9 of 15 (lower edge of moderate) -> moderate.
- 8 of 15 (upper edge of severe) -> severe.
- 3 of 15 (min) -> severe.
- clamps: eye 99 -> 4, verbal -1 -> 1, motor 99 -> 6.

## Cross-implementation differential
- Reference: Reilly 1988 + James 1986.
- Test case: eye 3 + verbal 4 + motor 5 = 12 -> moderate.
- Sophie result: 12 of 15, moderate band.
- Reference: same. PASS.

## Edge-input handling notes
- Per-component clamp prevents out-of-range slider values from contaminating the sum.
- The age-band selector is a label-only modifier in this version; future spec amendments could split the verbal weights per age band if a published source diverges.

## A11y / keyboard notes
- One age-band select + three range inputs; Tab-reachable; aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
