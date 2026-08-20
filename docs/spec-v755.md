# spec-v755.md — Ask for the missing value in words

> Status: **SHIPPED (2026-08-20).** Part of [scope-one-box](scope-one-box.md).
> Depends on [v753](spec-v753.md), [v754](spec-v754.md). Catalog stays **1564**.

## Why

`heparin drip 25000 units in 250 mL at 12 mL/hr` carries three of the four values a weight-based
rate needs. After v754 the reader lands on a tile with three fields filled, one empty, and an
answer region that says nothing — and has to work out which of the fields is the one holding
everything up.

That is the moment the whole design either feels like an assistant or feels like a form. One
question, in words, at the top of the page, is the difference.

## What it does

When `queryFill` returns a non-empty `missing` **and** filled at least one field, an ask card
renders above the answer region:

| | |
|---|---|
| **The question** | The first missing required field, phrased as a question naming its unit: *What is the weight in lb?* |
| **The receipt** | One line of what is already in, so the reader can see the work is not lost: *Everything else is in: age 72, serum creatinine 1.4, sex Female.* |
| **The input** | A single field matching the target's type. Submitting writes the value into the real field, dispatches `input` and `change` so the tile recomputes, and dismisses the card. |
| **Dismissal** | The card also disappears if the reader fills the field directly below instead. It is a shortcut, never a gate — the whole tile stays interactive underneath it the entire time. |
| **One at a time** | Only the first missing field is asked. When it is answered and others remain, the card re-renders with the next. A queue of seven questions is a form with extra steps. |

If nothing was filled, no card. The reader typed a tool name, not a sentence, and the tile's own
form is the right answer.

## The question text does not come from the registry

The MCP field `label` is written for an agent. Rendering those strings at a nurse has misfired
before — a raw registry value once printed `onevaso` on screen, and schema comments have been
clamped into human copy.

The question is built from **the rendered `<label for>` text in the tile body**, which is the
string a human already reads next to that input. `queryFill` returns `dom` keys; `document
.querySelector('label[for="<dom>"]')` gives the human text. Where no label is found, render no
card — fail quiet, exactly as the views-parsing rules require.

## Two things the plan got wrong

**The question has to name its unit.** "What is the weight?" is unanswerable when the box
beside it pre-selects lb: a reader who means 68 kg types 68 and gets 17.69 mL/min. The card
asks in the unit the field is *currently showing* — "What is the weight in lb?" — rather than
changing the select underneath them.

**The question is a `<label>`, not an `aria-label`.** `scripts/a11y-check.mjs` holds every
dynamically created input to a real `label[for]` in the same file, and it caught the
`aria-label` version. It is better anyway: the visible text and the accessible name are one
string that cannot drift.

## The answer hides while the question is open

A tile whose lib reads a blank required field as zero renders a confident **"0 mL/min"** —
which looks exactly like an answer. `.ask-card ~ #q-results { display: none }` hides the
answer card while the question is open; dismissing the card brings it straight back.

## Where it lives

- `app.js` — `askCard()`, `askUnit()`, `renderedLabel()`, `renderedValue()`, and the
  `renderToolView()` call that mounts it.
- `styles.css` — `.ask-card`, `.ask-q`, `.ask-receipt`, `.ask-form`, `.ask-input`, `.ask-go`,
  and the answer-hiding rule.

## Gotchas

- **The card is not a live region and must not be inside `#q-results`.** It is a question, not a
  result; announcing it as one is wrong, and folding anything into a live region is worse.
- **Focus is NOT moved to the ask input.** `renderToolView` already moves focus to the `h1`
  for screen reader users, and a second focus call in the same microtask would race it. The
  card is the first thing in the tool body, so it is the first thing reached by Tab anyway.
- The receipt line is generated from filled values and units. It is the most likely place to
  produce a long slash-joined token; use commas and spaces or the 320px sweep fails.
- Submitting the card writes to the real input and must dispatch the same `input` event the
  renderer's `wire()` listens for, or the answer will not recompute.
- A `select` or checkbox target needs a matching control in the card, not a text box. Where the
  target's type has no obvious one-line control, render no card and let the field speak for itself.

## Proof

- `test/integration/smoke.spec.js` — `spec-v755 ask card`: a crcl query missing the weight
  renders **"What is the weight in lb?"**, a receipt reading **"sex Female"** (not the stored
  code `F`), a hidden answer card, and — on submitting 150 — a dismissed card, a filled
  field, and a live answer. **Green on chromium.**
- `a11y-check: clean` — it failed first on the `aria-label` version, which is how the label
  fix was found.
- Full chain green: `lint`, `test:unit` (11444), `test:mcp` (395).
