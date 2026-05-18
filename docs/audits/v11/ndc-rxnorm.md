# v11 audit - NDC to RxNorm Crosswalk (`ndc-rxnorm`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: FDA NDC Directory + NLM RxNorm (both public-domain). The crosswalk surfaces the RxNorm RxCUI / ingredient for a given NDC via the bundled NDC and RxNorm shards.

## Shard integrity
- Both `data/ndc/manifest.json` and `data/rxnorm/manifest.json` pass `scripts/verify-integrity.mjs`.

## Sample lookup
- NDC 0378-3556-01 (Atorvastatin Calcium, Mylan) -> non-proprietary "Atorvastatin" -> RxNorm ingredient match by name. The renderer surfaces the NDC record alongside the matched RxNorm ingredient.

## Boundary examples added
- See sample lookups above; "boundary" for a lookup tile is the first/last record per shard and a substring that returns the source-authoritative descriptor. Lookup tiles are not numeric calculators - this section is intentionally short per spec-v11 §3.3 step 10, which specifies (a) shard integrity + (b) one authoritative lookup per shard.

## Cross-implementation differential
- N/A for lookup tiles (no numeric formula). The bundled data is itself the authoritative source; the verify-integrity sha256 chain is the differential: any tamper or out-of-date shard fails CI before deploy.

## Edge-input handling notes
- Records that do not match an RxNorm ingredient surface the NDC row only (no spurious crosswalk).
- The crosswalk is name-based against the bundled RxNorm subset (offline-seed); a fuller NDC-to-RxCUI mapping would require the full RxNorm release.

## A11y / keyboard notes
- Search input labelled; result region announces both sides of the crosswalk. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
