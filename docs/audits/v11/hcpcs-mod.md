# v11 audit - HCPCS Modifier Lookup (`hcpcs-mod`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: CMS HCPCS Level II Modifier file (public-domain). `data/hcpcs-modifiers/manifest.json` recordCount 10, single shard (`modifiers.json`).

## Shard integrity
- `scripts/verify-integrity.mjs` confirms sha256 match.

## Sample lookup
- modifiers[0] -> modifier 25 "Significant, separately identifiable E/M service same day as procedure"; commonUse "E/M visit on the same day as a minor procedure"; pairingCaution "Documentation must support a distinct E/M." Matches CMS HCPCS Level II Modifier Listing.

## Boundary examples added
- See sample lookups above; "boundary" for a lookup tile is the first/last record per shard and a substring that returns the source-authoritative descriptor. Lookup tiles are not numeric calculators - this section is intentionally short per spec-v11 §3.3 step 10, which specifies (a) shard integrity + (b) one authoritative lookup per shard.

## Cross-implementation differential
- N/A for lookup tiles (no numeric formula). The bundled data is itself the authoritative source; the verify-integrity sha256 chain is the differential: any tamper or out-of-date shard fails CI before deploy.

## Edge-input handling notes
- Each record includes the source CMS descriptor plus a Sophie-authored common-use and pairing-caution note. The common-use / pairing-caution are reference-style notes (not Sophie-authored treatment guidance), consistent with spec-v11 §5.3.

## A11y / keyboard notes
- Search input labelled; results table caption. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
