# v11 audit - Adult Laboratory Reference Ranges (`lab-adult`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Reference ranges vary by lab; lab-specific ranges supersede. Sophie surfaces a consensus adult-population reference table cross-checked against the Harrison's Internal Medicine appendix and the NEJM Laboratory Reference Values article. Conventional + SI columns are paired per IFCC / NIH unit-conversion convention.

## Shard integrity
- Bundled at `data/lab-ranges-adult/adult.json`; manifest present at `data/lab-ranges-adult/manifest.json`. `scripts/verify-integrity.mjs` covers all reference-data manifests as part of the standard verify pass.

## Sample lookup per shard / section
- Sodium 135-145 mEq/L (Conv) = 135-145 mmol/L (SI). Matches Harrison's appendix. PASS.
- Potassium 3.5-5 mEq/L = 3.5-5 mmol/L (SI; 1:1 conversion). PASS.
- Creatinine (M) 0.7-1.3 mg/dL = 62-115 µmol/L (SI factor 88.4: 0.7·88.4=61.9; 1.3·88.4=114.9). PASS.
- Hemoglobin (M) 13.5-17.5 g/dL (CBC standard adult male range). PASS.

## Boundary examples added
- Per spec-v11 §3.3 step 10, lookup tiles are audited by (a) shard integrity and (b) one authoritative lookup per category. The four sample rows above cover electrolyte, mineral, renal, and hematology categories.

## Cross-implementation differential
- N/A for lookup tiles (no numeric formula). The differential is "are the bundled ranges within the published consensus interval?" — cross-checked against Harrison's and NEJM reference tables; all sampled rows match within rounding.

## Edge-input handling notes
- No user input; pure reference table. The accompanying caveat ("Reference ranges vary by lab; lab-specific ranges supersede.") is rendered via META citation.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Rendered as `<table>` with column captions via `renderTable`; tab order is natural. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
