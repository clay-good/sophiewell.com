# Tasks — plain-language search

## 1. Corpus builder

- [x] 1.1 Write `scripts/build-search-corpus.mjs`: assemble per-tile rows from UTILITIES
      (name/group/audiences), META (specialties, `example.expected`, interpretation-band text),
      `data/tool-copy/*.json` (`whatThisIs`/`whenToUse`), and adapter summaries via
      `mcp/catalog.js` (Design D1). Skip the adapter source silently if `mcp/` is absent.
      (tool-copy `what`/`when` + META `expected` used as FALLBACKS only where a tile has no
      adapter summary, to hold the budget with headroom; every tile gets prose. All source
      prose sanitized: en/em dash -> hyphen, smart quotes -> ASCII.)
- [x] 1.2 Emit `data/search-corpus/manifest.json` + `corpus.json` shard with sorted ids and
      stable key order; two consecutive builds are byte-identical (guarded by
      `test/unit/search-corpus.test.js`, and `verify-integrity` now covers the manifest hash).
- [x] 1.3 Enforce the size budget (≤200 KB gzipped, currently 186 KB) with a hard assertion in
      the builder; catalog-truth held by sanitizing emitted strings and keeping the corpus off
      the 12 counted surfaces / grep-check scan.
- [x] 1.4 Wire the builder into `npm run build` (via `regenerate()` in `scripts/build.mjs`,
      before the `data/` -> `dist/` copy). Standalone: `node scripts/build-search-corpus.mjs`.

## 2. Corpus loader (SPA)

- [x] 2.1 Load `data/search-corpus/` lazily beside `loadSynonyms()` (`app.js`); on success,
      enrich `tileCorpus()` rows (desc <- corpus summary/band/example prose via the shared
      `lib/search-corpus.js` `corpusDesc`) and invalidate the tile-corpus cache; on failure,
      desc stays '' (Design D7). e2e: a band-text query ("antithrombotic therapy not
      recommended") routes to `chads` in-browser; synonym + BMI smokes unregressed.
- [ ] 2.2 Build the token→postings index once per session, deferred off first paint (idle
      callback). DEFERRED with the IDF ranker (tasks 3.1-3.4): the flat ranker re-tokenizes per
      keystroke over ~1,140 short docs (sub-frame today); the postings index lands when the
      IDF/BM25-lite scoring does, which is what makes it worthwhile.

## 3. Ranker upgrade (`lib/prompt.js`)

- [ ] 3.1 Add field-weighted BM25-lite scoring with IDF and fixed-precision arithmetic
      (Design D2); keep the module pure (no DOM, no fetch).
- [~] 3.2 Bounded suffix-stemmer (Design D3): the SAFE SUBSET shipped 2026-07-10 (spec-v286) —
      plural-only fold (`stemToken`, guards for -ss/-us/-is and short tokens) applied
      identically to corpus and query tokens. The ing/ion derivational pairs stay deferred
      with 3.1: the prototype showed order-dependent noise (prediction<->predicting), and the
      golden set records "transfuse vs transfusion" as their acceptance probe.
- [x] 3.3 Question-scaffold/stopword stripping shipped 2026-07-10 (spec-v286): reviewed
      QUERY_STOPWORDS constant, ranking-view-only strip with all-scaffold fallback; raw query
      keeps the exact-phrase bonuses. Gated by the spec-v285 golden set (extended 59 -> 68
      probes, all top-3).
- [x] 3.4 Full-vocabulary typo pass shipped 2026-07-10 (spec-v287): `tokenEditFallback`
      rewrites one unknown token against the length-bucketed tile vocabulary (±1 length,
      3-attempt cap, WeakMap session memo), and `rankWithRepair` lets the repaired reading
      lead only when it beats the literal reading by a name-token (+3) margin — the safety
      valve the flat rubric needs until IDF lands (a "wean"→"mean" corruption only gains
      common-token points and is rejected). Golden set 68 → 75 probes; the tie case
      ("heprin drip") is recorded as an IDF acceptance probe.
- [x] 3.5 Export `resolvePromptRanked(...)` (top-N with `why`). Kept `resolvePrompt` untouched
      for zero regression risk; instead extracted `rankTilesAll` (score-ordered, threshold-
      gated) so `rankTiles`/`resolvePrompt` are provably its head, and `resolvePromptRanked`
      composes synonym-lead -> ranker -> typo-fallback in the same precedence. (Tasks 3.1-3.4,
      the IDF/stem/scaffold scoring, still pending: prototypes show real prose-term recall wins
      but also new noise that needs tuning + the app.js corpus loader (task 2) + e2e; deferred
      to a dedicated slice. The ranked API here already unblocks answer-shaped-results and
      mcp-find-calculator, which consume top-N with `why`.)

## 4. Synonym expansion

- [x] 4.1 Author the expanded `data/synonyms.json` batch: clinical abbreviations, eponym
      aliases, canonical-intent phrases (incl. "stroke risk in afib" → `chads`,
      "afib"/"a fib" → atrial-fibrillation tiles). Bump `version`. (v8-2026-07-10: 9 → 57
      entries / 207 phrases; both afib marquee misroutes fixed.)
- [x] 4.2 Review pass: every new row maps to an existing tile id (guard test), phrases are
      lowercase-normalized, no duplicates across entries. (`test/unit/synonyms-catalog.test.js`
      pins lowercase-uniqueness + marquee routing + non-regression; the pre-existing
      `synonyms.test.js` already guards tile-id validity/audience/non-empty. v9-2026-07-10
      extended to 68 entries / 254 phrases, adding NL intents the ranker differential
      surfaced as fragile ties: fall-risk, pressure-injury, kidney-function estimate,
      steroid/opioid conversion, hyponatremia correction-rate.)

## 5. Tests & guards

- [ ] 5.1 Unit: the misroute table from the proposal becomes fixtures — "stroke risk in afib"
      → `chads` first; "sodium is low how fast can i correct it" → `sodium-correction` first;
      existing routes ("burn fluid", "alcohol withdrawal severity", "kidney function") do not
      regress.
- [ ] 5.2 Unit: scaffold stripping ("what is the X" ranks same top tile as "X"), stemming
      (correct/correction), IDF (a name-only "score"/"risk" tile does not beat a
      summary-matched canonical tile), typo pass ("cockroft gault" resolves).
- [ ] 5.3 Unit: corpus-absent degradation — with unenriched rows, ranking equals today's
      behavior on the existing fixture set.
- [ ] 5.4 Guard: corpus builder determinism (build twice, compare bytes) and size budget.
- [ ] 5.5 e2e: hero-search flow — type a question, correct tile is the top option, Enter
      routes; offline (SW) still serves the cached corpus.

## 6. Ship

- [ ] 6.1 `npm run lint`, `npm test`, `npm run build` green; `git checkout -- data/` rules do
      not apply to `data/search-corpus/` (it is a committed build output — decide and document
      whether it is committed or dist-only at build time; default: dist-only, like the SEO
      pages).
- [x] 6.2 `docs/spec-v282.md` records the routing upgrade (successor to spec-v8), folding the
      corpus + ranked-API + synonym + enrichment deltas in.
- [ ] 6.3 Catalog count unchanged; CHANGELOG entry.
