# spec-v1190 — a token the catalog knows is not a typo

`lib/prompt.js` has two edit-distance repair paths, and only one of them ever
asked whether the word was already a word.

| | skips a token when |
|---|---|
| `tokenEditFallback` | `hasToken(vocab, t)` — the tile vocabulary, built from every name and description |
| `synonymEditFallback` | it appears in a **synonym phrase**, and nothing else |

So a correctly spelled English word that no synonym happens to use was fair game.
**`bag` is one edit from `eag`**, and every bag question a nurse asks was
rewritten and answered by the estimated-average-glucose converter:

```
bag                          -> eag-a1c   [synonym-edit-distance]
iv bag                       -> eag-a1c   [synonym-edit-distance]
bag of fluid                 -> eag-a1c   [synonym-edit-distance]
how long will this bag last  -> eag-a1c   [synonym-edit-distance]
```

`Concentration-to-Rate` and `Infusion Time Remaining` sat underneath it, and
**`bag` appears in five tiles** — it is a word this catalog uses, not a
misspelling of one.

One rule written twice; only one copy got the guard. `synonymEditFallback` now
consults the same tile vocabulary its sibling always has.

## After

```
bag                          -> conc-rate, infusion-time-remaining, mgso4-preeclampsia
how long will this bag last  -> infusion-time-remaining, delta-check
```

## Both directions, because over-correcting is the mirror failure

Widening this guard would stop repairing real misspellings, which is the entire
reason the pass exists. Those are pinned beside the words it must leave alone:

| query | before | after |
|---|---|---|
| `wels` | wells-dvt | wells-dvt |
| `heprin drip` | heparin-nomogram | heparin-nomogram |
| `wells score` | wells-pe | wells-pe |

Negative-tested both ways: with the guard removed the four bag cases fail; with
it applied to *every* token, `heprin drip` stops reaching the heparin nomogram.

## What it costs

Bare **`well`** no longer reaches Wells' criteria — `well` is in the tile
vocabulary, so it is no longer repaired to `wells`. That is the guard working as
intended rather than a side effect: "well" alone is an English word, not a
request for a PE score, and `well score`, `wells`, and `wels` all still reach it
at rank 1. The trade is one ambiguous single word against every bag question in
the catalog.

## Regression, catalog-wide

| | before | after |
|---|---|---|
| tiles finding themselves at rank 1 by their own name | 1,639 | 1,639 |
| in the top 5 | 1,706 | 1,706 |
| **tiles whose top-1 changed** | — | **0 of 1,706** |

## Verification

`npm run release:check` green, exit code read directly rather than through a
pipe. All 98 existing search tests pass unchanged.
