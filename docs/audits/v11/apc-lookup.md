# v11 audit - APC / HOPPS Lookup (`apc-lookup`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: CMS OPPS APC Addendum (Outpatient Prospective Payment System, public-domain). `data/apc/manifest.json` recordCount 5, single shard (`apc.json`).

## Shard integrity
- `scripts/verify-integrity.mjs` confirms sha256 match.

## Sample lookup
- apc.json[0] -> APC 5012 "Level 2 Examinations and Related Services", status indicator V, relative weight 1.07, payment rate 87.10. Matches CMS OPPS Addendum A/B structure.

## Boundary examples added
- See sample lookups above; "boundary" for a lookup tile is the first/last record per shard and a substring that returns the source-authoritative descriptor. Lookup tiles are not numeric calculators - this section is intentionally short per spec-v11 §3.3 step 10, which specifies (a) shard integrity + (b) one authoritative lookup per shard.

## Cross-implementation differential
- N/A for lookup tiles (no numeric formula). The bundled data is itself the authoritative source; the verify-integrity sha256 chain is the differential: any tamper or out-of-date shard fails CI before deploy.

## Edge-input handling notes
- Each record includes APC number, title, status indicator (e.g. V, Q, T per OPPS), relative weight, and payment rate — all from the CMS OPPS Addendum.
- Filter by APC code or title substring.

## A11y / keyboard notes
- Table with caption; columns labelled. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
