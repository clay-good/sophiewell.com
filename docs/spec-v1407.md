# spec-v1407 — the page refuses what the agent refuses

[spec-v1406](spec-v1406.md) made `scripts/probe-envelope-unbounded.mjs` a gate: every field mapped
to a `lib/bounds.js` envelope, driven to ten times its ceiling through `compute_calculator`, must be
refused. That gate reads the agent surface. The page is a different renderer, and the hand-run
browser sweep in spec-v1406 found seven fixes that did not reach it.

## What this adds

- **`scripts/lib/envelope-map.mjs`** holds the field-to-envelope map, moved out of the finder so the
  finder and the page test share one copy. Nothing about the map changed; the finder's reach is the
  same 708 fields, 664 testable.
- **`test/integration/envelope-refused-on-page.spec.js`** (chromium) loads each of the 664 fields'
  tools with the worked example applied, sets the field's unit select to its canonical unit, drives
  the field to ten times its ceiling, and requires a refusal that names a range and prints no
  `null`, `undefined`, `NaN`, or `Infinity`. It drives 663; one is a range slider, which the browser
  clamps.

## What it found

| tool | page read | cause |
|---|---|---|
| `palbi`, `meld-na`, `clichy` | "Complete the remaining fields." for a value that had been entered | a third copy of the `invalid()` helper, in `views/group-v190.js`, that discarded the library's message (spec-v1406 fixed the copies in v191 and v192) |

`probe-refusal-unrendered` confirms every library refusal in that group carries a message.

Three faults in the test itself are worth recording, because each would have read as a defect in the
catalog:

- Returning to the same hash does not reload a tool, so a tool's second field was read with its
  first field's impossible value still in place. Each row now loads the page fresh.
- A reading was taken before the tool had rendered anything. The test now waits for an answer, and
  then for that answer to change after the value is set.
- `vasopressor` builds its drug picker from a fetch, and `app.js` re-applies the worked example when
  those options land — a watch that stops the moment anyone else edits a field, so that a reader's
  own value is never overwritten. Editing as soon as the field existed raced that restore and left
  the page on its first drug, whose dose is not per kilogram, so the weight was genuinely unused.
  The test now waits for the whole example to have *taken*, in `app.js`'s own sense (its `valueTook`
  rule), before driving anything. An example that never takes is reported rather than skipped.

The refusal wording had to be widened too: the catalog refuses in its own words, not only the shared
envelope sentence — *"PCE valid for ages 40-79 only"*, *"core temp C must be 0-38"*, *"above ~7,
beyond recorded extremes"*, *"Enter a serum sodium between 80 and 200 mmol/L"*.
