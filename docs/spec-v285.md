# spec-v285.md — Search-relevance golden set + the v11 synonym gap batch

> Status: **BUILT (2026-07-10).** Successor to the [spec-v282](spec-v282.md) search program;
> the harness that unblocks its deferred IDF/BM25-lite ranker slice. One data file (three
> synonym rows) and one test file — no compute, no catalog, no MCP contract change.

## Why

spec-v282 deferred the term-weighted ranker because prototypes showed recall wins *and* new
noise, and there was no objective gate to tune against: the existing tests spot-check four
queries over fixture tiles. Any future ranker (or synonym/corpus edit) needs a regression bar
made of real clinical queries over the real catalog. This slice builds that bar and, in
curating it, fixed the three routing gaps the probes surfaced — the same probe→synonym-fix loop
spec-v282 used.

## What shipped

**Golden set (`test/mcp/mcp-search-relevance.test.js`).** 59 vetted probes — marquee synonym
canaries plus nurse-phrased prose queries ("pneumonia severity outpatient or admit", "free water
deficit hypernatremia") — run through the real `find_calculator` surface (shared
`resolvePromptRanked` + `data/synonyms.json` + `data/search-corpus` over the exposed registry),
asserting an acceptable tile ranks top-3. Curation rules are encoded in the file: no
aspirational rows (every probe passed at authoring), `want` lists every clinically acceptable
answer (any pancreatitis-severity tile is a correct route), probes phrased as typed, not as tile
names. A hygiene test keeps the table normalized. **This file is the gate the deferred
`plain-language-search` 2.2 ranker must keep green — and should extend — before it lands.**

**v11 synonym batch (`data/synonyms.json`, v10 → v11, 73 → 74 entries).** Probe-surfaced fixes:
- `qsofa-sofa` gains "sepsis screen" / "sepsis screening" ("sepsis screen bedside" previously
  routed to unrelated screener tiles);
- new `rass` entry ("sedation scale", "sedation depth", "richmond agitation", "agitation
  sedation scale") — the tile had no synonyms and ranked 4th for "sedation depth scale";
- `hasbled` gains "anticoagulation bleeding risk" / "afib bleeding risk".
Each fix is pinned by a synonym-routed (`why: "synonym"`) regression test.

## Known limitation, recorded for the ranker work

A two-intent query ("anticoagulation bleeding risk atrial fibrillation") resolves by the synonym
tie-break — shorter phrase wins — so "atrial fibrillation" routes it to `chads` over `hasbled`.
Arbitrating that needs term-weighted ranking; the golden set deliberately excludes the probe and
documents it as the first test the future ranker should add.

## Verification

Golden set 59/59 top-3; full unit suite (7,557), `test:mcp` (155 → 158 with the three new
tests), lint, build, and the 30-test chromium smoke sweep (hero search surface) all green.
