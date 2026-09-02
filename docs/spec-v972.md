# spec-v972 — The duplicate finder reads the citation

## What this is

A finder change and an audit. **No tile is removed here**; the four duplicates it confirms are
retired in spec-v973.

## The finding

Four more pairs are the same instrument built twice. None of them was reachable by the tile
name, which is the only signal the finder had.

| Keep | Retire | Name score | Why they are one tile |
| --- | --- | --- | --- |
| `king-score` | `kings-score` | 0.00 before this change | The same King's Score (Cross 2009): four inputs, `(age x AST x INR) / platelets`, cut-points 12.3 and 16.7. |
| `qtc` | `qtc-suite` | 0.33 | Both take a QT in ms and a heart rate and return Bazett, Fridericia, Framingham and Hodges from the same constants. |
| `four-ts-hit` | `four-ts` | 0.50 | One Lo 2006 4Ts score, the same four criteria scored 0-2 out of 8. |
| `lund-browder` | `bsa_burn` | 0.13 | Both cite Lund-Browder 1944 for %TBSA. |

And a fifth pair that is a duplicate and **cannot be retired yet**:

- **`ebv-mabl` / `max-allowable-blood-loss`** — one Gross 1983 dilution formula, both returning
  an estimated blood volume and an allowable loss. Their blood-volume factor tables **disagree**:
  neonate 85 mL/kg against 90, child 70 against 75. Retiring either changes the answer for those
  patients, so per spec-v97 this needs a source for the factor table first.

Each verdict comes from opening both renderers and both library functions.

## The two blind spots

**An apostrophe was being treated as a word boundary.** Every other punctuation mark separates
two words; a possessive does not. `King's Score` split into `king` + `s`, the `s` was dropped for
being under three characters, and the tile scored **0.00** against `Kings Score` — the same
instrument, spelled the other way, invisible to both readings of the name. Deleting the mark
before the split makes both read `kings`, and the pair scores 1.00.

**The name is not always the signal.** Two authors building one instrument usually write nearly
the same name, which is what spec-v913 was built on. Three of the four pairs above show they do
not always: *"QTc Correction"* against *"QTc Suite (Bazett / Fridericia / Framingham / Hodges)"*
scores 0.33, and *"Burn Surface Area Calculator"* against *"Lund-Browder Chart + Rule of Nines"*
scores 0.13. No floor reaches those without admitting hundreds of unrelated pairs.

What reaches them is the **citation**: one tile's citation text is the other's, verbatim, with a
clause added. That is not the same as two citations sharing most of their words — token overlap
fires on every guideline family at once (the ACC/AHA valvular guideline alone stages six lesions
from one reference) and buries the signal under them. Whole-string containment says something
much narrower: *one of these two citations was written from the other*.

It reports **36 pairs** across 1,708 tiles. Twelve are the ACC/AHA valve grid and the rest are
Tokyo-Guidelines, CDC growth-chart and ASTCT families — a backlog a reader clears in one sitting.
A 40-character floor keeps out short citations (`Bazett 1920.`) that are contained in others by
accident.

## Why `qtc-suite` is not a suite

`ccsr` / `nexus-cspine`, `wells-dvt` / `wells-dvt-caprini` and `egfr` / `egfr-suite` are all ruled
DISTINCT: a single-rule tile beside a tile that runs several rules together is a deliberate pair.
`qtc` / `qtc-suite` looks like that shape and is not, because **`qtc` already returns all four
corrections**. The suite adds nothing to run together.

## Proof

| Check | Result |
| --- | --- |
| `king-score` / `kings-score` name score | 0.00 → **1.00** |
| pairs the citation signal adds | 26, all ruled in this change |
| `find-duplicate-tiles.mjs` | 152 candidate pairs, 59 ruled, 0 unruled with a citation shape |
| `test/unit/find-duplicate-tiles.test.js` | 18 pass |
| `npm run lint` | clean |

## Files

Changed: `scripts/find-duplicate-tiles.mjs`, `test/unit/find-duplicate-tiles.test.js`.
New: this file.
