# spec-v612 — University of Texas diabetic foot wound classification

**Status:** shipped. Catalog 1461 -> 1462. MCP wave 437, 1398 -> 1399 adapters.

## Why this tile

A **thin-cluster gap**. The catalog carried `wifi`, which stages limb *threat* in chronic limb-threatening
ischemia, and no diabetic foot **ulcer** classification at all. Every slug spelling, prose search and
filename search returned zero.

## What it does for the reader

Pick a depth grade and a complication stage; get the paired cell (e.g. **IIB**), both definitions in full,
and the two things about this classification that are easy to get wrong.

## The findings the tile is built around

| Finding | Consequence |
|---|---|
| **It is a two-dimensional matrix**: 4 grades × 4 stages = 16 cells, reported as a pair. | A single number cannot express it. Wagner — which this extends — is one-dimensional, so carrying a bare Wagner grade across drops the whole infection-and-ischemia axis. |
| **The stage axis adds exactly what depth cannot see**: infection and ischemia. | A = neither, B = infection, C = ischemia, D = both. That is the entire reason the classification exists. |
| **Grade 0 does not mean "no problem".** | It is a pre-ulcerative *or post-ulcerative* completely epithelialized lesion, and it still carries a stage. A healed ulcer on an ischemic foot is **0C**, not "resolved". |
| **One rendering blurs two rungs** of the depth ladder, writing grade II as reaching "capsule or bone". | That overlaps grade III and cannot be right. The non-overlapping ladder is used and the blur is disclosed. |

## Sourcing (spec-v97)

Re-fetched and double-confirmed, never recalled. Two independent sources agree on the four grades, the four
stages, and the matrix structure.

**Two deliberate withholdings:**

- **The Wagner grade table is not reproduced.** Independent renderings conflict on whether Wagner's grade 2
  involves bone — a value disagreement, not a wording variant. Wagner is named as the predecessor and nothing
  more; a test asserts none of its grade descriptors leak into the output.
- **No outcome percentages.** The per-cell healing and amputation figures are single-sourced. The tile states
  only the direction both sources support — risk rises across *both* axes, so the two are read together and
  never traded against each other. A test scans all sixteen cells for any percentage and finds none.

## Posture (spec-v11 §5.3)

**Describes** an ulcer. It does not diagnose infection or ischemia — those are the clinical and vascular
assessments that feed *into* the stage — does not decide antibiotics, revascularization or amputation, and
does not predict an individual patient's outcome.

## Files

`lib/ut-diabetic-foot-v612.js`, `views/group-v612.js`, `mcp/adapters/ut-diabetic-foot-v612.js`,
`test/unit/ut-diabetic-foot.test.js`. Registered in `app.js` (tile + RV612), `mcp/catalog.js`,
`test/unit/fuzz-tools.test.js`, `test/mcp/mcp-search-relevance.test.js`, `data/synonyms.json`,
`lib/meta.js`, `docs/mcp-coverage.md`.
