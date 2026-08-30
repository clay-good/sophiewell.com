# spec-v923 — Three tiers, not "the" specification

## Why

`biological variation`, `analytical goal` and `total allowable error` were zero-hit across the
1704 tile names. This is where the total allowable error the sigma metric divides into
(spec-v921) actually comes from, and where the within-subject variation the reference change
value uses (spec-v920) is published.

## What it does

With CVi (within-subject) and CVg (between-subject) biological variation:

| | optimum | desirable | minimum |
| --- | --- | --- | --- |
| Imprecision | 0.25 × CVi | 0.50 × CVi | 0.75 × CVi |
| Bias | 0.125 × √(CVi²+CVg²) | 0.250 × √(…) | 0.375 × √(…) |
| Total error | 1.65 × that tier's imprecision **+** that tier's bias | | |

## The three things it is for

**There are three tiers, not one specification.** "The" biological-variation goal almost always
means the **desirable** tier, and quoting it without saying so hides that optimum is twice as
hard and minimum is half. All three print every time, and the headline names which one it led
with.

**These are goals from biology, not from what an analyzer can do.** A method that misses them is
not thereby unusable, and a method that meets them is not thereby clinically sufficient.

**The Milan hierarchy puts outcome-based specifications above these.** Where an outcome study
exists for the analyte, it answers the clinical question and this does not.

Imprecision needs only CVi; bias and total error need CVg as well, because a shifted method moves
a result relative to a **population** reference interval. Give only CVi and the imprecision goals
stand while the rest come back null with the reason — not as zeros.

Nothing here is flagged abnormal at any input: a specification is not a finding.

## Files

New: `lib/biological-variation-goals-v923.js`, `views/group-v923.js`,
`mcp/adapters/biological-variation-goals-v923.js`,
`test/unit/biological-variation-goals.test.js`, this file.
Wired: `app.js`, `mcp/catalog.js`, `lib/meta.js`, `test/unit/fuzz-tools.test.js`,
`test/mcp/mcp-search-relevance.test.js`, `docs/mcp-coverage.md`, `data/synonyms.json`, and the
count surfaces.

## Sourcing

Fraser 2001 (*Biological Variation: From Principles to Practice*) for the tiers and factors, and
the EFLM Milan consensus statement (Sandberg 2015) for where they sit in the hierarchy. Neither
issuer is in `ISSUER_PATTERN`, so no `docs/citation-staleness.md` row is owed.

Catalog 1704 → 1705.
