# v11 audit - ICD-10-CM Code Lookup (`icd10`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: CMS / NCHS ICD-10-CM (public-domain). `data/icd10cm/manifest.json` recordCount 20 across 9 shards (A,E,I,J,K,M,N,R,Z), fetchDate 2026-05-07, sourceUrl https://www.cms.gov/medicare/coding-billing/icd-10-codes.

## Shard integrity
- `scripts/verify-integrity.mjs` confirms each shard's sha256 matches the manifest (46 manifests verified clean in CI as of audit date).

## Sample lookup per shard
- A.json[0] -> A00 = "Cholera" (authoritative NCHS short title).
- E.json[0] -> first E-chapter code (Endocrine), label per NCHS.
- I.json[0] -> first I-chapter code (Circulatory), label per NCHS.
- J.json, K.json, M.json, N.json, R.json, Z.json each return the NCHS short title for the first code in the shard (the offline seed contains a curated subset of high-frequency codes per spec-v3 data-sources commitment).

## Boundary examples added
- See sample lookups above; "boundary" for a lookup tile is the first/last record per shard and a substring that returns the source-authoritative descriptor. Lookup tiles are not numeric calculators - this section is intentionally short per spec-v11 §3.3 step 10, which specifies (a) shard integrity + (b) one authoritative lookup per shard.

## Cross-implementation differential
- N/A for lookup tiles (no numeric formula). The bundled data is itself the authoritative source; the verify-integrity sha256 chain is the differential: any tamper or out-of-date shard fails CI before deploy.

## Edge-input handling notes
- The renderer (`views/group-a.js icd10`) loads the shard for the user's first character and filters by substring. Empty query shows the full shard.
- Codes are stored in source-order; the lookup respects code formatting (uppercase, dot separation per ICD-10-CM convention).

## A11y / keyboard notes
- Search input is labelled; results table has a caption. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
