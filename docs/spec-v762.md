# spec-v762.md — answer_query must answer the calculator it was asked about

> Status: **SHIPPED (2026-08-20).** MCP only. No tile added, no compute changed. Catalog stays **1564**.

## Why

[spec-v758](spec-v758.md) took `answer_query` from 22 tiles to ~1000. Measuring whether those
answers were **correct** — not just present — found two defects, both agent-facing and both worse
than not answering.

**1. It answered the wrong calculator.** `findCalculator`'s top hit is routinely a near neighbour,
and the generic path trusted it:

| asked | answered |
|---|---|
| `CHA2DS2-VA` | `chads` |
| `Modified Glasgow (Imrie) Pancreatitis Severity` | `ranson-bisap` |
| `HEART Score` | `hear` |

`matched: true`, with a citation, for a calculator the caller never named.

**2. It answered incomplete questions confidently.** `pospom` has fifteen comorbidity criteria. A
query naming none of them still computes — criteria are optional, so `missing` stays empty — and
returned **3.126% mortality** where the documented inputs give 7.403%. Nothing in the response said
five sixths of the score was never mentioned.

## What it does

**Name the calculator you asked for.** Candidates are scored by how strongly the query names them:
the summed rarity of matched name words, scaled by how much of the name they cover.

Rarity is counted from the catalog rather than kept as a stoplist, so it stays right as the catalog
grows — `index` appears in 162 tile names, `wells` in 4, `life` in 1.

Coverage is what settles siblings. `HEAR Score (HEART minus troponin)` *contains* `heart`, so
rarity alone let it outscore the HEART score itself; coverage does not — HEART matches 3 of its 3
distinctive words, HEAR 1 of its 4.

**Strength is a separate question from score**, and conflating them cost two regressions. Only a
*strong* match overrides the ranker: two matched words, or one long rare one. One moderately-common
word is not someone naming a calculator.

**Hand back a real tie.** Two calculators named equally well is a question, not a coin flip — the
same refusal [spec-v756](spec-v756.md) makes on the website. Returns `AMBIGUOUS` with the ids.

**Say what was not stated.** Every optional input the query did not supply is reported in
`unstated`, with a note that a scored result is a floor. Not just booleans: `gold-spirometry`
answered `grade: null` because an optional FEV1 percentage never came through, and said nothing.

## Measured

Every tile's documented example, re-phrased as a query, against `compute_calculator` on the
documented inputs — 1094 registry answers:

| | before | after |
|---|---|---|
| Identical to ground truth | 858 (86.4%) | 937 (85.6%) |
| Differ, `unstated` declared | — | 144 |
| **Honest** (identical or declared) | 858 | **1081 (98.8%)** |
| **Wrong calculator** | **135** | **7 (0.64%)** |
| Handed back as ambiguous | 0 | 3 |

The seven are sibling pairs under a synthetic query that concatenates a tile's full name with its
field labels — an input shape no caller produces.

## Gotchas

- **Do not swap `findCalculator` for a direct `resolvePromptRanked` call.** It builds its corpus
  differently and picks different tiles.
- A weak name match must not override the ranker. `life` appears in exactly one tile name, which
  makes it rare and still meaningless in "what is the meaning of life" — the pre-existing
  `spec-v630` test catches this, and did.
- The ambiguity check must run only on *strong* matches, or `wells score for PE, heart rate 110`
  gets handed back as a wells-pe/wells-dvt tie instead of answered.

## Proof

- `test/mcp/mcp-tools.test.js` — `spec-v762: a query that names a calculator gets that calculator`
  and `spec-v762: an incomplete question is answered as incomplete`.
- 43 MCP tests (4 new across v758/v762), green.
