# spec-v746.md — 3,225 of 3,329 list rows ended mid-clause

> Status: **SHIPPED (2026-08-18).** Copy only. No tile added, no number changed.
> Catalog stays **1564**.

## Why

The audience hubs (`/for/clinicians/`) and topic pages (`/topics/cardiology/`) are lists: a
heading, then one line per tool. That line was the first 110 characters of the tile's prose with
`...` on the end. Across the six hubs and eight topic pages, **3,225 of 3,329 rows** ended
mid-clause:

> Compute corrected QT interval using four published formulas - Bazett, Fridericia, Framingham,
> and Hodges -...

And a tile whose first sentence was *already* short enough got the cut mark anyway, because the
length test compared the printed line against the **whole summary** rather than against the
sentence it had just taken:

> Score the Wells criteria for pulmonary embolism...

That is a finished sentence wearing a cut mark. The reader is told there is more to know, and
there is not.

## What changed

`scripts/lib/tile-line.mjs`, shared by both builders: take the first sentence; if it fits the line
budget, that is the line, full stop and all. Only a sentence too long to print gets clamped, and
only then does the row end in an ellipsis — which now means what it says.

| | |
|---|---|
| Complete sentences | **104 → 847** rows |
| Clamped, honestly marked | 2,482 rows |
| Ellipsis on a complete sentence | 743 → **0** |

## Proof

- `test/unit/tile-line.test.js` — the Wells case (a fitting sentence prints whole, no mark), a lead
  with no closing period, a clamped line that must end at a word boundary with no dangling comma
  before the ellipsis, and empty prose that must give an empty line rather than a bare ellipsis.
- `npm run lint`, `npm run test:unit` (11,397), `npm run test:a11y`, and a full `npm run build`
  clean.

## The lesson worth keeping

The old code took the first sentence and then measured something else. Whenever a function decides
*what to print* and then separately decides *whether to say it was cut*, the two decisions have to
be made from the same value — otherwise the mark is describing a string that was never printed.
