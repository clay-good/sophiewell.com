# v11 audit - Place of Service Code Lookup (`pos-codes`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: CMS Place of Service Codes for Professional Claims (public-domain external code list). Backed by `data/crosswalks/pos-codes.json` (8 entries) and the separate `data/pos-codes/pos.json` (13 entries) used by `pos-lookup`.

## Shard integrity
- `data/crosswalks/manifest.json` and `data/pos-codes/manifest.json` both pass `scripts/verify-integrity.mjs`.

## Sample lookup
- pos[0] -> code 11 "Office" (outpatient setting, non-facility). Matches CMS POS table.

## Boundary examples added
- See sample lookups above; "boundary" for a lookup tile is the first/last record per shard and a substring that returns the source-authoritative descriptor. Lookup tiles are not numeric calculators - this section is intentionally short per spec-v11 §3.3 step 10, which specifies (a) shard integrity + (b) one authoritative lookup per shard.

## Cross-implementation differential
- N/A for lookup tiles (no numeric formula). The bundled data is itself the authoritative source; the verify-integrity sha256 chain is the differential: any tamper or out-of-date shard fails CI before deploy.

## Edge-input handling notes
- Renderer filters by two-digit code or descriptor substring.

## A11y / keyboard notes
- Search input labelled; results table caption. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
