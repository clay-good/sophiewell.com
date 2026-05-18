# v11 audit - HCPCS Level II Code Lookup (`hcpcs`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: CMS HCPCS Level II (public-domain). `data/hcpcs/manifest.json` recordCount 10, single shard (`hcpcs.json`), fetchDate 2026-05-07.

## Shard integrity
- `scripts/verify-integrity.mjs` confirms sha256 match (clean).

## Sample lookup
- hcpcs.json[0] -> A0428 = short "Ambulance service, BLS, non-emergency"; long "Ambulance service, basic life support, non-emergency transport." (CMS HCPCS Level II authoritative descriptors).
- Verified against the CMS HCPCS Level II Alphanumeric Index for A-series ambulance codes.

## Boundary examples added
- See sample lookups above; "boundary" for a lookup tile is the first/last record per shard and a substring that returns the source-authoritative descriptor. Lookup tiles are not numeric calculators - this section is intentionally short per spec-v11 §3.3 step 10, which specifies (a) shard integrity + (b) one authoritative lookup per shard.

## Cross-implementation differential
- N/A for lookup tiles (no numeric formula). The bundled data is itself the authoritative source; the verify-integrity sha256 chain is the differential: any tamper or out-of-date shard fails CI before deploy.

## Edge-input handling notes
- The renderer filters HCPCS records by substring on the code or descriptor; case-insensitive.
- HCPCS codes are alphanumeric (single letter + 4 digits); the renderer preserves that formatting.

## A11y / keyboard notes
- Search input labelled; results table has a caption. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
