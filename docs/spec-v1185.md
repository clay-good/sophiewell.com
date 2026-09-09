# spec-v1185 — findable by what it answers

A tile was indexed by the prose written *about* it and by nothing else. So a
calculator could be invisible to a search naming the very things it works on:

```
"hydromorphone"             -> nothing
"morphine to hydromorphone" -> nothing
"cefepime"                  -> nothing
"fentanyl patch conversion" -> catch-head, at rank 1
```

`opioid-conversion` lists thirteen source opioids and thirteen targets in its two
picklists. `abx-renal` lists the antibiotics it renally doses. Neither could be
found by any of them — not ranked badly, **returned as an empty result** — while
the tile that does exactly that sat in the catalog.

The values were never missing. They ship in every adapter's field registry and in
`data/fields/`; the corpus builder simply never read them.

## What changed

`build-search-corpus.mjs` now reads each adapter's enum options and writes the
words a tile can answer for into a Tier-2 `answers` field, which `corpusDesc()`
folds into the search text. Two filters keep it honest:

**Only what the prose does not already say.** `opioid-conversion` names morphine
in its summary, so morphine is not repeated; the twelve opioids it never mentions
are the point.

**Only words that discriminate.** A picklist is mostly generic answer vocabulary
— unfiltered, `yes` was an option on 95 tiles, `none` on 73, `female` on 49 — and
indexing those makes *"other"* a query that returns tiles. The cut is by
document frequency rather than a hand-written stoplist, because a stoplist is a
second copy of a judgement the data already states, and it goes stale as the
catalog grows. Measured across the catalog the separation is clean: everything at
three tiles or more is generic (`solid`, `total`, `white`, `above`, `acute`);
nothing at two or fewer is (`hydromorphone` and `fentanyl` name two tiles each).

## Measured

Every option word now indexed, asked as a query, before and after:

| | |
|---|---|
| option words indexed | 704 (across 205 tiles) |
| found their tile before | 15 |
| **newly find their tile (top 5)** | **527** — 237 of them at rank 1 |
| **stopped finding their tile** | **0** |
| Tier-2 corpus | 205.1 KB → 208.5 KB gzip (budget 320 KB) |

`cefepime`, `ciprofloxacin`, `piperacillin`, `tazobactam` all reach `abx-renal`
now. A renal antibiotic dose is a bedside question, and the drug name is how it
gets asked.

Assertions are **membership, never position** — a ranking derived from the whole
catalog is not a constant, so "rank 2" would book a failure for the next wave
that ships a tile.

## What this does not do

`"morphine to hydromorphone"` still returns nothing, and the reason is in the
ranker rather than the corpus. Both words now match the tile's description, and
that is worth less than one word matching it:

| query | score for `opioid-conversion` |
|---|---|
| `hydromorphone` | 6 — `exactPhraseInDesc` 5 + `tokenInDesc` 1 |
| `morphine hydromorphone` | 2 — two × `tokenInDesc`, no phrase |

The threshold is 3. **A query of two description-only words can never reach it**,
however well both match, because the phrase bonus a single word collects for free
is worth five times a token. A reader naming two things a tile handles gets
nothing; naming one gets a hit.

That is a rubric-shape defect, not a tuning preference — but changing a weight or
the threshold reranks all 1,706 tiles at once, so it is its own wave with its own
before/after measurement. spec-v1182 and spec-v1183 split a two-sided change the
same way and for the same reason.

## Verification

`npm run release:check` green, exit code read directly rather than through a
pipe. `test/unit/findable-by-what-it-answers.test.js` negative-tested both ways:
with the frequency filter disabled it fails on the generic vocabulary, and with
`answers` unwired from `corpusDesc` all four findability cases fail.
