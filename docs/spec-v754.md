# spec-v754.md — Enter goes to the answer, not a picklist

> Status: **SHIPPED (2026-08-20).** Part of [scope-one-box](scope-one-box.md).
> Depends on [v753](spec-v753.md). Routing + provenance. Catalog stays **1564**.

## Why

Typing a full sentence into the box today produces a dropdown of twelve tool names. The reader
asked a question and got a filing cabinet. Enter already routes to the top match, but it routes to
a **bare tile hash** unless the query happened to hit one of the 22 inline-compute templates — so
in almost every case the tile opens empty and the values the reader just typed are thrown away.

`queryFill` from v753 makes those values usable for the whole catalog. This spec spends them.

## What it does

| | |
|---|---|
| **Enter** | Routes to the best tile with `queryFill`'s values in the hash, using the existing `buildHash({ route, state })`. Deep links keep working; a prefilled answer is now a shareable URL. |
| **Confidence gate** | Route directly only when `resolvePrompt` clears its threshold and no runner-up is within a close margin. Below that, hand off to the disambiguation card ([v756](spec-v756.md)) instead of guessing. |
| **Provenance** | Every field `queryFill` set renders a `from your question` caption under it, and its border takes `--accent-pop-line`. This is the verification affordance — the reason a card beats a chat bubble — so it is not optional chrome. |
| **Editing clears it** | The first edit to a field drops its provenance caption. Once the reader has touched it, it is their value, not ours. |
| **Listbox** | Stays, unchanged, for typeahead. Someone who types `wells` still gets the list. It is no longer the only way through. |

`queryCompute`'s 22 templates keep priority: where one fires, its inputs win and its value still
shows on the leading row.

## Two bugs this surfaced, both of which would have shipped wrong numbers

**1. The example topped up a partly answered question.** `applyExample` fills whatever the
hash did not set. A query that filled three of seven Wells criteria therefore arrived with
four more from the worked example — scoring **6 instead of 3**, with no visible sign that
four of those ticks were a demo. The example is now skipped entirely when the reader's own
words filled anything: a partly answered question stays partly answered, and
[v755](spec-v755.md) asks for the rest.

**2. Canonical values were read as US-customary.** `queryFill` returns the field's canonical
unit (kg), but the unit select beside that field pre-selects lb (spec-v283: US customary is
the bedside happy path, tagged per field — Cockcroft-Gault's weight defaults to lb, BMI's to
kg). "68 kg" was therefore read as 68 lb and Cockcroft-Gault answered **17.69 mL/min instead
of 39**. `resetUnitsToCanonical()` now runs before `applyHashState`, mirroring what
`applyExample` already does for the same reason — and only for fields the query itself
filled, because a deep link carries its own `-unit` state and must keep it.

This one was **already live**. `queryCompute`'s 22 templates have always returned canonical
values into the same hash-state path, so `crcl 72F 68 kg cr 1.4` showed **38.99 mL/min in
the dropdown and 17.69 on the tile it opened** — the two numbers disagreed and neither was
labelled. The fix covers both paths.

## One pre-existing bug, fixed in passing

`applyHashState` dispatched **one** event per restored field, chosen by element type:
`change` for a `<select>`, `input` for everything else. Renderers are split on which one they
listen to, so a tile wired to `input` never recomputed after a select was restored. A shared
Cockcroft-Gault link with `sex=F` rendered the **male** number, because the last compute ran
before the select was set. It now dispatches both, exactly as `applyExample` has all along.
This affected every deep link with a select on an input-wired tile, independent of this
program.

## Where it lives

- `app.js` — `navigateTo()` (now async) gains the `queryFill` path; `autofilledKeys` carries
  provenance from route to render; `markAutofilled()`, `resetUnitsToCanonical()`,
  `PROVENANCE_TEXT`; the `applyHashState` event fix.
- `styles.css` — `.field-provenance`.

## Gotchas

- **Hash state is the transport, not the provenance.** A deep link someone was sent and a query
  someone just typed produce the same hash. Keep the provenance set in memory, scoped to one
  navigation, and clear it on the next route — otherwise a shared link claims the recipient typed it.
- `applyHashState` runs in a microtask after the renderer mounts, and `applyExample` fills whatever
  the hash did not. A `queryFill` value must win over the example, exactly as a hash value does
  today — which it will, since it *is* a hash value. Do not add a second fill path.
- Provenance captions are per-field text in the tile body. `collapseLongNotes` folds direct
  `p.muted` children of `#tool-body`; make the caption a `span`, or a `p` with a different class,
  so it cannot be swallowed.
- Do not put provenance inside `#q-results`. It is `aria-live`, and the caption would be announced
  as part of the answer.
- A caption under every field on a 16-field tile is a lot of text at 320px. Check the hscroll sweep
  and keep the string short — `from your question`, not a longer explanation.

## Proof

- `test/integration/smoke.spec.js` — `spec-v753/v754 crcl`: the query lands on
  `#cockcroft-gault` with all four fields filled, `#w-unit` reading `kg`, **38.99** in the
  answer, four provenance captions, and one caption dropping when that field is edited.
  `spec-v754 wells`: `#peLikely` is **not** checked and the total is **3**, not 6.
  **Both green on chromium.**
- `test/integration/mobile-no-hscroll.spec.js`, `mobile-touch-targets.spec.js` — green.
- Full chain green: `lint`, `test:unit` (11444), `test:mcp` (395), `test:a11y`.
