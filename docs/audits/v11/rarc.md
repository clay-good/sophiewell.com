# v11 audit - Remittance Advice Remark Code Lookup (`rarc`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: X12 Remittance Advice Remark Codes (public WPC/X12 external code list). `data/crosswalks/rarc.json` (5 entries).

## Shard integrity
- `data/crosswalks/manifest.json` passes `scripts/verify-integrity.mjs`.

## Sample lookup
- rarc[0] -> M76 "Missing/incomplete/invalid diagnosis or condition." Matches X12 RARC list authoritative descriptor.

## Boundary examples added
- See sample lookups above; "boundary" for a lookup tile is the first/last record per shard and a substring that returns the source-authoritative descriptor. Lookup tiles are not numeric calculators - this section is intentionally short per spec-v11 §3.3 step 10, which specifies (a) shard integrity + (b) one authoritative lookup per shard.

## Cross-implementation differential
- N/A for lookup tiles (no numeric formula). The bundled data is itself the authoritative source; the verify-integrity sha256 chain is the differential: any tamper or out-of-date shard fails CI before deploy.

## Edge-input handling notes
- Substring filter on code or descriptor. RARC codes are typically letter-prefixed (M, N, MA, etc.); the renderer preserves source casing.

## A11y / keyboard notes
- Search input labelled; results table caption. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
