# v11 audit - blood-compat

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: American Association of Blood Banks (AABB) / Association for the Advancement of Blood & Biotherapies. *Standards for Blood Banks and Transfusion Services*, 33rd ed., 2024. AABB Technical Manual, 20th ed., 2020. PRBC compatibility encodes both ABO and Rh; FFP / plasma compatibility encodes ABO only (Rh is not a plasma compatibility factor); platelets and cryoprecipitate are non-strict (ABO-identical preferred; any ABO acceptable in emergency).

`lib/scoring-v4.js bloodCompat()` accepts `{recipient, product}` and returns `{product, recipient, compatibleDonors, emergencyRelease, text}`.

## Boundary examples added
- PRBC recipient O- -> only O-.
- PRBC recipient AB+ -> all 8 ABO/Rh types.
- PRBC recipient A+ -> O-, O+, A-, A+.
- PRBC recipient B- -> O-, B-.
- FFP recipient AB+ -> AB only.
- FFP recipient O- -> any ABO (O / A / B / AB).
- FFP recipient A+ -> A or AB.
- Platelets returns the AABB non-strict note (ABO-identical preferred).
- Cryo returns the AABB non-strict note (any ABO acceptable).

## Cross-implementation differential
- Reference: AABB 33rd-ed PRBC compatibility table.
- Sophie result: matches across all eight PRBC recipient ABO/Rh cases. AABB plasma compatibility table also matches. PASS.

## Edge-input handling notes
- Unknown recipient or product throws with a clear message.

## A11y / keyboard notes
- Two labeled selects; Tab-reachable; aria-live result region.

## Defects opened
- none

## Status
- PASS
