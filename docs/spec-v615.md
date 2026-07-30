# spec-v615 — AREDS simplified severity scale (macular degeneration)

**Status:** shipped. Catalog 1464 -> 1465. MCP wave 440, 1401 -> 1402 adapters.

## Why this tile

A **whole-concept gap**. `icdr-retinopathy`, `kwb-retinopathy`, `rop-stage` and `gass-macular-hole` all ship,
and macular degeneration was entirely uncovered — "macular degeneration" and "drusen" were both zero-hit
across `app.js`.

## What it does for the reader

Answer three items per eye plus one bilateral question; get the risk-factor count across both eyes, the
per-eye breakdown, and the approximate five-year risk of advanced disease in at least one eye.

## The findings the tile is built around

| Finding | Consequence |
|---|---|
| **The scale scores a person, not an eye.** | Both eyes contribute, so the total runs 0–4. Scoring one eye and reporting 0–2 is a different instrument. |
| **An advanced eye is assigned 2 factors outright and stops contributing its own features.** | Adding large drusen *and* pigment to an already-advanced eye changes nothing. The question becomes whether the *fellow* eye converts. |
| **Intermediate drusen count only when neither eye has large drusen, and only when bilateral.** | One factor for the **person**, never one per eye — and unavailable the moment either eye has large drusen. |
| **Both eyes advanced leaves nothing to predict.** | `fiveYearRiskPercent` returns `null`. There is no at-risk eye. |
| **The five-year risk is nowhere near linear**: 0.5%, 3%, 12%, 25%, 50%. | The first step multiplies risk about sixfold; the last two roughly double it. The count is not evenly spaced severity. |

## Sourcing (spec-v97)

Re-fetched and double-confirmed, never recalled. The per-eye assignment and all five risk figures matched
across two independent sources; both conditional rules — the 2-factor assignment for an eye with advanced
disease, and the bilateral-intermediate-drusen fallback — are quoted from the derivation report itself,
including the large-druse threshold of 125 µm ("the width of a large vein at the disc margin").

**One derived constraint, disclosed rather than hidden.** Applied literally to *two* already-advanced eyes,
the published rules total **5** — outside the published 0–4 scale. Since the intermediate-drusen rule is
about drusen *grading*, and an eye that has already converted is not graded, the factor is not added in that
state. The result text states this, and a test pins both the total of 4 and the stated reason. This is the
report-the-hole pattern applied to an over-count rather than an under-count.

## Posture (spec-v11 §5.3)

Estimates a **group-level** five-year risk from an examination. It does not diagnose macular degeneration,
does not grade disease already present, does not decide antioxidant or zinc supplementation or any injection,
and does not predict what will happen to one person.

## Files

`lib/areds-v615.js`, `views/group-v615.js`, `mcp/adapters/areds-v615.js`, `test/unit/areds.test.js`.
Registered in `app.js` (tile + RV615), `mcp/catalog.js`, `test/unit/fuzz-tools.test.js`,
`test/mcp/mcp-search-relevance.test.js`, `data/synonyms.json`, `lib/meta.js`, `docs/mcp-coverage.md`.
