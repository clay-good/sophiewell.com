# spec-v1212 — a refusal the page would not show

[spec-v1209](spec-v1209.md) gave eleven functions their first range guard. The
library was verified — on both surfaces, with worked examples — and the **view was
assumed**, which is the trap [spec-v1179](spec-v1179.md) exists for.

Three of them did not render the refusal.

## One live, two not

`cdai-crohns` is the live one. Its renderer uses a local
`showInvalid(o, r)` that prints `r.message`, and the new guard returned only
`r.band`. So the page fell back to its generic sentence:

```
entered: a 7-day abdominal-pain sum of 9999
  the library said  The 7-day abdominal-pain sum must be between 0 and 21.
  the page said     Enter the required values.
```

The diary items are free number fields, so a reader could reach it — and what
they got was the dead end [spec-v1210](spec-v1210.md) had just finished
condemning: asked to enter the value they had entered.

`uceis` and `ctsi-balthazar` are the other kind. Neither had **ever** returned
`valid: false` before spec-v1209, so neither renderer had a branch for one, and a
refusal would have printed beside *"UCEIS undefined/8"*. Both are a `select` on
the page and an `enum` in the agent schema, so **no reader could reach it** —
these are defense in depth, not a defect anybody saw. Saying which is which is
the point.

Every guard in `lib/gi-v126.js` now returns **both** keys, and the two renderers
have the branch their siblings in the same file have always had.

## The finder, and its six wrong answers

`scripts/probe-refusal-unrendered.mjs` asks two static questions per tile: can
the compute function refuse and does the renderer branch at all, and — when it
branches — does every refusal carry the key the renderer prints.

It was **wrong six times before it was right**, and every wrong version looked
like a finding:

| it said | it was |
| --- | --- |
| reach 0 | over-escaped regexes in a template literal. Only the reach line caught it |
| 387 rows | the branch is usually one call away, in a local `showInvalid` / `render` helper — [spec-v1210](spec-v1210.md)'s lesson, repeated in a new file |
| 73 defects | a refusal written across several lines: reading to end-of-line saw `valid: false,` and none of the keys beneath it |
| 3 defects | `// … surfaced valid:false fallback` — prose, not code, which is [spec-v1203](spec-v1203.md)'s lesson repeated |
| 1 defect | `{ valid: false, message, … }` is a **shorthand** property and the check demanded `message:` |
| 0 defects | correct |

Negative-tested rather than trusted: putting the `cdai-crohns` defect back
produces exactly that one row, and removing it returns the count to zero.

## What it leaves

**0 wrong-key defects. 186 no-branch suspects**, against a reach of 1,434
renderers, 953 of which call a function that can refuse.

The suspects are a **suspect** bucket on purpose. Most are a classification
lookup behind a select with **no blank option** — `nyha-class` opens on Class I —
so the refusing state is unreachable from the page, and the agent surface rejects
the value against its own enum before the library is called. The question of
which selects can be left unanswered is already asked directly by
`scoring-select-probe.spec.js`; cross-check there before acting on a row here.

## Proof

Lint (19 gates), 13,560 unit tests and 449 MCP tests pass.
