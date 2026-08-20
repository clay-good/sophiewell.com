# spec-v758.md — answer_query reads the field registry too

> Status: **SHIPPED (2026-08-20).** Part of [scope-one-box](scope-one-box.md).
> MCP only. No tile added, no compute changed, no new tool. Catalog stays **1564**.

## Why

The website got [spec-v753](spec-v753.md)'s registry-driven extraction and went from 22 tiles to
~1160. Agents did not: `answer_query` was still backed by `queryCompute` alone.

Every query outside those 22 templates came back `NO_MATCH`, which cost an agent three round trips
where the question had already contained the answer's inputs — `find_calculator` to pick a tile,
`describe_calculator` to learn its inputs, `compute_calculator` to run it, re-typing values it had
written out itself.

The registry is already in memory here. `mcp/` imports the adapters directly, so the same extractor
runs with **no data file at all** — `data/fields/` is the browser's copy, not the server's.

## What it does

`answer_query` gets a second attempt when no template matches.

| | |
|---|---|
| **Templates first** | Unchanged, and unmarked. They carry a unit-tested expected value the generic path cannot claim. |
| **Then the registry** | Rank with `findCalculator`, read the tile's fields with `toIndexRows`, extract with `queryFill`, compute. |
| **`via: "registry"`** | On a registry answer only, so a caller can tell the two paths apart. |
| **`MISSING_INPUTS`** | Names the calculator, the inputs it recovered, and the ones it still needs. One round trip instead of three, even when it cannot answer. |
| **`NO_VALUES`** | The query named a calculator but carried nothing computable. |
| **`NO_MATCH`** | Nothing matched. |

```
answered in one call    19  ->  1012   of the 1337 tiles with a worked example (75.7%)
```

## Not answering wrongly was the hard part

The ranker returns its best guess however weak — *"what is the meaning of life"* comes back as
`crop-index`. A first cut trusted it and reported `NO_VALUES` with a tile attached, which is a
confident pointer at a calculator the caller never asked about.

A tile is now only named when something corroborates it: either the query yielded values for it, or
the query contains a **distinctive** word from its name — four characters or more, and not the
connective vocabulary half the catalog shares (`score`, `index`, `risk`, `scale`, `criteria`),
which is exactly what made the weak matches look confident.

The pre-existing `spec-v630` test caught this. It asserts nonsense returns `NO_MATCH`, and it
failed on the first cut.

## Where it lives

- `mcp/tools.js` — `answerQueryGeneric()`, `queryNamesTile()`, `TILE_NAME_NOISE`, and the one-line
  handoff in `answerQuery`.
- `lib/query-fill.js` — `toIndexRows()`, converting raw adapter descriptors to the short-keyed shape
  the extractor reads, so a caller holding the registry needs no file.
- `mcp/README.md` — the `answer_query` row.

## Gotchas

- **`toIndexRows` folds `kind: 'boolean'` to `'bool'`**, exactly as the build does, for the same 90
  descriptors. See [spec-v753](spec-v753.md) *Not in scope*.
- Do not swap `findCalculator` for a direct `resolvePromptRanked` call to get scores. It builds its
  corpus differently and picks different tiles — `crcl 72 year old woman creatinine 1.4` ranks
  `lee-mortality-index` above `cockcroft-gault` on the raw path.
- Every safety rule in `queryFill` applies unchanged here: a threshold criterion is decided by the
  number, silence never fills `false`, and ambiguity fills nothing.

## Proof

- `test/mcp/mcp-tools.test.js` — `spec-v758: answer_query falls back to the field registry` (Wells
  answers 3 via `registry`, GCS answers 12, a template is still unmarked, deterministic) and
  `spec-v758: a partial query returns what it worked out, not a refusal` (`MISSING_INPUTS` with the
  recovered inputs, `NO_VALUES`, and nonsense still `NO_MATCH`).
- **397 MCP tests** (2 new), 11455 unit, lint: green.
