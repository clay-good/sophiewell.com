# spec-v921 — Sigma belongs to a method *and* a goal

## Why

`sigma metric`, `westgard` and `total allowable error` were all zero-hit across the 1702 tile
names. It is the number laboratory quality is run on, and it sits directly beside the reference
change value shipped in spec-v920.

## What it does

**σ = (TEa% − |bias%|) / CV%**

| Band | Reading |
| --- | --- |
| 6 and above | world class |
| 5–6 | excellent |
| 4–5 | good |
| 3–4 | marginal — workable, but the control rules have to do more of the work |
| below 3 | unacceptable |

## The three things it is for

**The answer is only as good as the goal.** Sigma is a property of a method **and** a goal
together, never of the method alone. CLIA, the biological-variation goals, RCPA and EFLM all
publish different allowable errors for the same analyte, and the same method can be six sigma
against one and three against another. Nothing here chooses a goal, and every result names the
one the answer belongs to.

**Bias eats the budget before imprecision does.** It is subtracted from the goal first, so a
method with a large bias can fail on sigma while looking precise. The result reports what the
bias took and what was left. When the bias alone meets or exceeds the allowable error there is
**no budget at all** — reported as *No budget left for imprecision*, not as a small sigma,
because it is a method that cannot meet the goal.

**Below three is not a bit worse than three.** Three is the floor at which the standard control
rules can be run at all, and that line prints at every level, not only when the method fails.

The sign of the bias does not change the arithmetic — it enters as its size — and the result says
so, along with the fact that the direction still matters clinically and is not reported here.

## Files

New: `lib/sigma-metric-v921.js`, `views/group-v921.js`, `mcp/adapters/sigma-metric-v921.js`,
`test/unit/sigma-metric.test.js`, this file.
Wired: `app.js`, `mcp/catalog.js`, `lib/meta.js`, `test/unit/fuzz-tools.test.js`,
`test/mcp/mcp-search-relevance.test.js`, `docs/mcp-coverage.md`, `data/synonyms.json`, and the
count surfaces.

## Sourcing

Westgard and Westgard 2006 (*Am J Clin Pathol*) and *Six Sigma Quality Design and Control* (2nd
ed.), cross-checked against the CLSI EP23 discussion of the same metric and the same bands.
Neither issuer is in `ISSUER_PATTERN`, so no `docs/citation-staleness.md` row is owed.

Catalog 1702 → 1703.
