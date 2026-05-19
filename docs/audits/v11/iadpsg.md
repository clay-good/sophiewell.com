# v11 audit - iadpsg

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: International Association of Diabetes and Pregnancy Study Groups Consensus Panel. *International association of diabetes and pregnancy study groups recommendations on the diagnosis and classification of hyperglycemia in pregnancy.* Diabetes Care. 2010;33(3):676-682. 75-g 2-h OGTT cutoffs (mg/dL): fasting 92, 1-h 180, 2-h 153. GDM diagnosed if >=1 value exceeds.

`lib/scoring-v4.js iadpsg()` evaluates three OGTT timepoints against published IADPSG 2010 cutoffs using `>=`. Ships side by side with `carpenter-coustan` so a clinician can choose the protocol that matches their institution's screening guidelines, per spec-v15 §3.1.6.

## Boundary examples added
- 0 abnormal (tile example: F 85 / 1h 160 / 2h 140) -> not diagnostic of GDM.
- 1 abnormal (F 95 only) -> GDM (single-value cutoff is the published rule).
- 3 abnormal (all exceed) -> GDM.
- Exactly at cutoff (F 92) -> abnormal (>=).
- One below cutoff (F 91, others normal) -> not diagnostic.

## Cross-implementation differential
- Reference: IADPSG 2010 Consensus Panel §Diagnostic Criteria.
- Test case: F 95, 1h 160, 2h 145 -> 1 of 3 exceed -> GDM.
- Sophie result: 1 of 3 exceeded, GDM band.
- Reference: same. PASS.

## Edge-input handling notes
- Number() coercion: blank/non-numeric -> NaN -> comparison false -> not flagged.
- IADPSG single-value rule produces GDM diagnosis at first abnormal; differs from Carpenter-Coustan's two-value rule. The two tiles ship side by side for clinician choice per local protocol.

## A11y / keyboard notes
- Three labeled numeric inputs with default placeholders; cutoff reference muted line; Tab-reachable; aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
