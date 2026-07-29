# spec-v610 — Edinburgh CT criteria (CAA-associated lobar ICH)

**Status:** shipped. Catalog 1459 -> 1460. MCP wave 435, 1396 -> 1397 adapters.

## Why this tile

A **companion on a different modality**. `boston-caa` is in the catalog and needs MRI; the Edinburgh criteria
read the non-contrast CT that has already been done. Every slug spelling, prose search and filename search
returned zero.

## What it does for the reader

Answer two CT findings and the APOE e4 status — including **"not back yet"**, which is the usual state when
the CT is read — and get **both** versions of the criteria side by side, with an explicit flag when they
disagree.

## The findings the tile is built around

| Finding | Consequence |
|---|---|
| **The simplified version can only ever read lower than the original, never higher.** | All eight combinations are enumerated in code. Exactly three disagree; the original is higher in every one; **APOE e4 accounts for all three**. With a negative genotype the two versions always agree. |
| **It is not a count of any two of three findings**, despite a widely-repeated restatement. | The derivation paper defines high risk as subarachnoid extension **and** at least one other predictor — subarachnoid extension is a **gate**. Finger-like projections + APOE e4 *without* subarachnoid extension is **medium**, not high. |
| **Finger-like projections never count on their own, in either version.** | They raise the category only once subarachnoid extension is present. Easy to miss, because the two CT findings are usually named in one breath. |
| **The APOE result is almost never back when the CT is read.** | That is why the simplified version exists. With `unknown`, the original is returned as `null` rather than guessed. |
| **The source has a hole at one reachable combination.** | Low risk is described as "when no predictors were present", but the rule-out criterion is the absence of subarachnoid extension *and* APOE e4 — which puts finger-like projections alone in the low group even though a predictor is present. |

## Sourcing (spec-v97)

Re-fetched and double-confirmed, never recalled.

- **Simplified criteria** — confirmed twice: low = lobar ICH without subarachnoid extension; intermediate =
  with subarachnoid extension; high = with subarachnoid extension *and* finger-like projections. One source
  states explicitly that finger-like projections without subarachnoid extension fall in the low group.
- **Original criteria** — taken from the derivation paper's own wording: low "when no predictors were
  present"; medium for subarachnoid haemorrhage or APOE e4 "in isolation"; high for "the presence of
  subarachnoid haemorrhage and at least one other predictor". Plus the rule-out (100% sensitivity) and
  rule-in (96% specificity) criteria.

**Conflict resolved in favor of the derivation paper.** A secondary restatement describes the original as a
count (none / one / two or more of the three findings). The derivation paper does not, and the simplified
criteria independently corroborate the gate structure. The tile implements the derivation paper and states
the conflict rather than hiding it — the same handling as the Bauer disagreement in spec-v603.

**Hole reported, not patched.** The finger-like-projections-alone cell is returned as low probability, with
the ambiguity disclosed at that combination only — the pattern used for GAGS 39 and the al Naqeeb upper
margin.

## Posture (spec-v11 §5.3)

Estimates a **cause** for a hemorrhage already diagnosed on CT. It does not diagnose the hemorrhage, does not
apply to deep or infratentorial hemorrhage, does not establish cerebral amyloid angiopathy — only pathology
does — does not replace the MRI-based Boston criteria, and does not decide anticoagulation.

## Files

`lib/edinburgh-caa-v610.js`, `views/group-v610.js`, `mcp/adapters/edinburgh-caa-v610.js`,
`test/unit/edinburgh-caa.test.js`. Registered in `app.js` (tile + RV610), `mcp/catalog.js`,
`test/unit/fuzz-tools.test.js`, `test/mcp/mcp-search-relevance.test.js`, `data/synonyms.json`,
`lib/meta.js`, `docs/mcp-coverage.md`.
