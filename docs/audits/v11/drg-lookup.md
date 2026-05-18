# v11 audit - MS-DRG Lookup (`drg-lookup`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: CMS IPPS MS-DRG Final Rule (public-domain). `data/drg/manifest.json` recordCount 8, single shard (`drg.json`).

## Shard integrity
- `scripts/verify-integrity.mjs` confirms sha256 match.

## Sample lookup
- drg.json[0] -> DRG 291 "Heart failure & shock w MCC", MDC 05, relative weight 1.4327, GMLOS 4.4 days, AMLOS 5.4 days. Matches CMS IPPS Final Rule MS-DRG table.

## Boundary examples added
- See sample lookups above; "boundary" for a lookup tile is the first/last record per shard and a substring that returns the source-authoritative descriptor. Lookup tiles are not numeric calculators - this section is intentionally short per spec-v11 §3.3 step 10, which specifies (a) shard integrity + (b) one authoritative lookup per shard.

## Cross-implementation differential
- N/A for lookup tiles (no numeric formula). The bundled data is itself the authoritative source; the verify-integrity sha256 chain is the differential: any tamper or out-of-date shard fails CI before deploy.

## Edge-input handling notes
- Each record carries DRG number, MS-DRG title, MDC (Major Diagnostic Category), relative weight (RW), geometric mean LOS, and arithmetic mean LOS — all four authoritative columns from the CMS IPPS Final Rule.
- Filter by code or title substring.

## A11y / keyboard notes
- Table with caption; columns labelled. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
