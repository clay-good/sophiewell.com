# v11 audit - Place of Service Code Lookup (CMS) (`pos-lookup`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: CMS Place of Service Codes for Professional Claims (full list, public-domain). `data/pos-codes/manifest.json` recordCount 13, single shard (`pos.json`).

## Shard integrity
- `scripts/verify-integrity.mjs` confirms sha256 match.

## Sample lookup
- pos[0] -> 11 "Office", outpatient setting, non-facility designation. Matches CMS POS table authoritative entries.

## Boundary examples added
- See sample lookups above; "boundary" for a lookup tile is the first/last record per shard and a substring that returns the source-authoritative descriptor. Lookup tiles are not numeric calculators - this section is intentionally short per spec-v11 §3.3 step 10, which specifies (a) shard integrity + (b) one authoritative lookup per shard.

## Cross-implementation differential
- N/A for lookup tiles (no numeric formula). The bundled data is itself the authoritative source; the verify-integrity sha256 chain is the differential: any tamper or out-of-date shard fails CI before deploy.

## Edge-input handling notes
- The richer POS tile (this one) includes setting and facility/non-facility designation for each code. The lighter `pos-codes` tile uses a smaller crosswalk subset for quick lookup.
- Filter by code or descriptor substring.

## A11y / keyboard notes
- Search input labelled; results table caption. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
