# spec-v609 — Hijdra sum score (SAH blood burden)

**Status:** shipped. Catalog 1458 -> 1459. MCP wave 434, 1395 -> 1396 adapters.

## Why this tile

A **cluster-completion gap**. `fisher-grade`, `modified-fisher` and `ogilvy-carter` all ship; the
*quantitative* member of the SAH-imaging family did not. Every slug spelling, prose search and filename
search returned zero.

**Rejected on the way here:** the "Claassen scale" is **not** a separate instrument — it *is* the modified
Fisher scale, already shipped as `modified-fisher`. Sourced and rejected before any file was written. A
second eponym is not a second tile.

## What it does for the reader

Score fourteen sites 0 to 3 — ten cisterns and fissures, four ventricles — and get the cisternal subtotal,
the ventricular subtotal and the total, with the two things most readers get wrong stated in the result.

## The findings the tile is built around

| Finding | Consequence |
|---|---|
| **It is a sum across 14 sites, not a grade.** Cisternal 0–30, ventricular 0–12, total 0–42. | Fisher and modified Fisher give one ordinal category for the whole scan. Reporting this as a grade is the obvious error, so the tile says so. |
| **The two halves use the same 0–3 range with different anchor definitions.** Cistern 1 = "a small amount"; ventricle 1 = "sedimentation of blood in the posterior part". Cistern 2 = "moderately filled"; ventricle 2 = "partly filled". | **Only 0 and 3 mean the same thing in both halves** — and they are still summed into one total. The adapter carries two distinct label sets rather than one shared wording. |
| **Eight of the ten cisternal sites are paired**, so there are only six named structures. | Only the interhemispheric fissure and the quadrigeminal cistern are scored once. Scoring "the sylvian fissure" once instead of left and right silently halves four of the ten sites. |
| **It has no official severity bands.** | `band` is always `null`. Study thresholds (≤19 limited clot burden; ≥23 predicted vasospasm) are single-study figures, so they are reported and not applied. |
| **Which scale is best depends on which outcome.** | Modified Fisher led for **vasospasm** (AUC 0.78 vs 0.68 vs 0.62), but only this score correlated significantly with radiological **delayed cerebral ischemia**. The ranking flips between endpoints. |

## Sourcing (spec-v97)

Re-fetched and double-confirmed, never recalled. One source gives the site structure (ten cisterns and
fissures — interhemispheric, bilateral sylvian lateral, bilateral sylvian basal, bilateral suprasellar,
bilateral ambient, quadrigeminal; four ventricles — bilateral frontal, third, fourth) with the 0–3 range and
the comparative AUCs. A second, independent source gives the level wording for both halves — cisternal
"no blood / small amount / moderately filled / completely filled" against ventricular "no blood /
sedimentation of blood in the posterior part / partly filled with blood / completely filled with blood" —
and the 30 + 12 = 42 subtotals.

**Not applied:** the ≤19 and ≥23 thresholds, which come from single studies rather than the instrument.

## Posture (spec-v11 §5.3)

Quantifies blood on the initial CT. It does not diagnose subarachnoid hemorrhage, does not locate or grade
an aneurysm, does not measure clinical severity — the Hunt and Hess and WFNS grades do that — and does not
decide whether or when to treat vasospasm.

## Files

`lib/hijdra-v609.js`, `views/group-v609.js`, `mcp/adapters/hijdra-v609.js`, `test/unit/hijdra.test.js`.
Registered in `app.js` (tile + RV609), `mcp/catalog.js`, `test/unit/fuzz-tools.test.js`,
`test/mcp/mcp-search-relevance.test.js`, `data/synonyms.json`, `lib/meta.js`, `docs/mcp-coverage.md`.
