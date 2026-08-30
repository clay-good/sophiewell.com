# spec-v904 — 93 tiles had plain-language phrases that nothing read

## What was wrong

`data/synonyms.json` has one live shape. Both consumers — `loadSynonyms()` in
`lib/synonyms.js` for the browser prompt bar, and `loadSynonymEntries()` in `mcp/tools.js`
for `find_calculator` — read **`doc.entries`**, an array of
`{ phrases: [...], tile: "<id>", audience: "..." }`.

Alongside it the file had accumulated **93 top-level `"<tile-id>": [ ...phrases ]` blocks**
carrying **434 phrases**. Nothing reads them. Not the browser, not MCP, and not the tests —
`synonyms.test.js` and `synonyms-catalog.test.js` both iterate `json.entries` and never look at
the rest of the document, which is why no gate ever objected.

So 93 tiles shipped with hand-written plain-language routes that were dead on arrival. The
search program exists to make those phrases work; for these tiles it silently did not.

35 of the 93 blocks were written in this session's tile wave. **58 predate it**, which means the
wrong shape has been repeated across many earlier waves.

## How it surfaced

Not from a gate. From measuring the property directly: taking every phrase written for the
session's new tiles and asking `find_calculator` whether it reaches its own tile. 48 of 175
did not. Chasing that down found the shape mismatch.

## What changed

| | |
|---|---|
| Blocks converted to `entries` rows | 93 |
| Phrases recovered | 431 |
| Phrases dropped as duplicates of existing rows | 3 |
| `entries` | 547 → 640 |
| Top-level keys | `version`, `note`, `entries` only |

Every recovered row is `audience: "clinicians"`, which is what 541 of the 547 existing rows use
and what these tiles are.

## Proof

Of the 431 recovered phrases, **424 now return their own tile at rank 1** from
`find_calculator`. Before the change the table they lived in was not read at all.

## The seven that did not, and why

Five resolve correctly in the **browser** — `matchSynonym` returns the right tile for each — but
were absent from `find_calculator`'s candidates. The cause is that `find_calculator` ranks
`rankableWords(q)`, which strips digits: `"stage 1 hypertension"` becomes
`"stage hypertension"`, so a synonym row containing the digit no longer matches itself.

That affects only phrases where the **digit carried the distinguishing signal**: 117 synonym
phrases contain a digit and 112 of them still route, because their remaining words rank the tile
anyway.

Three of the five were phrases written in this session and are reworded to carry lexical signal
instead of a bare numeral — one of them, `"how much albumin for 8 litres"`, was also a British
spelling that no gate scans, since `data/` is outside `check-us-english`'s scan set.

The remaining two belong to `bp-categories` (`"stage 1 hypertension"`, `"what does 135 over 95
mean"`) and predate this change. They are **left alone and recorded here**: the fix is either to
reword them the same way or to give `find_calculator` the browser's synonym precedence on the raw
query, and neither belongs in a change whose subject is the file's shape.

## Posture

No catalog change, no code change. One data file, reshaped so that what was already written is
read. Catalog unchanged at 1693.
