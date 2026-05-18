# v11 audit - Revenue Code Table (NUBC summary) (`rev-table`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: NUBC UB-04 revenue codes (numeric-only summary; NUBC descriptive narrative not bundled). `data/revenue-codes/manifest.json` recordCount 10, single shard (`revenue.json`).

## Shard integrity
- `scripts/verify-integrity.mjs` confirms sha256 match.

## Sample lookup
- revenue.json[0] -> 0250 "Pharmacy" category "Pharmacy" typicalPairing "General pharmacy". Matches NUBC UB-04 revenue-code summary numeric reference.

## Boundary examples added
- See sample lookups above; "boundary" for a lookup tile is the first/last record per shard and a substring that returns the source-authoritative descriptor. Lookup tiles are not numeric calculators - this section is intentionally short per spec-v11 §3.3 step 10, which specifies (a) shard integrity + (b) one authoritative lookup per shard.

## Cross-implementation differential
- N/A for lookup tiles (no numeric formula). The bundled data is itself the authoritative source; the verify-integrity sha256 chain is the differential: any tamper or out-of-date shard fails CI before deploy.

## Edge-input handling notes
- The fuller `rev-table` tile shows a structured table of NUBC revenue-code categories with the four-digit code, category, and typical pairing — a slightly richer view than the smaller `revenue-codes` crosswalk tile.

## A11y / keyboard notes
- Table caption present; rows are keyboard-navigable via Tab to search filter. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
