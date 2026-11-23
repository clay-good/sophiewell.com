# spec-v1770 — The week a dataset reached the search corpus

> Status: **SHIPPED (2026-11-23)**. No tool changed; the catalog stays 2,389.

Main went red on November 22, 2026, when the weekly data refresh ([#47](https://github.com/clay-good/sophiewell.com/pull/47))
merged. Two faults, each of them in the machinery around the data rather than in the data:

## 1. A roster count was a test constant

CMS publishes the selected-drug list as a dated history: rows are added, inflation-updated and deselected, never
removed. The file of November 2, 2026 removed four — every NDC of BOTOX — the same day the District Court for the
District of Columbia held, in AbbVie's suit, that a plasma-derived biological product should not have been selected.
So the roster went from 40 drugs to 39, and `test/unit/mfp-prices-v1506.test.js` asserted 40.

A roster the weekly refresh rewrites cannot be a constant in a test. What it asserts now is the rule: the picker is
the file's own roster, in the file's order, every entry named, with the ten drugs priced from January 1, 2026 all
still offered.

## 2. The refresh pull request excluded the corpus, which the refresh had changed

`data/search-corpus/` is rebuilt from the catalog, and `.github/workflows/data-refresh.yml` deliberately keeps it out
of the data pull request: the rebuild picks up catalog drift that landed on main since the corpus was last committed,
and carrying that inside a data pull request is what left an earlier refresh unmergeable. The workflow's comment went
further and said a dataset *cannot* change the corpus, because the builder reads only `app.js`, `lib/meta.js`,
`mcp/catalog.js` and `data/tool-copy/`.

It can. A picker's `values` can come from a weekly dataset, and the corpus writes those values into a tool's
`answers`. Losing BOTOX from the CMS file dropped `botox` from the answers of `partd-mfp-price-check` and
`mfp-refund-check`, so the committed corpus was stale the moment the refresh merged.

The workflow now takes a baseline: it builds the corpus before a single dataset moves, puts the committed bytes back,
and compares after the refresh. A difference is the refresh's own, and the pull request carries
`data/search-corpus/`. No difference, and it is excluded exactly as before.

**And the same thing had happened to `data/fields/`, where nothing was looking at all.** That index is the
same catalog, short-keyed for the browser and for `query-fill`: `data/fields/mf.json` and `pa.json` still
offered BOTOX to an agent and to a plain-language query. Only `npm run build` rewrites those buckets, the
refresh job never ran it, and no gate compared them with the adapters. `build-field-index.mjs --check` now
does, in the `lint` chain, and the refresh job baselines, rebuilds and carries the index by the same rule as
the corpus.

The pull request is also opened as a **draft** when the gates did not pass on its bytes, which is the one
state GitHub itself will not let anyone merge. The `data-review` label and the banner at the top of the body
already said not to merge it, and #47 was merged anyway. A later week whose gates pass takes it out of draft
before merging.

## 3. The test that caught it named the wrong fault

`search-corpus: builder is deterministic` rebuilt once and compared with the committed bytes, so a stale corpus was
reported as a non-deterministic builder. The two faults are now separate assertions: a rebuild that does not
reproduce the committed bytes is **stale** and says which command fixes it; a rebuild that does not reproduce itself
is **non-deterministic**.

## 4. And the table that states every dataset's edition had drifted anyway

`docs/data-sources.md` lists the sixteen fetched federal datasets with the edition and record count of
each. Those are facts about bytes the refresh rewrites weekly, and they were typed by hand, so eleven of
the sixteen rows were wrong -- `data/mpfs/` by a whole fee-schedule quarter (the doc said RVU26D of 19,453
codes; the data is RVU27A of 19,698), `data/nadac/` by eight weeks, `data/drg/` naming FY2026 as current
when FY2027 took effect on October 1.

`scripts/build-data-sources-doc.mjs` now writes those two columns from each dataset's manifest, and
`--check` is in the `lint` chain, so the doc cannot drift again without a red gate. Where a publisher names
which date its edition is ("change log of", "file of", "content current as of"), the words are kept and
only the date is derived. The "Source" column stays hand-written: it says what a dataset IS, which no
manifest knows. The refresh job runs the writer and the pull request carries the doc.

| What | Where |
|---|---|
| The writer and gate | `scripts/build-data-sources-doc.mjs` (`--check` in `npm run lint`) |
| The field index's own staleness gate | `scripts/build-field-index.mjs --check` (in `npm run lint`) |
| The index baselines, the writer step, the carry decisions | `.github/workflows/data-refresh.yml` |
| Stale vs non-deterministic | `test/unit/search-corpus.test.js` |
| The roster rule | `test/unit/mfp-prices-v1506.test.js` |

Tests: the MFP roster assertions above; `search-corpus` rebuilds twice. The gate itself found the eleven
stale rows it now prevents.
