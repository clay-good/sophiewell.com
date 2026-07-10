# Tasks — plain-language search

## 1. Corpus builder

- [ ] 1.1 Write `scripts/build-search-corpus.mjs`: assemble per-tile rows from UTILITIES
      (name/group/audiences), META (specialties, `example.expected`, interpretation-band text),
      `data/tool-copy/*.json` (`whatThisIs`/`whenToUse`), and adapter summaries via
      `mcp/catalog.js` (Design D1). Skip the adapter source silently if `mcp/` is absent.
- [ ] 1.2 Emit `data/search-corpus/manifest.json` + shard with sorted ids and stable key order;
      two consecutive builds are byte-identical.
- [ ] 1.3 Enforce the size budget (≤200 KB gzipped) and the catalog-truth rule (no spec/build
      refs, no hardcoded counts) with assertions inside the builder.
- [ ] 1.4 Wire the builder into `npm run build` (and document the standalone invocation).

## 2. Corpus loader (SPA)

- [ ] 2.1 Load `data/search-corpus/` lazily beside `loadSynonyms()` (`app.js`); on success,
      enrich `tileCorpus()` rows with the new fields; on failure, rows stay as today
      (Design D7).
- [ ] 2.2 Build the token→postings index once per session, deferred off first paint (idle
      callback), not on the fetch callback's critical path.

## 3. Ranker upgrade (`lib/prompt.js`)

- [ ] 3.1 Add field-weighted BM25-lite scoring with IDF and fixed-precision arithmetic
      (Design D2); keep the module pure (no DOM, no fetch).
- [ ] 3.2 Add the bounded suffix-stemmer (Design D3) applied to corpus and query tokens.
- [ ] 3.3 Add question-scaffold/stopword stripping for the ranking view of the query, keeping
      the raw query for exact-phrase bonuses (Design D4).
- [ ] 3.4 Extend the typo pass to the full corpus vocabulary with length-bucketed candidates
      (Design D5).
- [ ] 3.5 Export `resolvePromptRanked(...)` (top-N with `why`); reimplement `resolvePrompt` as
      its top-1 wrapper preserving signature, threshold, and null contract.

## 4. Synonym expansion

- [x] 4.1 Author the expanded `data/synonyms.json` batch: clinical abbreviations, eponym
      aliases, canonical-intent phrases (incl. "stroke risk in afib" → `chads`,
      "afib"/"a fib" → atrial-fibrillation tiles). Bump `version`. (v8-2026-07-10: 9 → 57
      entries / 207 phrases; both afib marquee misroutes fixed.)
- [x] 4.2 Review pass: every new row maps to an existing tile id (guard test), phrases are
      lowercase-normalized, no duplicates across entries. (`test/unit/synonyms-catalog.test.js`
      pins lowercase-uniqueness + marquee routing + non-regression; the pre-existing
      `synonyms.test.js` already guards tile-id validity/audience/non-empty.)

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
- [ ] 6.2 Author the `docs/spec-v*.md` successor to spec-v8 recording the routing upgrade;
      fold this change's requirements in.
- [ ] 6.3 Catalog count unchanged; CHANGELOG entry.
