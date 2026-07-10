# Change: Plain-language search — corpus + deterministic question routing

## Why

Since the spec-v51/v53 minimalist pivot, the hero search **is** the product's front door, and
its label invites a question: *"What do you need to figure out?"* But the resolver behind it
(`resolvePrompt`, spec-v8 §4.3) ranks a starved corpus: `tileCorpus()` hardcodes `desc: ''` and
`tags` is empty for every tile (`app.js:2630-2648` — the descriptions died with the spec-v51/53
tile grid), so question routing runs on **tile names + ids + specialties + the 9-entry synonym
table**. Measured against the live catalog (Node, 2026-07-10), plain questions misroute:

| Question | Routes to | Should be |
|---|---|---|
| "stroke risk in afib" | `canadian-tia-score` | `chads` (CHA2DS2-VASc) |
| "what is the stroke risk for my patient with atrial fibrillation" | `charge-af` (predicts *developing* AF) | `chads` |
| "sodium is low how fast can i correct it" | `fast-ed` (matched the token "fast") | `sodium-correction` |

The root causes are all deterministic gaps: (1) the richest hand-written prose in the repo is
never indexed — 1,044 MCP adapter one-line summaries, 122 `data/tool-copy` `whatThisIs`/
`whenToUse` files (build-time only today), 1,127 `META.example.expected` sentences, 2,264
interpretation-band texts; (2) no token rarity weighting, so near-universal tokens ("score,"
"risk," "fast") in a tile *name* always beat the right tile; (3) no inflection tolerance
("correct" ≠ "correction"); (4) typo recovery only consults the 54 synonym phrases; (5) the
synonym table itself has 9 entries. **No AI is needed or added** — this change stays entirely
inside the site's "No AI" commitment.

## What Changes

- **New build step `scripts/build-search-corpus.mjs`** compiles a per-tile natural-language
  search corpus under `data/search-corpus/` from *existing hand-authored sources only*: tile
  name/group/audiences (UTILITIES), specialties + `example.expected` + interpretation-band text
  (META), adapter summaries (`mcp/adapters/*`, optional — the site must stay buildable with the
  MCP subtree removed), and `data/tool-copy` prose. Budget ≤200 KB gzipped; byte-stable output.
- **Lazy corpus load in the SPA**, with the same accelerator-not-dependency semantics as
  `data/synonyms.json`: if the fetch fails, search behaves exactly as today.
- **Ranker upgrade in `lib/prompt.js`** (pure, DOM-free, fetch-free as before): field-weighted
  scoring with inverse-document-frequency, a small bounded suffix-stemmer, question-scaffold
  stripping ("what is the / how do I / should I …"), and a typo pass over the full corpus
  vocabulary instead of only the synonym phrases. A new ranked API returns the top-N with a
  per-hit `why`; `resolvePrompt`'s existing signature and top-1/threshold semantics are
  preserved for current callers.
- **Synonym table expansion** (`data/synonyms.json`): 9 → on the order of 200+ curated entries —
  clinical abbreviations (afib, sob, dka, gib, uti …), eponym aliases, and canonical-intent
  phrases ("stroke risk in afib" → `chads`). Still a reviewed, versioned, static JSON; adding a
  phrase stays a one-line PR.

## Impact

- Affected specs (folded in at build): **search-corpus** (new capability), **question-routing**
  (extends spec-v7 §3.2 / spec-v8 §4.3).
- Affected code: `lib/prompt.js`, `app.js` (corpus loader + `tileCorpus()` enrichment),
  `scripts/build-search-corpus.mjs` (new), `data/synonyms.json`, `data/search-corpus/`
  (generated), unit fixtures + hero-search e2e.
- **Untouched:** every compute, `lib/meta.js` values, MCP adapters and tools, CSP (`connect-src
  'self'` — the corpus is a same-origin `data/` asset), catalog count (`UTILITIES.length` live).
- Downstream: `answer-shaped-results` and `mcp-find-calculator` build on this change's ranked
  API and corpus.
- Docs-only proposal (propose-first); a later session builds it and records the delta in a
  `docs/spec-v*.md` successor to spec-v8.
