# spec-v614 — Ocular Trauma Score

**Status:** shipped. Catalog 1463 -> 1464. MCP wave 439, 1400 -> 1401 adapters.

## Why this tile

A **whole-concept gap** in an otherwise well-covered eye cluster. `shaffer-angle`, `van-herick` and the
ocular-burn tiles all ship; there was no prognostic score for serious eye injury at all. Every slug
spelling, prose search and filename search returned zero.

## What it does for the reader

Pick the initial visual acuity, answer five injury findings, and get the raw score, the category, and — the
actual result — the **full distribution** of where vision lands at six months.

## The findings the tile is built around

| Finding | Consequence |
|---|---|
| **The initial visual acuity is the only term that adds.** Base 60–100; five findings deduct 75 in total. | The presenting vision is not one variable among six — it is the whole positive side of the ledger. |
| **The raw score can fall below the published floor of 0.** NLP + rupture + endophthalmitis + retinal detachment + APD = **−1**; all five findings = **−15**. | Both sources print the lowest band as "0 to 44", so these are reachable *and unclassified*. `ots` returns `null` with `belowPublishedRange` set, never clamped to category 1. |
| **The output is a probability distribution, not a predicted acuity.** | Every row sums to exactly 100. Category 3 is 44% at 20/40 or better and still 13% at hand movements or worse. Quoting the category alone throws the result away. |
| **Neither extreme is certain.** | OTS 1 still carries 1% at 20/40 or better; OTS 5 still carries 1% at light perception or hand movements. |
| **The bands narrow as the prognosis improves** — 45, 21, 15, 11, 9 points wide. | A single raw point matters far more near the top of the scale than near the bottom. |

## Sourcing (spec-v97)

Re-fetched and double-confirmed, never recalled. Two independent sources give **identical** acuity bases,
identical deductions, identical band edges — including the `0 – 44` floor, verbatim in both — and identical
six-month probability tables. The floor wording mattered: had one source written "≤44" this would have been
a rendering difference to disclose at the boundary; both writing "0 – 44" makes the sub-zero region a real
hole in the published table.

**Hole reported, not patched** — the same handling as the al Naqeeb unclassified region and the GAGS score
of 39.

## Posture (spec-v11 §5.3)

Estimates a **group-level** distribution at six months **after optimal management**. It does not diagnose
the injury, does not decide whether to operate, **does not support a decision to enucleate or to withhold
repair**, and does not predict what will happen to one patient's eye.

## Files

`lib/ocular-trauma-score-v614.js`, `views/group-v614.js`, `mcp/adapters/ocular-trauma-score-v614.js`,
`test/unit/ocular-trauma-score.test.js`. Registered in `app.js` (tile + RV614), `mcp/catalog.js`,
`test/unit/fuzz-tools.test.js`, `test/mcp/mcp-search-relevance.test.js`, `data/synonyms.json`,
`lib/meta.js`, `docs/mcp-coverage.md`.
