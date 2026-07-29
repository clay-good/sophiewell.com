# spec-v613 — PEDIS classification and score (diabetic foot)

**Status:** shipped. Catalog 1462 -> 1463. MCP wave 438, 1399 -> 1400 adapters.

## Why this tile

A **companion with a different shape**. `sinbad-score` sums to 0–6; `ut-diabetic-foot` (spec-v612) does not
sum at all; the five-category IWGDF research classification — which is *both* a profile and a score — was
missing. Every slug spelling, prose search and filename search returned zero.

## What it does for the reader

Grade five categories using the published 1-based grade numbers and get the profile (`P2 E3 D3 I2 S2`), the
summed score out of 12, and — deliberately — the grade sum beside it, so the commonest error is visible
rather than silent.

## The findings the tile is built around

| Finding | Consequence |
|---|---|
| **The grade and the score are off by one.** Grades are 1-based; the score contribution is grade − 1. | Adding the grades inflates the total by exactly 5. A minimum ulcer reads **5 instead of 0**; a maximum one **17 instead of 12**. |
| **The five categories have different numbers of grades** (3, 4, 4, 4, 2). | They are **not equally weighted**. Extent, depth and infection carry 3 points each; perfusion 2. |
| **Sensation carries the least weight — 1 point of 12.** | The neuropathy that defines the diabetic foot moves the total by a single point. Anyone reading the score as a severity ladder should know that. |
| **PEDIS has two identities**: a research *classification* (a profile) and a *score* added later by a validation study. | Both are returned, kept separate. The profile uses the published grade numbers; the score uses the offset ones. |
| **Extent has an explicit measurement rule.** | Largest diameter × the perpendicular second largest, in cm². An area, not a length. |

## Sourcing (spec-v97)

Re-fetched and double-confirmed, never recalled. Two independent sources give the same five categories with
3, 4, 4, 4 and 2 grades, the same grade definitions, and the same theoretical maximum total of 12 — which is
itself the arithmetic check on the offset, since the grades sum to 17 and only the offset scores sum to 12.

## Posture (spec-v11 §5.3)

Describes an ulcer **for research comparability**. It does not diagnose infection or peripheral arterial
disease — those are the assessments that feed *into* the grades — does not decide antibiotics,
revascularization or amputation, and **its prognostic value in ordinary clinical practice is not
established**. The tile says so in every result.

## Files

`lib/pedis-v613.js`, `views/group-v613.js`, `mcp/adapters/pedis-v613.js`, `test/unit/pedis.test.js`.
Registered in `app.js` (tile + RV613), `mcp/catalog.js`, `test/unit/fuzz-tools.test.js`,
`test/mcp/mcp-search-relevance.test.js`, `data/synonyms.json`, `lib/meta.js`, `docs/mcp-coverage.md`.
