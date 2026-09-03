# spec-v1021 — The two surfaces have to agree on whether an answer was given

## The finding

Every refusal added between spec-v1006 and spec-v1020 was checked in the browser. Checking them on
the **agent** surface found two that disagree with themselves.

`computeCalculator` marks a call `INCOMPLETE` when the library returns `null` or an explicit
`{ valid: false }`. Most of the guards use that shape, and the field-level `required` validation
catches the rest before compute is ever called. Two did neither:

| Tile | Browser | Agent |
| --- | --- | --- |
| `nihss` | *"Not scored: 13 of 13 items unscored"* | `valid: true`, with that sentence in `severity` |
| `timi-stemi` | *"TIMI-STEMI at least 0 of 14 — enter age…"* | `valid: true`, with that sentence in `band` |

A refusal inside a valid-looking envelope reads to a browser as a prompt and to an agent as a
reading. An agent that branches on `valid` — which is what the field is for — would relay the
sentence as a result.

## The fix, and the line it draws

Not "make every partial result invalid". A partial score is a real lower bound and this whole
program rests on saying so:

- With **nothing** entered there is no exam and no score: `valid: false`, and the MCP layer turns it
  into `INCOMPLETE` with the message the browser shows.
- With **something** entered the total stands and the result stays valid — NIHSS with one item
  scored still reports "Minor stroke", TIMI-STEMI with one risk factor still scores 3 of 14 — and
  the withheld reading (the mortality) stays `null` beside it.

## Why the browser was right and the agent was not

The browser reads a refusal by looking at the sentence. An agent reads a flag. The same library
result satisfied one and not the other, which is the failure mode spec-v771/v772 named when the
site's own search and `find_calculator` disagreed about the same name: **two surfaces that are
supposed to answer the same question can drift when only one of them is checked.**

## Proof

A probe over the ten tiles that refuse most often — `smart-cop`, `lace`, `nihss`, `timi-stemi`,
`snappe-ii`, `slums`, `lrinec`, `bard-score`, `psi`, `centor` — now returns `valid: false` with an
asking message on every one, where two previously returned `valid: true`. The unit and MCP suites
pass.
