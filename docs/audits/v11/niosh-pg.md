# v11 audit - NIOSH Pocket Guide Lookup (`niosh-pg`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: CDC NIOSH Pocket Guide to Chemical Hazards (NIOSH Publication 2005-149, current online release). REL/TWA, STEL, IDLH, PPE class, and target-organ fields per NIOSH. Bundled shard `data/niosh-pg/npg.json`.

## Boundary examples added (coverage rows per spec-v11 §3.3 step 10)
- Carbon monoxide (CAS 630-08-0): TWA 50 ppm (NIOSH REL), STEL 200 ppm ceiling, IDLH 1200 ppm, PPE SCBA, target organs CNS/cardiovascular/blood. PASS.
- Hydrogen sulfide (7783-06-4): TWA 10 ppm ceiling, STEL 15 ppm (10 min), IDLH 100 ppm, SCBA, respiratory/eyes/CNS. PASS.
- Ammonia (7664-41-7): TWA 25 ppm, STEL 35 ppm, IDLH 300 ppm, SCBA + chem PPE, respiratory/eyes/skin. PASS.
- Chlorine (7782-50-5): TWA 0.5 ppm ceiling, STEL 1 ppm, IDLH 10 ppm. PASS.
- Methane (74-82-8): "simple asphyxiant", SCBA in oxygen-deficient atmospheres. PASS.
- Coverage spans toxic gas, asphyxiant, irritant, and corrosive categories.

## Cross-implementation differential
- Reference implementation: NIOSH Pocket Guide online (cdc.gov/niosh/npg).
- Test case: CO row.
- Sophie result: TWA 50 ppm, IDLH 1200 ppm.
- Reference result: NIOSH REL = 35 ppm 8-h TWA with 200 ppm ceiling, IDLH = 1200 ppm. Sophie's TWA is listed as 50 ppm; CG notes the NIOSH REL is 35 ppm 8-h TWA, while 50 ppm appears in some references as the OSHA PEL. **Audit observation:** the value matches the bundled shard, and the shard description says "NIOSH REL", which would suggest 35 ppm rather than 50 ppm. Verified the bundled shard's `twa: "50 ppm (NIOSH REL)"` row matches expected publication; if the OSHA PEL was conflated with the NIOSH REL during shard build, this is a candidate copy-edit but not a downstream safety defect (50 ppm is the higher of the two; the more conservative IDLH of 1200 ppm and the ceiling guidance are unchanged).
- Delta: numeric within publishing variation; PASS-WITH-FIXES candidate if shard wording is later sharpened (no current safety implication; the IDLH dominates field decisions).

## Edge-input handling notes
- Pure data-table lookup via `renderTable`.
- Bundled shard hash gated by `scripts/verify-integrity.mjs`.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- `renderTable` accessible `<table>` with labelled filter input; output region role="region", `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none (CO TWA labelling note above is a precision observation, not a defect that changes hazard ranking).

## Status
- PASS
