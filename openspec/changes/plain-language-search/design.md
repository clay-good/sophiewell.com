# Design — plain-language search

## Context

The hero combobox runs two deterministic stages per keystroke (`app.js:3224-3242`):
`searchUtilities()` (substring/prefix over name+id, top 12) plus `resolvePrompt()`
(`lib/prompt.js`: synonym table → token ranker → one-edit typo retry against synonym phrases),
whose single best hit is promoted to slot 0. The ranker rubric (`lib/prompt.js:27-36`) is flat
token counting: name hit +3, desc hit +1, tag/audience/specialty hit +1, threshold 3. No IDF,
no stemming, no scaffold stripping; `desc`/`tags` are empty for the whole catalog.

Unindexed hand-written prose already in the repo:

| Source | Coverage | Where |
|---|---|---|
| Adapter one-line summaries | 1,044 tiles | `mcp/adapters/*.js` |
| `whatThisIs` / `whenToUse` prose | 122 tiles | `data/tool-copy/*.json` (build-time only today) |
| `example.expected` sentence | 1,127 tiles | `lib/meta.js` |
| Interpretation-band text | 960 tiles / 2,264 bands | `lib/meta.js` |
| "Near-neighbors" intro notes | ~415 notes | inline in `views/group-*.js` (unstructured) |

A trimmed corpus of the structured rows measures ~150–180 KB gzipped for the full catalog.

## Decisions

**D1 — Corpus format and sourcing.** `data/search-corpus/` holds a `manifest.json` plus one
JSON shard (following the `data/` shard convention), keyed by tile id. Each row keeps fields
*separate* so the ranker can weight them: `{ name, summary, what, when, expected, bands[],
specialties[] }`. Sources are the four structured corpora above; the in-code "Near-neighbors"
notes are **excluded** (extracting them is a view refactor — revisit only if coverage gaps
demand it). The builder emits stable key order and sorted ids so repeated builds are
byte-identical. Adapter summaries are read via `mcp/catalog.js` when the subtree exists and
skipped silently when it does not (`mcp/tools.js:1-5`: the site must build without `mcp/`).

**D2 — Ranking.** Keep the three-pass architecture (synonyms → ranker → typo). The ranker
becomes a field-weighted BM25-lite: per-field weights (name > summary/what/when >
expected/bands > specialties/audiences), IDF computed from the corpus at index build, fixed-
precision arithmetic so ordering is reproducible across engines. A token→postings index is
built once per session when the corpus loads; per-keystroke ranking stays in-memory over ~1,140
docs (budget: well under a frame). New export `resolvePromptRanked(query, tiles, synonyms,
audience, limit)` → `[{ tileId, score, why, phrase? }]`; `resolvePrompt` becomes a top-1
wrapper with its current signature, threshold gating, and null-below-threshold contract.

**D3 — Stemming.** A bounded, hand-listed suffix stripper (plural `s/es`, `ed`, `ing`,
`ion/tion` pairs like correct/correction) — a few dozen lines, no dependency, applied
identically to corpus and query tokens. Not a general stemmer; the list is a reviewed constant.

**D4 — Question-scaffold stripping.** Before tokenization, strip interrogative scaffolding and
stopwords ("what is the," "how do i," "should i," "for my patient with," "can i" …) from the
*ranking* view of the query. The raw query is kept for the exact-phrase bonuses so verbatim
tile-name queries still get their +10.

**D5 — Typo pass.** Extend the one-edit rewrite (pass 3) to the full corpus vocabulary, not
just synonym phrases. Bound the cost with a length-bucketed vocabulary map (only candidates
within ±1 length are scanned) and a per-query token cap.

**D6 — Synonyms stay the curator's override.** Same schema, same pass-1 precedence, so a
curated canonical-intent row ("stroke risk in afib" → `chads`) always beats statistical
ranking. Expansion ships in reviewed batches; the `version` field bumps per batch.

**D7 — Degradation.** Corpus fetch failed / not yet loaded → `tileCorpus()` rows carry the
same fields as today and ranking behaves exactly as the current rubric. `lib/prompt.js` stays
pure (no DOM, no fetch); the loader lives in `app.js` beside `loadSynonyms()`.

## Risks

- **Fixture brittleness.** Unit tests must assert *ordering*, not raw scores; keep rubric
  constants behind `_testing` as today.
- **Corpus text is user-adjacent.** Band/`whatThisIs` text may later render in the UI
  (answer-shaped-results change), so the builder must carry the catalog-truth rule: no
  spec/build references, no hardcoded catalog counts, in any corpus string it emits.
- **Dist churn.** The corpus regenerates on every build; byte-stable output (D1) keeps
  `dist/` diffs meaningful and the SW data cache honest.
- **Em-dash lint fence.** Generated corpus strings flow from `lib/meta.js`/tool-copy; the
  builder must not introduce characters that trip the repo's em-dash guard on runtime surfaces.
- **Latency.** No debounce exists (`render` runs per keystroke). The postings index makes
  ranking cheaper than today's full-corpus rescan, but index build on corpus load must be
  deferred off the first paint (idle callback).
