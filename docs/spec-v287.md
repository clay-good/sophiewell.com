# spec-v287.md — Full-vocabulary typo repair in the shared ranker

> Status: **BUILT (2026-07-10).** Second ranker slice gated by the [spec-v285](spec-v285.md)
> golden set; ships `plain-language-search` task 3.4 (Design D5) after
> [spec-v286](spec-v286.md)'s scaffold-strip/plural slice. One module (`lib/prompt.js`), both
> surfaces (browser hero search + MCP `find_calculator`), no API or contract change.

## Why

The typo pass only knew the synonym table's vocabulary, so a misspelled tile-name term with no
synonym entry was unrecoverable: "bradan scale" surfaced five wrong scales, "corected calcium"
buried the right tile at rank 5. The design's D5 asks for a one-edit rewrite against the full
tile vocabulary — but built naively it corrupts valid words: the build's first cut rewrote
"wean" (a real clinical term the vocabulary happens to lack) into "mean" and knocked the
golden-set probe "rsbi wean vent" off rank 1.

## What shipped

**`tokenEditFallback`.** Rewrites at most one unknown query token (first hit wins, three
attempts, tokens ≥ 3 chars, stopwords skipped) to a one-edit neighbor from the tile vocabulary
(name/desc/tags/specialties tokens, stemmed like the ranker), then re-ranks the repaired
query. The vocabulary map is length-bucketed (only ±1-length candidates scanned) and memoized
per tiles-array identity (WeakMap) — the bounded-cost shape D5 specified.

**`rankWithRepair` — the margin gate (build-time refinement).** Both resolvers now rank
through a shared view where the repaired reading may lead only if (a) the literal reading has
no exact-phrase-strength hit (top < 10) and (b) the repair beats it by at least a name-token
margin (+3). The margin is the safety valve the flat rubric needs without IDF: corrupting a
valid rare word only ever gains common-token points (+1s) and is rejected, while a genuine typo
repair unlocks name/phrase evidence (+3/+10) and clears it. `resolvePrompt` stays the provable
head of `resolvePromptRanked`. Repaired hits carry `why: 'token-edit-distance'` (additive; the
answer card only special-cases `synonym`).

## Measured effect

The 12-probe typo vetting set went 8/12 → 10/12 top-3 ("bradan scale" MISS → rank 1,
"corected calcium" rank 5 → 2; "glascow/apgarr/cockroft/gapp/fals/ciwaa/qsofaa" stay green).
The 7 newly-passing probes joined the golden set (68 → 75, all top-3, prior rows unchanged).
The two remaining are recorded as IDF acceptance probes: "heprin drip" (heparin-nomogram ties
the drip tiles at 4 — the margin gate correctly refuses a tie) and "wels criteria pe" (literal
reading already strong at rank 4). Both need term weighting to know "heparin" outweighs
"drip"; they join the two spec-v285/v286 limitation probes as the deferred IDF slice's
acceptance tests.

## Verification

- 3 new unit tests: vocabulary repair recovers a name-token typo end-to-end
  (`why: 'token-edit-distance'`), the margin gate rejects a common-token-only rewrite (the
  "wean"→"mean" shape, pinned as a fixture), and an exact-phrase-strong literal reading skips
  the repair byte-identically.
- Golden set 75/75 top-3 (59 spec-v285 + 9 spec-v286 + 7 new); regression caught live during
  the build — the pre-margin cut demoted "rsbi wean vent" and the set flagged it immediately.
- Full suites green: unit 7,565; `test:mcp` 158; lint; build; 30-test chromium smoke sweep.

## Still deferred (the IDF/BM25-lite slice, tasks 2.2 / 3.1)

Field-weighted IDF scoring and the token→postings index, plus the ing/ion stem pairs — now
with four recorded acceptance probes (two-intent tie-break, transfuse/transfusion,
heprin-drip tie, wels-criteria rank).
