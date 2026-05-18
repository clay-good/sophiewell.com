# v11 audit - Toxicology Reference Levels (`tox-levels`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Levels listed are "associated with clinical toxicity per published references" (not treatment recommendations). Sourced from Goldfrank's Toxicologic Emergencies and the AAPCC standardized poisoning references. The bundled table phrases each row as "associated with toxicity / severe toxicity" rather than as an action threshold.

## Shard integrity
- Bundled at `data/tox-levels/tox.json`; manifest present at `data/tox-levels/manifest.json`. Covered by `scripts/verify-integrity.mjs`.

## Sample lookup per shard / section
- Acetaminophen: >150 mcg/mL at 4 h post-ingestion -> matches the Rumack-Matthew "probable toxicity" line. PASS.
- Salicylate: >30 mg/dL associated with toxicity; >100 mg/dL severe -> matches Goldfrank's thresholds. PASS.
- Lithium: >1.5 mEq/L acute; >2.5 mEq/L severe -> matches EXTRIP and Goldfrank's. PASS.
- Lead (adult): >5 mcg/dL elevated; >70 mcg/dL chelation usually indicated -> matches current CDC / ACMT adult lead-toxicity reference levels (the 5 mcg/dL "reference value" was lowered from prior 10 in the 2012 update and remains current). PASS.

## Boundary examples added
- Per spec-v11 §3.3 step 10, lookup tiles are audited by (a) shard integrity and (b) one authoritative lookup per category. The rows above cover hepatotoxin, salicylate, mood stabilizer, and heavy-metal categories.

## Cross-implementation differential
- N/A for lookup tiles. The differential is "do the bundled thresholds match published toxicologic references?" — cross-checked; all sampled rows match.

## Edge-input handling notes
- No user input; pure reference table. The renderer surfaces only Agent + Level-associated-with-toxicity columns; intentionally does not surface "treat at X" prescriptive language (per the citation).
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- `renderTable` semantic `<table>`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
