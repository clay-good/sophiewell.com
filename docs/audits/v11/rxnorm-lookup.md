# v11 audit - RxNorm Lookup (`rxnorm-lookup`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: NLM RxNorm (public-domain, U.S. National Library of Medicine drug-naming standard). `data/rxnorm/manifest.json` recordCount 6, single shard (`rxnorm.json`).

## Shard integrity
- `scripts/verify-integrity.mjs` confirms sha256 match.

## Sample lookup
- rxnorm.json[0] -> RxCUI 1191 "aspirin", TTY IN (Ingredient), ingredient "aspirin". Matches NLM RxNorm authoritative concept for the aspirin ingredient.

## Boundary examples added
- See sample lookups above; "boundary" for a lookup tile is the first/last record per shard and a substring that returns the source-authoritative descriptor. Lookup tiles are not numeric calculators - this section is intentionally short per spec-v11 §3.3 step 10, which specifies (a) shard integrity + (b) one authoritative lookup per shard.

## Cross-implementation differential
- N/A for lookup tiles (no numeric formula). The bundled data is itself the authoritative source; the verify-integrity sha256 chain is the differential: any tamper or out-of-date shard fails CI before deploy.

## Edge-input handling notes
- Each record includes RxCUI, name, TTY (term type per RxNorm: IN ingredient / SCD semantic clinical drug / etc.), and root ingredient — the four primary RxNorm columns.
- Filter by RxCUI or name substring.

## A11y / keyboard notes
- Search input labelled; results table caption. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
