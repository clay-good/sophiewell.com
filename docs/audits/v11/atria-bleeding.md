# v11 audit - atria-bleeding

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Fang MC, Go AS, Chang Y, et al. *A new risk scheme to predict warfarin-associated hemorrhage. The ATRIA (Anticoagulation and Risk Factors in Atrial Fibrillation) Study.* J Am Coll Cardiol. 2011;58(4):395-401. Five weighted criteria (anemia +3, severe renal disease eGFR <30 +3, age >=75 +2, prior bleeding +1, hypertension +1); sum 0-10; bands 0-3 low, 4 intermediate, 5-10 high (annual major-bleed rates 0.8% / 2.6% / 5.8% per Fang 2011 Table 3).

`lib/scoring-v4.js atriaBleeding()` is a pure sum of five 0/weighted-int contributions, returning per-input subscores in `parts` and a band citing Fang 2011 Table 3. All five inputs are interpreted as truthy/falsy booleans so a stray `undefined` cannot drift a contribution.

## Boundary examples added
- 0 of 10 (no risk factors; tile example) -> low risk 0.8%/yr per Fang 2011.
- 4 of 10 (anemia + renal disease - represented as severe renal disease + hypertension... clinically: severe renal +3, hypertension +1) -> intermediate 2.6%/yr.
- 10 of 10 (every criterion) -> high 5.8%/yr per Fang 2011 (5-10 band).
- 5 of 10 boundary -> high band.
- 3 of 10 boundary -> low band (upper edge of 0-3).

## Cross-implementation differential
- Reference: Fang 2011 Table 3 worked through manually.
- Test case: anemia (3) + age >=75 (2) = 5 -> high band, 5.8%/yr.
- Sophie result: 5 of 10, high band.
- Reference: same. PASS.

## Edge-input handling notes
- Inputs interpreted strictly via `x ? weight : 0` so non-boolean truthy/falsy values are coerced consistently.
- No numeric inputs => no NaN / out-of-range slider concerns.

## A11y / keyboard notes
- Five labeled checkboxes; Tab-reachable; aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
