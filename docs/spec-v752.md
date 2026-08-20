# spec-v752.md — Answer first, inputs second, proof collapsed

> Status: **SHIPPED (2026-08-20).** Part of [scope-one-box](scope-one-box.md).
> Presentation only. No compute changes, no number changes. Catalog stays **1564**.

## Why

Every tile renders in source order: description, then inputs, then the result, then references.
On a 16-field tile the answer is 16 fields down the page. A nurse who opens the tile with values
already prefilled — which is the whole point of the rest of this program — arrives above the
fold on a form whose answer is off-screen.

The order the reader needs is the reverse of the order the page is built in. The number is what
they came for. The inputs are what let them check it in one glance. The citation is what makes it
trustworthy, and it is one click, not one screen.

The good news is that this is one hook, not 628 view files. `#q-results` is the result region in
**626 of 628** views, and `resultRow()` in `lib/result-copy.js` formats the contents in **614**.

## What it does

| | |
|---|---|
| **Hoist** | After `renderer(body)` runs, move `#q-results` to be the first child of `#tool-body`. One call in `app.js`, beside the existing `collapseLongNotes(body)`. |
| **Empty state** | `#q-results:empty` is `display: none`, so a tile that has not computed yet shows no empty box — the page opens on its inputs exactly as today until there is something to say. |
| **Primary line** | In `resultRow()`, the first `{ label, value, units }` item renders as the headline number: large, `tabular-nums`, unit at label size in `--text-muted`. |
| **Band** | A `{ text }` item renders as a pill (`--accent-pop-tint` background, `--accent-pop-line` border), or `--warn` tinted when `cls` is `warn`. |
| **Remaining items** | Unchanged — the same `Label: Value Units` lines, below the headline. |
| **Copy payload** | Byte-identical. `formatCopyAll` is untouched, so a pasted result is the same string it is today. |
| **Static pages** | `scripts/build-tool-pages.mjs` emits the same order: answer slot, then inputs, then the collapsed proof. |

The two views without `#q-results` (`group-a.js`, `pa-lint.js`) and the fourteen without
`resultRow` are left exactly as they are. The hoist fails quiet when there is nothing to hoist.

## The prose in the answer card had to be folded

The plan assumed the answer card held the answer. It does not: **611 of 628 views write
explanation prose into `#q-results`** alongside the result, and `note(o, r.note)` is 1102
of those calls. On `abc-scale` that is a 787-character paragraph. Below the fields it was
merely long; hoisted above them it pushed the first input off the screen — the opposite of
what moving the answer up was for.

The fix reuses spec-v741's fold rather than inventing one: `collapseLongNotes` already
operates on direct `p.muted` children, which is exactly what `note()` writes, so it needed
a second place to run, not a new rule. First sentence stays, the rest goes behind
**More detail**, re-applied after every recompute.

On the `aria-live` concern that ruled this out in spec-v741: the region announces its full
text on every update either way, so folding changes what is *painted*, not what is
*spoken*. Nothing leaves the DOM and the disclosure is reachable.

## The example lede goes away

`p.tool-example-lede` currently states the worked example's expected value above the fields —
*"Example: CrCl 39 mL/min. Replace the values below with your own."* It exists because the answer
used to be off-screen. Once the live answer is the first thing on the page, and the example values
are prefilled, the lede prints the same number twice, three lines apart.

Drop the `.tel-label` and `.tel-expected` spans. Keep the hint, moved directly under the answer
and reworded to say what it now means: *These are example values. Replace them with your own.*
It renders only while the fields still hold the untouched example — the first edit removes it.

**The static pages needed no change.** They already lead with the worked example and its
result, above the input list — the answer-first order the SPA was missing. And their hint
sentences (*"The tool opens with these values already filled in"*) are written from a
different vantage point than the app's (*"These are example values"*): one describes what
will happen when you click through, the other describes what you are looking at. Holding
them to one string, as planned, would have made one of them wrong, so `check-page-copy`
gained no new hold.

## Where it lives

- `app.js` — `hoistResults()`, `foldResultNotes()`, `showExampleHint()`, `EXAMPLE_HINT_TEXT`,
  and the `renderToolView()` calls that drive them.
