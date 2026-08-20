# spec-v759.md — A shortened description still has to read as a finished phrase

> Status: **SHIPPED (2026-08-20).** Copy only. No tile added, no compute changed. Catalog stays **1564**.

## Why

Found by looking at the live site after [spec-v756](spec-v756.md) shipped. The disambiguation card
for `correct the sodium` rendered this:

> Combined electrolyte-correction panel: albumin-corrected calcium plus glucose-corrected sodium
> **(Katz factor 1.6 and**

A description that stops on a conjunction, inside a bracket it never closes, does not read as a
description that was shortened. It reads as a page that broke.

`corpusOneLiner` shortened by cutting at the last space before the limit, which is the obvious
implementation and produces exactly this. It renders on the disambiguation card and on **every
search result**, so it was wrong 37 times across the catalog and nobody had looked.

## What it does

Two rules, applied to every one-liner.

| | |
|---|---|
| **A sentence does not end inside a bracket** | `indexOf('. ')` split *"Boey score (Boey J, et al. 1987)"* at the author initials. The split is depth-aware now, and skips a period after a single capital or a known abbreviation. Same rule as `splitLead()` in `lib/long-note.js`. |
| **A clamped line does not end on a connective** | `and`, `with`, `within`, `of`, `by`, `using`… trimmed off the end, however many deep. |
| **A clamped line closes every bracket it opens** | Checked **last**, after all trimming. |

## The order of those last two is the whole bug

The first fix backed out of an open bracket at the cut and then trimmed words. That fixed 34 of 37
and left three, because it had the dependency backwards: the cut itself can be **balanced** —
`(types I-IV),` — and it is the *trimming afterwards* that removes the token carrying the `)`.

Bracket-closing has to run on the final string, once nothing more will be removed.

Two smaller mistakes on the way, both worth naming:

- **The split-word test was one-sided.** Checking only the character *after* the cut threw away a
  complete final word every time the cut landed on a space: `(absolute or ratio within 48 h),` lost
  `h),`, then unravelled back through `48` and `within` to an unbalanced `(absolute or ratio`. A
  word is only split when there is a word character on **both** sides of the cut.
- **A token with no letters is not droppable.** `48 h` and `1-3` end real phrases. Only connectives
  are droppable.

## Measured

Across all 1564 one-liners:

| | before | after |
|---|---|---|
| Ending on a connective | 5 | **0** |
| Unbalanced brackets | 37 | **0** |
| Over the length limit | 0 | 0 |

## Where it lives

- `lib/search-corpus.js` — `clampToPhrase()`, `closeBrackets()`, `firstSentenceEnd()`, `DANGLING`.

The rule is reimplemented rather than imported from `lib/long-note.js`: that module pulls in
`dom.js`, and `search-corpus.js` is host-free on purpose so `mcp/tools.js` can use it — a DOM
import there would also trip `check-mcp-catalog`'s no-DOM-coupling gate.

## Proof

- `test/unit/search-corpus.test.js` — 5 new: never ends on a connective; closes every bracket in
  **both** the cut-inside-a-bracket case and the harder balanced-cut-then-trimmed case; keeps a
  meaningful letter-free final token (`48 h`); leaves a short line alone; and does not split a
  sentence at author initials.
- Catalog sweep: 1564 one-liners, 0 dangling, 0 unbalanced.
- 11460 unit, 397 mcp, lint, 38 smoke: green.
