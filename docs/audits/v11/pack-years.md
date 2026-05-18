# v11 audit - Pack-Years (`pack-years`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Standard tobacco-history measure as used by the USPSTF, CDC, and AAFP: pack-years = (packs per day) * (years smoked). One pack = 20 cigarettes (US standard).

`lib/clinical.js packYears()` implements the product directly, rounded to one decimal.

## Boundary examples added
- low (light user): 0.25 packs/day * 5 years = 1.25 pack-years.
- mid (META example): 1.5 packs/day * 20 years = 30 pack-years.
- high (heavy long-term): 2 packs/day * 40 years = 80 pack-years.
- zero (never-smoker): 0 packs/day or 0 years -> 0 pack-years.

## Cross-implementation differential
- Reference: USPSTF lung-cancer-screening worksheet (the >=20-pack-year + age 50-80 + current/former-within-15-years rule).
- Test case: META example. Sophie 30 / reference 1.5 * 20 = 30. Delta 0%. PASS.

## Edge-input handling notes
- Both inputs validated `min: 0`. Multi-pack-equivalent inputs (e.g. "2.5") allow fractional packs.
- The tile does not surface the USPSTF screening eligibility threshold (>=20 pack-years for the current 2021 USPSTF lung-cancer screening recommendation) directly in the result text — that would be Sophie-authored guidance per spec-v11 §5.3. The citation copy notes the USPSTF use case so users can self-reference.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Two labelled number inputs. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