- `lib/result-copy.js` — `resultRow()`: headline / band / rest classification.
- `styles.css` — `#q-results ul`, `.result-primary`, `.rp-label`, `.rp-units`, `.result-band`,
  `.example-hint`.

## The example lede was propping up a test

`test/integration/example-correctness.spec.js` reads `main.innerText()` and looks for every
number in the tile's documented `expected`. Removing the lede broke **19 tiles** — and the
reason is worth writing down.

An example's documented output routinely names its own *inputs*: `peds-resus` expects
*"15 kg x 20 mL/kg = 300 mL bolus"*, and the tile echoes the 300 and the 20 but never the 15,
which only ever exists as the value of a weight `<input>`. `innerText` does not see input
values. Those 19 tiles were passing because the lede printed `Example: <expected>` into the
page, so the sweep was matching the expected string **against a verbatim copy of itself**.

For the ~1100 other tiles the numbers genuinely appear in the computed output, so they never
depended on it — but nothing in the test distinguished the two groups, and any tile could
have silently joined the first one.

The fix is to read the field values, not to allowlist the 19. That leaves the sweep
**strictly tighter than it has ever been**: an expected number now has to be either computed
into the page or actually sitting in the field the example claims to have filled.

Reading them for every tile cost a second round trip on each of ~1100 serial navigations and
pushed a 28-minute sweep past its 30-minute cap, so the value read happens **only on the miss
path** — the ~1080 tiles that state their numbers in the output pay nothing.

That recovers 15 of the 19. The remaining four are prose, not computed cells — `45 CFR
164.508` is the regulation `hipaa-auth`'s letter cites, "all 5 Boles 2007 criteria" counts
the source's list, "hour-1 elements" and "at 6 h" name SSC bundle windows, "T1 discordance"
is a trimester label. The sweep was never validating those; it was reading them back out of
the lede's copy of the expected string. They join `rcri` in `SCENARIO_ONLY`, each with its
reason written down.

## What shipped differently

- **The headline is rendered in place, not moved to the front.** A tile whose result leads
  with its band keeps the band first. Reordering the `<li>`s would have changed the
  `textContent` order that the spec-v9 numeric-correctness sweep reads across 1564 tiles,
  for a cosmetic gain.
- **`#q-results` was already styled and already had `:empty { display: none }`.** The delta
  was smaller than planned: a headline treatment and a band pill, not a new card.

## Gotchas

- **Folding inside `#q-results` is now deliberate — see the section above.** The rule it
  replaces (spec-v741's "never fold in the live region") was written when nothing needed to.
  What still holds: `collapseLongNotes(body)` must keep scoping to *direct* `p.muted`
  children, or after the hoist it would reach into the answer card twice.
- `foldResultNotes` is idempotent by design (a lead already under the threshold is skipped),
  because it re-runs on every keystroke. Keep it that way.
- Hoist once, right after render, before `applyExample` fires in its microtask. Moving a populated
  live region later re-announces its contents.
- `theme.js` opens every `<details>` on `beforeprint`. A closed `<details>` does not print. The
  proof block must stay a `<details>`, not become a hidden div.
- The headline number must not introduce a long unbreakable token; `mobile-no-hscroll` sweeps the
  whole catalog at 320px.
- Section headings inside a tile must be `h2`, never `h3`. A chromium-only e2e sweep catches it and
  no local gate does.

## Proof

- `test/integration/smoke.spec.js` — `spec-v752 tile: the answer is the first thing in the
  tool body`: `#q-results` is the first element child of `#tool-body`, its bounding box
  sits above the first input, `.tool-example-lede` is gone, and `.example-hint` names the
  values for what they are. **Green on chromium.**
- `test/integration/print-details.spec.js` — 3 tests green, including the new fold: every
  closed disclosure still opens for print and closes again.
- `test/integration/mobile-no-hscroll.spec.js` — 19 tests green, including the whole-catalog
  320px sweep with the headline in place.
- Full chain green: `lint` (incl. `check-page-copy`), `test:unit` (11444), `test:mcp` (395),
  `test:a11y`.
