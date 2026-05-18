# v11 audit - Pediatric Cardiac Arrest Drug Reference (`peds-arrest-ref`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: AHA ECC 2020 PALS guidelines (Topjian AA et al. Circulation. 2020;142(suppl 2):S469-S523), numeric drug-dose facts only. Bundled shard `data/aha-reference/aha-reference.json` `pediatricArrest` array. Flowcharts not reproduced.

## Boundary examples added (coverage rows per spec-v11 §3.3 step 10)
- Epinephrine pediatric: 0.01 mg/kg IV/IO (max 1 mg) q3-5 min, any-rhythm arrest. PASS (matches AHA PALS 2020).
- Amiodarone pediatric: 5 mg/kg IV/IO bolus (max 300 mg), may repeat up to total 15 mg/kg for refractory VF/pVT. PASS.
- Atropine pediatric (when included in bundled shard): 0.02 mg/kg, min 0.1 mg, max 0.5 mg. PASS.
- Coverage spans all rows present in `pediatricArrest`; the audit walked each row against the PALS 2020 table.

## Cross-implementation differential
- Reference implementation: AHA PALS Provider Manual (2020) pediatric arrest medication table.
- Test case: amiodarone bolus row.
- Sophie result: 5 mg/kg IV/IO, max 300 mg.
- Reference result: 5 mg/kg IV/IO, max 300 mg.
- Delta: 0%. PASS.

## Edge-input handling notes
- Pure data-render tile; no numeric inputs.
- The dosing notation explicitly carries the per-kg numerator and max cap so the reader cannot misread "5 mg" as a flat adult-style dose.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Single accessible table; muted attribution / edition lines surround it. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
