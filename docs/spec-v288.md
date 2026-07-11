# spec-v288.md — Sub-point IDF: rarity tie-breaks and a smarter typo repair

> Status: **BUILT (2026-07-10).** Third ranker slice gated by the [spec-v285](spec-v285.md)
> golden set, after [spec-v286](spec-v286.md) (scaffold/plurals) and [spec-v287](spec-v287.md)
> (vocabulary typo repair). Ships the bounded form of `plain-language-search` task 3.1
> (Design D2) plus the v12 synonym row. One module (`lib/prompt.js`) + one data row, both
> surfaces, no API change; `resolvePrompt` remains the provable head of `resolvePromptRanked`.

## Why

Two golden-set "known limitation" probes needed term weighting: "heprin drip" tied
heparin-nomogram against generic drip tiles at 4 rubric points, and "wels criteria pe" couldn't
let its repair lead a weak literal reading. A full BM25 rescale (the design's maximal form)
would invalidate the threshold contract and every fixture expectation for wins the bounded form
below delivers outright — so the rescale stays deferred until a probe demands it.

## What shipped

**Sub-point IDF bonus (`rankTilesAll`).** Each threshold-passing tile gains
`0.99 × Σ idf(matched tokens) / |tokens|` — strictly below one rubric point, 4-decimal fixed
precision (Design D2's reproducibility requirement), df computed per tiles-array (WeakMap
memo). It reorders whole-point ties by evidence rarity but can never cross the integer
threshold or outvote a rubric signal; exact ties still keep catalog order.

**Typo-repair upgrades (`tokenEditFallback` / `rankWithRepair`).**
- Candidate selection is now df-max over the stem family, preferring the longest surface form,
  lexicographic on ties — the first Set-iteration hit had rewritten "wels"(→"wel") to "del".
- The neighbor search runs on raw surface forms ("wels" scans lengths 3–5 and reaches
  "wells"), so a repaired query keeps its exact-phrase bonuses.
- A rare-repair win joins the whole-point win: the repair may lead when it strictly beats the
  literal reading AND the token it rewrote into is rare (`repairIdf ≥ 0.6`). Rarity reads the
  more informative of stem-family and raw-form df — "wells" is a rare eponym even though its
  stem drowns in corpus prose ("as well as"); a corruption like "wean"→"mean" (idf ~0.54)
  stays rejected, and the literal reading's own IDF bonus defends it besides.

**Synonym-edit rescue un-starved (precedence fix).** Pass 3a (one-edit rewrite against synonym
phrases) only ran when passes 1–2 returned nothing — but the corpus-enriched ranker almost
never returns zero, so the pass had become dead code (the same leniency that killed the
"did you mean" idea in spec-v282). Both resolvers now let a synonym-edit hit outrank a *weak*
(< exact-phrase-strength) token reading; hand-curated intent beats weak token soup, and a
strong literal reading still short-circuits everything.

**v12 synonym row.** "heparin drip / gtt / infusion / nomogram" → `heparin-nomogram`. Ranking
alone cannot fix this probe — no tile text contains both "heparin" and "drip", so it is a
genuine evidence tie; the canonical-intent phrase is the correct fix (spec-v285 precedent),
and the un-starved rescue is what lets the *misspelled* "heprin drip" reach it.

## Measured effect

Typo vetting set 10/12 → 12/12 top-2 ("wels criteria pe" rank 4 → 1, "heprin drip" MISS →
rank 1). Golden set 75 → 77 (both former limitation probes promoted to probes); the question
and marquee sets are unchanged. Remaining recorded limitations — the two-intent synonym
tie-break and transfuse/transfusion derivational folding — are the acceptance tests for any
future ranker work.

## Verification

4 new unit tests (rarity tie-break, sub-point threshold guard, longest-surface candidate
selection, synonym-rescue-over-weak-reading), 37/37 in `prompt.test.js`; golden set 77/77;
unit suite 7,569; `test:mcp` 158; synonym guards green on v12; lint; build; 30-test chromium
smoke sweep.
