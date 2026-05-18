# v11 audit - HAS-BLED (`hasbled`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: Pisters R, Lane DA, Nieuwlaat R, de Vos CB, Crijns HJGM, Lip GYH. *A novel user-friendly score (HAS-BLED) to assess 1-year risk of major bleeding in patients with atrial fibrillation: the Euro Heart Survey.* Chest. 2010;138(5):1093-1100.

Point assignments verified literal against Pisters 2010 Table 3: hypertension (uncontrolled SBP > 160) 1, abnormal renal function 1, abnormal liver function 1, prior stroke 1, prior bleeding 1, labile INR 1, age > 65 = 1, drugs (antiplatelets/NSAIDs) 1, alcohol (>= 8 drinks/wk) 1. Total range 0-9. `lib/clinical.js hasBled()` and `HASBLED_ITEMS` implement this verbatim.

## Boundary examples added
- low: no risk factors -> 0 (Low; ~1.13 bleeds/100 pt-yr per Pisters 2010 Table 5).
- mid: META example (hypertension + age > 65) -> 2 (Moderate; ~1.88/100 pt-yr).
- high: hypertension + abnormal renal + abnormal liver + stroke + bleeding + labile INR + age > 65 + drugs + alcohol -> 9 (High; bleeding risk ~12.5/100 pt-yr; Pisters 2010 caps Table 5 at >= 5 with single category for highest stratum).

Band thresholds: total >= 3 = High, 1-2 = Moderate, 0 = Low, per Pisters 2010 §Discussion ("a score of >= 3 indicates high risk").

## Cross-implementation differential
- Reference implementation: Pisters 2010 Chest Table 3 point assignments + Table 5 bleed-rate column.
- Test case: META example (hypertension + age > 65).
- Sophie result: 2, Moderate.
- Reference result: 2 (1+1 per Table 3); Moderate by the >= 3 = High threshold.
- Delta: 0%. PASS.

## Edge-input handling notes
- Inputs are checkboxes; nothing to validate beyond present/absent.
- The "drugs" checkbox label clarifies "antiplatelets or NSAIDs" per the source; the "alcohol" checkbox clarifies ">= 8 drinks/week" per the source. This prevents the most common transcription error (counting any alcohol intake or any concomitant medication).
- Output uses `aria-live="polite"` so the score and band re-announce together.

## A11y / keyboard notes
- Nine labeled checkboxes, Tab-reachable in source order, label-bound. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
