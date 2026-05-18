# v11 audit - CPT Code Reference (`cpt`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: CMS Medicare Physician Fee Schedule (structural rows; no AMA-owned descriptors bundled). `data/mpfs/manifest.json` recordCount 5 across 3 shards, fetchDate 2026-05-07. Family-level plain-English summaries in `data/cpt-summaries/summaries.json` (recordCount 9; original author-written summaries, **not AMA descriptors** - guarded by `test/unit/cpt-no-ama.test.js` per spec-v2 / spec-v8 AMA-license stance).

## Shard integrity
- Both `mpfs` and `cpt-summaries` manifests verified clean by `scripts/verify-integrity.mjs`.

## Sample lookup
- cpt-summaries[0] -> range "99201-99205" family "Office or other outpatient visit, new patient (E&M)" with an original author-written summary. Note: 99201 was deleted by AMA effective 2021; the range header is retained as the historical family span. The summary text is intentionally plain-English (not the AMA descriptor) per the AMA-license stance.
- mpfs structural rows reference RVU components and the Medicare conversion factor (current-year value); no AMA descriptors.

## Boundary examples added
- See sample lookups above; "boundary" for a lookup tile is the first/last record per shard and a substring that returns the source-authoritative descriptor. Lookup tiles are not numeric calculators - this section is intentionally short per spec-v11 §3.3 step 10, which specifies (a) shard integrity + (b) one authoritative lookup per shard.

## Cross-implementation differential
- N/A for lookup tiles (no numeric formula). The bundled data is itself the authoritative source; the verify-integrity sha256 chain is the differential: any tamper or out-of-date shard fails CI before deploy.

## Edge-input handling notes
- The renderer surfaces the family summary text alongside the structural row from MPFS. Users see plain-English context plus the Medicare structural row, never an AMA descriptor.
- `test/unit/cpt-no-ama.test.js` automatically guards against any AMA descriptor leaking into the summaries file.

## A11y / keyboard notes
- Search input labelled; results table with caption. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
