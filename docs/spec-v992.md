# spec-v992 — The catalog-count rule stopped seeing counts at a thousand tiles

## The finding

spec-v46 added a drift rule to `grep-check.mjs`: a number beside one of the words *tile, tool,
calculator, utilit, deterministic* in a user-facing file is a **putative tile count** and must
equal `UTILITIES.length`. It was written when the catalog was 254, and it was written as:

```js
const numRe = /(?<![\d.])(\d{3})(?![\d.])/g;
if (num < 100 || num > 999) continue;
```

**The day the catalog passed 999, the rule stopped being able to see a correct count — or an
incorrect one.** A four-digit number can never match `(\d{3})(?![\d.])`, because the fourth digit
is the lookahead the pattern forbids. It has been reporting clean for the last seven hundred
tiles, and `docs/architecture.md` said the search box ran *"over all 1145 utilities"* the whole
time. `docs/scope-post-parity.md` carried the same stale 1145.

The same lookbehind read **"1,704" as the number 704**, because it stopped at digits and let a
thousands comma through. The house number format is comma-grouped, so every correct count written
the way the style guide asks for it was one adjacency window away from being reported as a drift.

## What changed

- The literal is now `\d{1,3}(?:,\d{3})+|\d{3,4}` over `[100, 9999]`, so comma-grouped numbers are
  read whole and four digits count.
- Four digits means years look like counts — "CDC 2022", "Ley 2012 point weights". Numbers in
  1900–2099 are skipped. **That carve-out is exactly the shape of the original bug**, so
  `assertRuleStillSees` fails loudly, with the remedy, if `UTILITIES.length` ever grows into that
  band, rather than letting the rule go quiet a second time. There are 196 tiles of headroom.
- `driftedCountsOnLine` is pure and exported, and neither `grep-check.mjs` nor
  `check-catalog-truth.mjs` runs its check at import any more.
  `test/unit/catalog-count-rule.test.js` pins each half on a synthetic line — the four-digit
  drift, the three-digit drift, the comma-grouped count, the year, the blind-guard. Every one of
  them fails against the old regex.

## Two numbers the rule was never going to catch anyway

**An escape from one check is not a licence to go unchecked.** `docs/data-sources.md` states how
many tiles have hand-authored per-tile copy. That is not the catalog total, so it legitimately
carries the `catalog-truth:historical` escape — and that escape was the *only* thing holding it.
It read **122 against a live 124**. It is gated in `check-catalog-truth.mjs` against
`data/tool-copy/` now. A third copy of the same number, a stale "the 127 tiles with hand-authored
copy" in a `build-tool-pages.mjs` comment, is deleted rather than gated: the fix for a number with
three copies is usually two fewer copies.

## Four orphaned copy files, under a summary line reading "0 orphan copy"

`check-catalog-truth` asked whether a `data/tool-copy/<id>.json` belonged to an id in
`REMOVED_V29_IDS`. That is one way a tile stops existing, and not the common one. Four files
belonged to tiles retired **later** — `bsa_burn` and `qtc-suite` at spec-v973, `cincinnati` at
spec-v972, and `lights` long before — and the check printed "0 orphan copy" with all four on
disk. The guard now asks the question that matters: does a live tile render this file?

Resolving the four recovered reader-facing prose rather than just deleting it:

| File | Resolution |
| --- | --- |
| `lights.json` | renamed to `light-criteria.json` — verified against that tile's inputs and output, accurate verbatim |
| `cincinnati.json` | rewritten onto `cpss.json`, minus an unsourced "roughly 72%" and a reference to a screen the catalog does not carry |
| `bsa_burn.json` | rewritten onto `lund-browder.json` — the original described per-region thickness tagging and an adult-vs-pediatric readout that the surviving tile does not have; the survivor takes an age band and a burned fraction per region and prints a Rule-of-Nines cross-check |
| `qtc-suite.json` | deleted — `qtc` already carries better copy for the same tool |

Three tiles that had no hand-authored copy now have it, and the count goes 124 → 127.

## Proof

`grep-check` and `check-catalog-truth` clean; 13,036 unit tests including the eight new ones; the
build reports "127 with hand-authored copy", the same number the doc states and the gate checks;
both 320px mobile sweeps pass over the three pages that gained copy.
