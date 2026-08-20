# spec-v756.md — Two plain choices when the query is ambiguous

> Status: **SHIPPED (2026-08-20).** Part of [scope-one-box](scope-one-box.md).
> Depends on [v754](spec-v754.md). Catalog stays **1564**.

## Why

`correct the sodium` is two different calculators. One corrects a measured sodium for
hyperglycemia; the other works out how fast it is safe to raise sodium in hyponatremia. They are
not variants — they answer different questions, and picking wrong at the bedside is not a small
error.

v754's confidence gate already refuses to route in this case. This spec says what happens instead.

Today the fallback is the twelve-row listbox, which is the wrong shape twice over: it shows tool
names rather than what each one answers, and twelve options at a decision point is not a decision,
it is a search result.

## What it does

When the gate declines to route, the page shows a disambiguation card in place of the answer:

| | |
|---|---|
| **At most three** | Two where the ranker's top pair is clearly separated from the rest; three at the outside. Never more. If the ranker cannot produce a confident two or three, the listbox is still the honest answer — say `No single match` and show it. |
| **Named by the question they answer** | Each option is the tile name plus its plain-language one-liner from `SEARCH_CORPUS` — *Measured sodium reads low when glucose is high* — not its group label. |
| **What each one needs** | One short line naming the inputs, so the reader can pick by what they have in front of them: *Needs sodium and glucose.* Built from the `required` fields in the v753 field index. |
| **Values carry over** | Picking an option routes with whatever `queryFill` could extract for **that** tile. Nothing typed is retyped. |

This is the only state in the program where a page appears before an answer does, and that is the
point: ambiguity is the one case where guessing costs more than asking.

## How ambiguity is detected

The ranker already says so plainly. `resolvePromptRanked` scores "correct the sodium" as a
four-way tie at 3.3744, while "wells pe" separates 16.88 from 6.88. The gate is: the
runner-up scores at least **95%** of the leader, the leader did not come from a curated
synonym (a deliberate routing decision, not a coincidence of token scores), and no inline
compute fired.

**The check runs on Enter, not on every keystroke** — a second ranking pass per character
would be wasted work for a decision only Enter makes.

## What shipped differently

`render()` calls `setActive(0)`, so `activeIndex` is `0` the moment anything is typed and
every Enter looked like a deliberate pick — the ambiguity check never ran. A `userPicked`
flag now separates "the reader chose this row" (arrow keys, hover) from "the list
highlighted the first one for them".

## Where it lives

- `app.js` — `ambiguousMatches()`, `needsLine()`, `renderPickCard()`, `clearPickCard()`,
  `userPicked`, and the Enter branch.
- `styles.css` — `.pick-card`, `.pick-q`, `.pick-sub`, `.picks`, `.pick`, `.pick-name`,
  `.pick-desc`, `.pick-needs`.
- `data/fields/<bucket>.json` (v753) — the source of the `Needs …` line.

## Gotchas

- The one-liner comes from the tiered corpus: `corpus.json` for ranking, `corpus-detail.json` for
  the prose. Merge both by id before reading a description, the way `app.js` and `mcp/tools.js`
  already do, or the line will be blank for every tile whose prose lives in Tier 2.
- The `Needs …` line is generated from field labels, which are written for agents. Use the same
  restraint as [v755](spec-v755.md): short, human, and no card rather than a bad one. Two or three
  input names, then stop.
- The options are `button`s, not links. They route through the same code path as the listbox so
  focus handling, hash building, and provenance all stay in one place.
- Each option is a 44px touch target and must survive the 320px sweep with three stacked cards.

## Proof

- `test/integration/smoke.spec.js` — `spec-v756 ambiguity`: `correct the sodium` renders two
  or three options, each with a `Needs …` line; **nothing routes until the reader chooses**;
  picking the first lands on `#corrected-sodium`. **Green on chromium.**
- Live check: the three options render as *Corrected Sodium for Hyperglycemia*
  (`Needs measured sodium, glucose.`), *Corrected Calcium / Sodium Suite*, and *Sodium
  Correction Rate Planner (Adrogue-Madias)*.
- Full chain green: `lint`, `test:unit` (11444), `test:mcp` (395), `test:a11y`.
