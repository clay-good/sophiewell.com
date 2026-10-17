# spec-v765.md — Rank on the words, not the reader's values

> Status: **SHIPPED (2026-08-20).** Search ranking, both surfaces. No tile added, no compute
> changed. Catalog stays **1564**.

## Why

Found by driving the **live site**, not by a test. This query:

```
akin current creatinine 2.4 baseline creatinine 0.9
```

routed to **COMPERA 2.0**. These did not:

```
akin aki               -> akin-aki
akin stage creatinine  -> akin-aki
```

The difference is the values. `2.4` and `0.9` are ranked as query tokens, they matched
*COMPERA 2.0*, and they beat the tile the query literally names.

That is the whole design working against itself: [spec-v751](spec-v751.md) puts
`crcl for a 72 year old woman, 68 kg, creatinine 1.4` in the placeholder and four more like it on
chips. The reader is being asked to type the thing that breaks the routing.

## Measured

Every tile's own name, with its own documented example values appended — 1337 tiles:

| Query shape | Ranks #1 |
|---|---|
| Name alone | 1333 (99.7%) |
| **Name + values** | **1273 (95.2%)** |
| **Name + values, ranking on words** | **1332 (99.6%)** |

Values cost 60 tiles. Taking them out of the ranking recovers 59.

## What it does

`rankableWords()` drops **standalone** numbers before ranking. Extraction is untouched and still
sees the whole query — only the ranker ignores the digits.

**Only standalone.** A digit inside a name is part of the name, and those are the tiles most likely
to be searched *by* their number:

```
cha2ds2-vasc score   ->  unchanged
phq-9 depression     ->  unchanged
4at delirium         ->  unchanged
covid-19 severity    ->  unchanged
bmi 80 kg 180 cm     ->  bmi kg cm
```

Applied on both surfaces — `app.js` for the search box, `findCalculator` for the MCP, where an
agent passing a question with its values in it has the same problem.

## A test I did not write caught a real defect

The repo's fuzz suite discovers exported functions automatically, so `rankableWords` was fuzzed the
moment it existed. It found `rankableWords(Infinity)` returning `"Infinity"` — coercing a
non-string input and handing its text back as a search term. It now returns `''` for anything that
is not a string.

## Where it lives

- `lib/prompt.js` — `rankableWords()`.
- `app.js` — `matchesFor()` and `ambiguousMatches()` rank on words.
- `mcp/tools.js` — `findCalculator()` ranks on words.

## Proof

- `test/unit/search.test.js` — values dropped, names containing digits preserved, degenerate input
  safe.
- `test/unit/fuzz-tools.test.js` — 1623 fuzz assertions, including the leak above.
- 11470 unit, 399 mcp, lint, a11y, 41 e2e: green.

## Later correction (October 16, 2026)

Stripping standalone numbers also stripped numbers that are part of a curated phrase's identity:
"usp 797 bud", "sb 1164", "ab 890", "texas 10 day rule", "multi dose vial 28 days". A sweep of every
phrase in `data/synonyms.json` found 28 that could not put their own tool in `find_calculator`'s top 3,
and the home box missed the same ones. `rankingQuery()` in `lib/prompt.js` now decides the query to rank
for both: when the whole query matches a curated phrase that itself contains a digit, it ranks on the
query as typed; otherwise on `rankableWords()`, so values in an ordinary question still do not compete
with names.
`test/mcp/mcp-numbered-phrases.test.js` holds all 381 numbered phrases to their tools, and
`test/unit/ranking-query.test.js` pins the rule.
