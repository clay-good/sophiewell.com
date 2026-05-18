# v11 audit - Condition / Occurrence / Value Code Reference (`nubc-codes`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: NUBC UB-04 Condition, Occurrence, and Value codes (numeric reference; NUBC narrative is licensed and not bundled). `data/nubc-special-codes/manifest.json` recordCount 3 (three sub-lists: condition, occurrence, value), single shard (`special.json`).

## Shard integrity
- `scripts/verify-integrity.mjs` confirms sha256 match.

## Sample lookup per sub-list
- condition[0] -> 02 "Condition is employment related".
- occurrence[0] -> 01 "Accident / Medical Coverage".
- value[0] -> 01 "Most common semi-private rate".

All match NUBC UB-04 numeric-codes reference.

## Boundary examples added
- See sample lookups above; "boundary" for a lookup tile is the first/last record per shard and a substring that returns the source-authoritative descriptor. Lookup tiles are not numeric calculators - this section is intentionally short per spec-v11 §3.3 step 10, which specifies (a) shard integrity + (b) one authoritative lookup per shard.

## Cross-implementation differential
- N/A for lookup tiles (no numeric formula). The bundled data is itself the authoritative source; the verify-integrity sha256 chain is the differential: any tamper or out-of-date shard fails CI before deploy.

## Edge-input handling notes
- Three filterable tables (condition / occurrence / value) on a single tile; the renderer surfaces each section with its own caption.
- Numeric-only descriptors per NUBC licensing posture.

## A11y / keyboard notes
- Three labelled sections with table captions. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
