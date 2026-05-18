# v11 audit - Therapeutic Drug Monitoring Levels (`tdm-levels`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Target / peak / trough therapeutic-monitoring ranges per FDA-approved labeling (DailyMed) and standard pharmacology references (Goodman & Gilman, AHFS Drug Information). Institutional protocols and assay-specific ranges supersede.

## Shard integrity
- Bundled at `data/therapeutic-drug-levels/levels.json`; manifest present at `data/therapeutic-drug-levels/manifest.json`. Covered by `scripts/verify-integrity.mjs`.

## Sample lookup per shard / section
- Vancomycin (trough) 10-20 mcg/mL — matches IDSA / ASHP 2020 vancomycin therapeutic-monitoring guideline. PASS.
- Digoxin 0.8-2 ng/mL — matches the standard heart-failure / AFib digoxin range; 0.5-0.9 is sometimes used for HF per DIG trial, the 0.8-2 surfaced here is the broader FDA-labeled therapeutic range. PASS.
- Lithium 0.6-1.2 mEq/L — matches FDA-labeled maintenance range. PASS.
- Phenytoin (total) 10-20 mcg/mL — matches FDA-labeled therapeutic range. PASS.

## Boundary examples added
- Per spec-v11 §3.3 step 10, lookup tiles are audited by (a) shard integrity and (b) one authoritative lookup per category. The four rows above cover antibiotic-trough, cardiac-glycoside, mood-stabilizer, and anticonvulsant categories.

## Cross-implementation differential
- N/A for lookup tiles. The differential is "do the bundled ranges match FDA labeling / society guidelines?" — cross-checked; all sampled rows match within published intervals.

## Edge-input handling notes
- No user input; pure reference table. The renderer surfaces only the Drug + Low + High + Units columns from the bundled JSON.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- `renderTable` semantic `<table>`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
