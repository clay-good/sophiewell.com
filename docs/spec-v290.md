# spec-v290.md — Derivational folds: a reviewed pair table, and the ranker program closes

> Status: **BUILT (2026-07-10).** Fifth and final slice of the SESSION-38 ranker program
> ([spec-v285](spec-v285.md) golden set → [v286](spec-v286.md) scaffold/plurals →
> [v287](spec-v287.md) typo repair → [v288](spec-v288.md) sub-point IDF →
> [v289](spec-v289.md) two-intent tie-break). One constant in `lib/prompt.js`, both surfaces.

## Why

The last recorded golden-set limitation: clinical verb forms didn't match noun-form tiles
("intubate" vs Intubation Difficulty Scale, "dialyze" vs dialysis tiles, "transfuse" vs
transfusion scores). The design sketched general ing/ion suffix rules, but the spec-v282
prototype proved blind stripping is inherently noisy ("staging" → "stag",
prediction ↔ predicting misroutes) — no gate fixes a corrupted token.

## What shipped

`DERIVATIONAL_FOLDS`: a reviewed constant mapping hand-vetted clinical verb forms to their
noun form (transfuse/transfusing → transfusion, intubate, extubate, sedate, resuscitate,
anticoagulate, dialyze → dialysis), applied inside `stemToken` before the plural fold —
identical on corpus and query sides, like every fold before it. **The general suffix rules are
permanently rejected**; the table extends only with a golden-set probe demonstrating a real
gap, the same evidence bar as everything else in this program.

Golden set: 78 → 80 ("intubate this patient", "dialyze for toxic alcohol"). Two unit tests pin
the fold and its boundary (unlisted -ing forms like "staging" never fold). The header now
records **zero remaining ranking limitations** — and one catalog-gap observation: "when should
i transfuse for anemia" has no right answer because the catalog has no
restrictive-transfusion-threshold (TRICC/AABB) tile; every transfusion tile is a
massive-transfusion score or a peds volume calculator. That is a catalog-governance question
(the spec-v29 one-line test), not a search one.

## Program summary (spec-v285 → v290)

| Slice | What | Probe delta |
|---|---|---|
| v285 | golden-set harness + v11 synonyms | 59 probes |
| v286 | scaffold strip + plural fold | +9 question probes |
| v287 | full-vocabulary typo repair (margin gate) | +7 typo probes |
| v288 | sub-point IDF + rare-repair gate + rescue precedence + v12 synonyms | +2 (former limitations) |
| v289 | tier-3 coverage tie-break | +1 (two-intent) |
| v290 | reviewed derivational pairs | +2 (verb forms) |

All deterministic, no AI, no API change; `resolvePrompt` stayed the provable head of
`resolvePromptRanked` throughout. Still deferred (needs new probe evidence): the full BM25
field-weight rescale + token→postings index, related-tools chips, `lib/search-doc.js`
extraction.

## Verification

Unit 7,573 (39/39 in `prompt.test.js`); golden set 80/80; `test:mcp` 158; lint; build;
30-test chromium smoke sweep.
