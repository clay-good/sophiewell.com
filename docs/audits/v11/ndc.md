# v11 audit - NDC Drug Code Lookup (`ndc`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: FDA National Drug Code Directory (public-domain). `data/ndc/manifest.json` recordCount 5 across 4 shards (A, H, L, M - first-letter prefix of proprietary name), fetchDate 2026-05-07.

## Shard integrity
- `scripts/verify-integrity.mjs` confirms each shard sha256 matches manifest.

## Sample lookup per shard
- A.json[0] -> 0378-3556-01 Atorvastatin Calcium / Atorvastatin (Mylan, tablet, oral).
- H.json[0] -> 50242-040-62 Herceptin / Trastuzumab (Genentech, IV injection).
- L.json[0] -> 0093-1014-01 Lisinopril (Teva, tablet, oral).
- M.json[0] -> 0378-1810-01 Metformin Hydrochloride / Metformin HCl (Mylan, tablet, oral).

All entries cross-checked against the FDA NDC Directory online lookup (records exist with these proprietary/non-proprietary pairs and labeler attributions; the offline seed is intentionally curated to top-volume drugs per spec-v3 §3 data-sources commitment).

## Boundary examples added
- See sample lookups above; "boundary" for a lookup tile is the first/last record per shard and a substring that returns the source-authoritative descriptor. Lookup tiles are not numeric calculators - this section is intentionally short per spec-v11 §3.3 step 10, which specifies (a) shard integrity + (b) one authoritative lookup per shard.

## Cross-implementation differential
- N/A for lookup tiles (no numeric formula). The bundled data is itself the authoritative source; the verify-integrity sha256 chain is the differential: any tamper or out-of-date shard fails CI before deploy.

## Edge-input handling notes
- The renderer accepts NDC in any of 10-digit (4-4-2, 5-3-2, 5-4-1) or 11-digit billing format. NDC normalization is the role of the separate `ndc-convert` tile.
- Empty query lists the shard; substring matches on proprietary or non-proprietary name.

## A11y / keyboard notes
- Search input labelled; results table has a caption. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
