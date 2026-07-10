# spec-v282.md — Plain-language search: corpus, ranked API, `find_calculator`, and answer-shaped results

> Status: **BUILT (2026-07-10).** Successor to [spec-v8](spec-v8.md) (the prompt-first front
> door), [spec-v183](spec-v183.md) (the MCP tool surface), and [spec-v184](spec-v184.md) (unit
> toggles). Presentation + discovery only: **no compute, no `lib/meta.js` value, and no catalog
> tile is added or changed** — `UTILITIES.length` stays live and untouched. Records the deltas
> from the `plain-language-search`, `mcp-find-calculator`, and `answer-shaped-results` OpenSpec
> changes as they were shipped, one reviewable commit at a time.

## Why

Since the spec-v51/v53 minimalist pivot the hero search is the product's front door, but its
resolver ([spec-v8 §4.3](spec-v8.md), `lib/prompt.js`) ranked a starved corpus: tile
`desc`/`tags` were empty, so routing ran on names + ids + specialties + a 9-entry synonym table.
Plain questions misrouted ("stroke risk in afib" landed on a TIA score, not CHA2DS2-VASc), the
dropdown never explained *why* a tile was promoted, and a fully-specified numeric question
("bmi 180 lb 5'10") got a link instead of the number. The MCP server had the same discovery gap:
`list_calculators`' `query` is a single substring test, so "stroke risk afib" matched nothing.

All of this is deterministic. **No AI is added anywhere** — the site's "No AI" commitment holds.

## What shipped

**Corpus (`data/search-corpus/`, `scripts/build-search-corpus.mjs`).** A per-tile
natural-language corpus compiled from existing hand-authored sources only — tile name/group/
audiences (UTILITIES), specialties + interpretation-band text (META), MCP adapter one-line
summaries, and `data/tool-copy` prose. Deterministic and byte-stable (sorted ids, fixed key
order, no timestamps), 186 KB gzipped against a hard 200 KB budget asserted in the builder, all
source prose sanitized (en/em dash → hyphen, smart quotes → ASCII) so it never trips the runtime
em-dash guard. Committed like `data/synonyms.json` and copied to `dist/`; the service worker
caches it lazily, so search works offline after first load.

**Synonym expansion (`data/synonyms.json`, v7 → v10).** 9 → 73 curated entries (269 phrases):
clinical abbreviations, eponym aliases, and canonical-intent phrases. Every phrase lowercase and
unique, every tile id real, guarded by `test/unit/synonyms-catalog.test.js`. Fixes the marquee
afib misroutes and four probe-surfaced gaps (serotonin syndrome, COPD admission, frailty,
pediatric GFR).

**Ranked resolver API (`lib/prompt.js`).** New `resolvePromptRanked(query, tiles, synonyms,
audience, limit)` returns the top-N with a per-hit `why`; `rankTiles`/`resolvePrompt` are its
provable head (top-1), so single-route and list callers never disagree. Signature, threshold, and
null contract of `resolvePrompt` are unchanged.

**Corpus-enriched ranking, both surfaces.** The browser (`app.js`) loads the corpus beside
`loadSynonyms()` and fills each `tileCorpus()` row's `desc` from the corpus prose; the MCP server
does the same when assembling `find_calculator`'s tiles. A shared pure `lib/search-corpus.js`
(`corpusDesc`, `corpusOneLiner`) keeps the two surfaces ranking over identical text. A query term
living only in a tile's summary or bands ("antithrombotic therapy not recommended") now routes.
Accelerator-not-dependency: if the corpus is absent, ranking is exactly as before.

**MCP `find_calculator` (spec-v183 §2.2 fence re-opened to four tools).** A fourth, read-only,
deterministic discovery tool: `{ query, limit?, group?, specialty? }` → top-N candidates
`{ id, name, group, specialties, summary, why }`, backed by the shared ranked resolver + synonym
table + corpus. `list_calculators`/`describe_calculator`/`compute_calculator` are byte-untouched;
no new adapters, so coverage/catalog counts are unchanged.

**Answer-shaped results (`app.js`, `styles.css`).** The hero dropdown's top row becomes a
compact answer card: for a synonym-routed hit, a plain-language one-liner (from the corpus) plus a
`matched: "<phrase>"` breadcrumb, so a non-obvious route explains itself. For an unambiguous
numeric query, a pure inline-compute parser (`lib/query-compute.js`) shows the value on the target
tile's option and Enter opens the tile prefilled via the existing `q=` hash-state — a round-trip
where the tile recomputes the same number. Allow-list: BMI, BSA, MAP, anion gap, corrected
calcium, corrected sodium, Cockcroft-Gault CrCl, ideal body weight. All rows stay ordinary listbox
options, so the combobox accessibility contract (roles, `aria-activedescendant`, keyboard
wrap-around, Enter/Escape) is untouched.

## Verification

- Unit: synonym-catalog routing + integrity; corpus determinism / size-budget / hash / no-forbidden-chars; `resolvePromptRanked` list contract; `query-compute` per-template parses and null-on-ambiguous.
- e2e (Playwright): corpus-prose routing, answer card + breadcrumb, inline-compute round-trip (numeric input + select field prefill), combobox smoke + mobile 320px no-overflow unregressed.
- MCP: `find_calculator` worked queries + the three existing tools' contracts unchanged; `check-mcp-catalog` clean.

## Deferred

- The IDF/BM25-lite scoring and the token→postings index (`plain-language-search` tasks 2.2,
  3.1-3.4): prototypes over the corpus show real prose-term recall wins but also new noise that
  needs tuning; the flat rubric + corpus `desc` channel already delivers the recall.
- The related-tools chips (`answer-shaped-results` task 2) and the shared `lib/search-doc.js`
  extraction (`mcp-find-calculator` task 1.1) land with that ranker work.
- Zero-result "did you mean": explored and dropped — both matchers are lenient enough that
  one-edit-rescuable queries rarely return zero, so the affordance would seldom fire.
