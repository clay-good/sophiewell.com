# v11 audit - mnutric

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Rahman A, Hasan RM, Agarwala R, Martin C, Day AG, Heyland DK. *Identifying critically-ill patients who will benefit most from nutritional therapy: further validation of the "modified NUTRIC" nutritional risk assessment tool.* Clin Nutr. 2016;35(1):158-162. Same as NUTRIC but IL-6 omitted; range 0-9; cutoff >=5.

`lib/scoring-v4.js mnutric()` reuses the Heyland 2011 band logic and drops the IL-6 component per Rahman 2016.

## Boundary examples added
- low (tile example): age 55, APACHE 18, SOFA 6, 1 comorbidity, 0 days -> 3 of 9.
- threshold: age 60 (1), APACHE 22 (2), SOFA 7 (1), 3 comorb (1), 0 days -> 5 (high).
- high (maximum): age 80 (2), APACHE 30 (3), SOFA 12 (2), 5 comorb (1), 5 days (1) -> 9 of 9.

## Cross-implementation differential
- Reference: Rahman 2016 §Methods (NUTRIC minus IL-6 row).
- Test case: age 60, APACHE 22, SOFA 7, 3 comorbidities, 0 days.
- Sophie result: 5; high band.
- Reference result: 1+2+1+1+0 = 5; >=5 cutoff. PASS.

## Edge-input handling notes
- Five inputs only; IL-6 omitted.

## A11y / keyboard notes
- Five labeled number inputs; Tab-reachable. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
