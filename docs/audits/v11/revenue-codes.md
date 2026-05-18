# v11 audit - Revenue Code Lookup (`revenue-codes`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: CMS UB-04 Revenue Codes (NUBC numeric-only reference; descriptive narrative is NUBC-licensed and not bundled). `data/crosswalks/revenue-codes.json` (8 entries).

## Shard integrity
- `data/crosswalks/manifest.json` passes `scripts/verify-integrity.mjs`.

## Sample lookup
- revenue-codes[0] -> code 0250 category "Pharmacy" typicalPairing "General pharmacy". Matches NUBC UB-04 revenue-code listing.

## Boundary examples added
- See sample lookups above; "boundary" for a lookup tile is the first/last record per shard and a substring that returns the source-authoritative descriptor. Lookup tiles are not numeric calculators - this section is intentionally short per spec-v11 §3.3 step 10, which specifies (a) shard integrity + (b) one authoritative lookup per shard.

## Cross-implementation differential
- N/A for lookup tiles (no numeric formula). The bundled data is itself the authoritative source; the verify-integrity sha256 chain is the differential: any tamper or out-of-date shard fails CI before deploy.

## Edge-input handling notes
- Substring filter on four-digit code or category name. Sophie deliberately renders only the NUBC numeric codes and category labels (no NUBC-licensed long descriptors) consistent with spec-v2 licensing posture.
- The separate `rev-table` tile (NUBC numeric summary) is the more comprehensive same-data view.

## A11y / keyboard notes
- Search input labelled; results table caption. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
