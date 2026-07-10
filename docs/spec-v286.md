# spec-v286.md — Question-scaffold stripping + plural fold in the shared ranker

> Status: **BUILT (2026-07-10).** The first ranker slice unblocked by the
> [spec-v285](spec-v285.md) golden set; ships the safe subset of the
> `plain-language-search` tasks 3.2/3.3 (Designs D3/D4). One module (`lib/prompt.js`), both
> surfaces (browser hero search + MCP `find_calculator`), no API or contract change.

## Why

A nurse types questions, not keywords. In "how much maintenance fluid for a child," the
scaffolding tokens ("how", "much", "for", "a") each collected +1 desc hits across hundreds of
corpus-enriched tiles, drowning the two clinical terms — the query missed `maint-fluids`
entirely. And bare plurals didn't fold: "what fluids does a burn patient need" couldn't see
`Burn Fluid Resuscitation`. spec-v282 deferred all ranker work for lack of a tuning bar;
spec-v285 built the bar; this slice ships the two lowest-risk pieces against it.

## What shipped

**D4 — scaffold strip (task 3.3, complete).** A reviewed `QUERY_STOPWORDS` constant
(interrogative scaffolding and pure function words only — never a clinical term) is stripped
from the *ranking* view of the query. The raw query still drives the exact-phrase bonuses, so
verbatim tile-name queries keep their +10; an all-scaffold query falls back to its unstripped
tokens rather than matching nothing.

**D3 — plural-only fold (task 3.2, safe subset).** `stemToken` folds bare plurals ("fluids" →
"fluid", "scores" → "score") on both the corpus and query sides, with guards for short tokens
and -ss/-us/-is endings (sepsis, status stay intact). The design's ing/ion derivational pairs
are deliberately **not** folded: the spec-v282 prototype showed order-dependent noise
(prediction ↔ predicting misrouted "predicting bleeding risk"), so they stay deferred with the
IDF ranker (task 3.1), and the golden set records "when should i transfuse for anemia"
(transfuse vs transfusion) as their acceptance probe.

## Measured effect

The 10-probe question-phrased vetting set went 7/10 → 9/10 top-3 (the remaining miss is the
recorded transfuse/transfusion derivational gap); the noise floor visibly dropped (irrelevant
top-5 rows disappeared). The 9 passing question probes joined the golden set (59 → 68 probes,
all top-3, still zero aspirational rows).

## Verification

- 5 new unit tests pin the behavior: question-phrased routing, plural fold both directions,
  the -ss/-is guards, the all-scaffold fallback, and the raw-query exact-phrase bonus.
- Golden set 68/68 top-3; the original 59 rows unchanged and green (no regression).
- Full suites green: unit 7,562; `test:mcp` 158; lint; build; 30-test chromium smoke sweep
  (hero search surface).

## Still deferred (with the IDF/BM25-lite slice, tasks 2.2 / 3.1 / 3.4)

Field-weighted IDF scoring, the token→postings index, derivational stemming pairs, and the
full-vocabulary typo pass — plus the two golden-set "known limitation" probes that define their
acceptance: the two-intent synonym tie-break and transfuse/transfusion.
