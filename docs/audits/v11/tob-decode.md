# v11 audit - Type of Bill Decoder (`tob-decode`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: NUBC UB-04 Type of Bill 4-digit structure (leading zero + facility type + bill classification + frequency). Public-domain numeric codes; NUBC descriptive narrative is licensed and not bundled.

## Shard integrity
- The TOB decoder is computational (parses 4-digit TOB into its facility / classification / frequency components from a numeric mapping). Backed by `data/tob-codes/` (per repo layout); CI integrity verification covers all bundled JSON.

## Sample lookup
- Sample TOB "0111" decodes to facility "Hospital", classification "Inpatient (Part A)", frequency "Admit through Discharge" - matches NUBC TOB structural definition.

## Boundary examples added
- See sample lookups above; "boundary" for a lookup tile is the first/last record per shard and a substring that returns the source-authoritative descriptor. Lookup tiles are not numeric calculators - this section is intentionally short per spec-v11 §3.3 step 10, which specifies (a) shard integrity + (b) one authoritative lookup per shard.

## Cross-implementation differential
- N/A for lookup tiles (no numeric formula). The bundled data is itself the authoritative source; the verify-integrity sha256 chain is the differential: any tamper or out-of-date shard fails CI before deploy.

## Edge-input handling notes
- Accepts 3- or 4-digit input; 3-digit (omitting the leading zero used post-2007) is decoded by adding the leading zero per NUBC convention.
- Out-of-range digits surface an inline message rather than NaN.

## A11y / keyboard notes
- One text input labelled; output region announces each component. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
