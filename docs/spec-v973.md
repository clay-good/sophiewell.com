# spec-v973 — Retiring the four duplicates the citation found

## What this executes

spec-v972 taught the duplicate finder to read the citation and confirmed four pairs by opening
both renderers and both library functions. This retires the thinner half of each.

| Retired | Survivor | Why the survivor |
| --- | --- | --- |
| `qtc-suite` | `qtc` | it carries the plain-language synonyms and the shorter id, and `qtc` already returned all four corrections |
| `kings-score` | `king-score` | its three bands are ranges rather than a formula row, and it cites the DOI |
| `four-ts` | `four-ts-hit` | each criterion is a select printing the level in full, it carries the rule-out testing advice, and its timing window is the ASH days 5-14 rather than the narrower 5-10 |
| `bsa_burn` | `lund-browder` | `bsa_burn` had no age chart at all |

Catalog **1,708 → 1,704**.

## The two that are worth reading twice

**`bsa_burn` was not a Lund-Browder tile.** It offered "Lund-Browder" as a method and then asked
the reader to *"age-adjust per chart"* by hand and typed the percentages in, summing whatever it
was given. On an adult with an entirely burned anterior trunk it returned the Rule-of-Nines
**18%**. The survivor holds the age table: it returns the chart value **13%**, reports 18% beside
it as an independent cross-check, and scores a burned head at 19% for an infant against 7% for an
adult — a distinction the retired tile could not make at all. Those four numbers are now in
`test/mcp/mcp-compute.test.js` in place of the retired tile's assertions.

**`qtc` and `qtc-suite` had been split down the middle.** The plain-language search phrases
("qtc", "corrected qt", "qt interval") reached `qtc`; the prefill template in
`lib/query-compute.js` that answers those same phrases with a computed number pointed at
`qtc-suite` and filled its field ids. A reader searching and a reader typing a question landed on
two different tiles for one calculation. Both now go to `qtc`.

## The thing that had to move rather than be deleted

`four-ts` carried the **derivation panel** — the "show your work" block that prints each domain
with the reader's own input beside it — and `four-ts-hit` had none.

It was transplanted, and **not copied**. The block's `components[].inputKey` names the arguments
of the *scoring function*, and the two tiles call different ones: `fourTsHit()` takes
`timing` where the retired `fourTs()` took `timingOfFall`. A copied block would have scored that
domain at **zero on every input** and printed a panel that said nothing while looking right —
exactly the spec-v914 and spec-v948 failure, a third time. The counterfactual is pinned:
`test/unit/derivation.test.js` asserts the stale key sums to **2** where the live score is **4**.

The domain text is the survivor's, so the transplanted formula reads days 5-14.

## A checker that had been reading the app map wrong

`check-mcp-catalog.mjs` parses `RETIRED_TILE_ALIASES` out of `app.js` with a character class of
`[a-z0-9-]`. `bsa_burn` is a live tile id and contains an underscore, so the alias was there and
the checker reported it missing. Widened to `[a-z0-9_-]`.

And `scripts/lib/topics.mjs` still named `cincinnati`, retired in spec-v948; the topic builder had
been printing `references unknown tile "cincinnati" - skipping` on every build and dropping a link
from the triage topic page. Repointed to `cpss`.

## Every surface a retired id reaches

`data/id-aliases.json` (four aliases, sunset 2027-09-02) · `app.js` `RETIRED_TILE_ALIASES` and
`UTILITIES` · `lib/meta.js` (four entries removed; 12 `related` lists and graph rows repointed at
survivors, 0 dangling) · `data/synonyms.json` (four-ts's five phrases merged into `four-ts-hit`,
kings-score's four repointed to `king-score`) · `lib/query-compute.js` · `views/` (three renderers
cut, `group-v697.js` deleted) · `mcp/adapters/` (three entries cut, `kings-score-v697.js`
deleted), `mcp/catalog.js`, `docs/mcp-coverage.md` · `data/fields/`, `data/citation-url-backlog.json`,
`data/search-corpus/`, `report-catalog.js` · `scripts/lib/topics.mjs` · tests and fixtures · the
count surfaces in `index.html` (×9), `README.md` (×3), `package.json` and
`docs/scope-mdcalc-parity.md`.

The pure library functions (`fourTs`, `qtcAll`, `kingsScore`, `ruleOfNines`) and their unit tests
stay, as they did at spec-v948: they are tested, they reach no reader, and removing them is a
separate call.

## Proof

| Check | Result |
| --- | --- |
| `/#qtc-suite`, `/#kings-score`, `/#four-ts`, `/#bsa_burn` in the live app | each redirects to its survivor, correct `<h1>` and `<title>` |
| the transplanted panel, live | changing Timing from 2 to 0 moves the panel row **and** the score together, 8 → 6 |
| stale-inputKey counterfactual | sums to 2 where the score is 4, and is asserted |
| `related` entries pointing at a missing tile | **0** |
| `npm run lint` | clean — 1,704 tiles across 13 surfaces, ledger exact |
| `npm run test` / `test:mcp` | 12,991 pass / 421 pass |
| `npm run build` | clean, 1,704 tool pages, no unknown-tile warning |
