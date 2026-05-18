# v11 audit - Claim Adjustment Reason Code Lookup (`carc`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: X12 Claim Adjustment Reason Codes (public external code list maintained by WPC/X12, used on the 835 remittance and EOB). `data/crosswalks/carc.json` (8 entries).

## Shard integrity
- `data/crosswalks/manifest.json` passes `scripts/verify-integrity.mjs`.

## Sample lookup
- carc[0] -> code 1 "Deductible amount." Matches X12 CARC list authoritative descriptor.

## Boundary examples added
- See sample lookups above; "boundary" for a lookup tile is the first/last record per shard and a substring that returns the source-authoritative descriptor. Lookup tiles are not numeric calculators - this section is intentionally short per spec-v11 §3.3 step 10, which specifies (a) shard integrity + (b) one authoritative lookup per shard.

## Cross-implementation differential
- N/A for lookup tiles (no numeric formula). The bundled data is itself the authoritative source; the verify-integrity sha256 chain is the differential: any tamper or out-of-date shard fails CI before deploy.

## Edge-input handling notes
- Filter by numeric code or descriptor substring.

## A11y / keyboard notes
- Search input labelled; results table caption. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
