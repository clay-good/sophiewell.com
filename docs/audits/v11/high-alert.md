# v11 audit - High-Alert Medication Reference (`high-alert`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: Institute for Safe Medication Practices, *List of High-Alert Medications in Acute Care Settings* (current public release). The bundled shard reproduces five canonical class entries; ISMP maintains the authoritative full list.

## Boundary examples added (table coverage rows)
Per spec-v11 §3.3 step 10 framing for lookup tiles, the audit covers at least three rows hitting different shards / categories. The bundled `data/clinical/ismp-high-alert.json` carries 5 class-level rows:
- Insulin (all formulations) - narrow therapeutic window
- Heparin (all formulations) - anticoagulation errors
- Opioids - respiratory depression risk
- Concentrated electrolytes (KCl, hypertonic saline) - bolus can be fatal
- Chemotherapy - narrow margin

All five rows render through `views/group-f.js` `'high-alert'` against `loadFile('clinical', 'ismp-high-alert.json')`; spot-checked the visible table after `npm run dev` matches the JSON.

## Cross-implementation differential
- Reference implementation: the published ISMP high-alert list contains additional classes (neuromuscular blockers, parenteral nutrition admixtures, sterile compounded products, etc.) that the bundled subset does not enumerate. The attribution text explicitly directs users to ISMP for the authoritative list.
- Test case: presence of the five canonical entries.
- Sophie result: all five render verbatim from the JSON.
- Reference result: present on the ISMP public list.
- Delta: bundled subset is *narrower* than the upstream list by design; no incorrect data shown, no missing data claimed. PASS-WITH-FIXES (citation tightening — see Defects).

## Edge-input handling notes
- Lookup tile has no inputs; the table renders directly from JSON. No edge-input surface to audit.
- The page-level attribution paragraph is rendered first so the user sees the "ISMP maintains the authoritative list" framing before the rows. PASS.

## A11y / keyboard notes
- Table uses `<thead>` with `scope="col"` headers; `lookup-table` class for keyboard focus styling. `npm run test:a11y` clean.

## Defects opened
- (Citation tightening, shipped this PR) The pre-v11 citation contained a bare URL (`https://www.ismp.org/`), which spec-v11 §3.5 rejects. The wave-0 commit dropped the URL; the citation now reads "Identities are factual. ISMP maintains the authoritative high-alert medication list and formatting."

## Status
- PASS-WITH-FIXES
