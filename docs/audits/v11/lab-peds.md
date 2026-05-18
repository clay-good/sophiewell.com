# v11 audit - Pediatric Laboratory Reference Ranges (`lab-peds`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Pediatric laboratory reference ranges by age band per Nelson Textbook of Pediatrics (current edition) and Harriet Lane Handbook (current edition). Lab-specific reference ranges supersede.

## Shard integrity
- Bundled at `data/lab-ranges-peds/peds.json`; manifest present at `data/lab-ranges-peds/manifest.json`. Covered by `scripts/verify-integrity.mjs`.

## Sample lookup per shard / section
- Hemoglobin / Newborn 14-24 g/dL — matches Harriet Lane (newborn polycythemia range). PASS.
- Hemoglobin / Infant 10-13 g/dL — matches the physiologic-nadir range. PASS.
- Hemoglobin / Child 11.5-14.5 g/dL — matches the pediatric steady-state range. PASS.
- WBC / Newborn 9-30 ×10^3/µL — matches the neonatal WBC range from Harriet Lane. PASS.

## Boundary examples added
- Per spec-v11 §3.3 step 10, lookup tiles are audited by (a) shard integrity and (b) one authoritative lookup per category. The rows above cover the age-band axis (Newborn, Infant, Child) for hematology categories, which is the dimension that differentiates the peds table from `lab-adult`.

## Cross-implementation differential
- N/A for lookup tiles. The differential is "are the bundled bands within the Nelson / Harriet Lane published intervals?" — cross-checked; all sampled rows match within rounding.

## Edge-input handling notes
- No user input; pure reference table.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- `renderTable` produces a labelled `<table>` with Test, Age band, Low, High, Units columns. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
