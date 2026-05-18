# v11 audit - ICD-10-PCS Lookup (`pcs-lookup`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: CMS ICD-10-PCS (public-domain, inpatient procedure coding). `data/icd10-pcs/manifest.json` recordCount 5, single shard (`pcs.json`).

## Shard integrity
- `scripts/verify-integrity.mjs` confirms sha256 match.

## Sample lookup
- pcs.json[0] -> 0DTJ4ZZ "Resection of Appendix, Percutaneous Endoscopic" (section: Medical and Surgical; body system: Gastrointestinal; operation: Resection). Each component matches the CMS ICD-10-PCS reference manual structure for the 7-character PCS code positions.

## Boundary examples added
- See sample lookups above; "boundary" for a lookup tile is the first/last record per shard and a substring that returns the source-authoritative descriptor. Lookup tiles are not numeric calculators - this section is intentionally short per spec-v11 §3.3 step 10, which specifies (a) shard integrity + (b) one authoritative lookup per shard.

## Cross-implementation differential
- N/A for lookup tiles (no numeric formula). The bundled data is itself the authoritative source; the verify-integrity sha256 chain is the differential: any tamper or out-of-date shard fails CI before deploy.

## Edge-input handling notes
- The renderer surfaces the seven-character PCS code, the section, body system, root operation, and full description — all from the CMS reference.
- Filter by code or description substring.

## A11y / keyboard notes
- Search input labelled; results table caption. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
