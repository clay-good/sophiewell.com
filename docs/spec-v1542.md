# spec-v1542 — Metric field units and safe decimal input

Program: [scope-field-health.md](scope-field-health.md). Platform spec; builds no tile.

## 1. Why

The catalog pre-selects US units (lb, in, °F) through `default: true` tags in `lib/field-units.js`
(spec-v283/v284). The math is already metric: every canonical unit is kg, cm, °C, or an SI lab
unit, and the US option is a display default. A health worker in Uganda weighs a child in kg,
reads MUAC in mm or cm off a tape, and takes an axillary temperature in °C. Opening a WHO tile on
"lb" invites a 2.2-fold dosing error.

## 2. A unit profile

- **Two profiles: `us` (today's behavior) and `metric`.** A profile decides which option
  `unitField` pre-selects. It is resolved in one place in `lib/field-units.js`.
- **How the profile is chosen, in order:**
  1. A tile tagged `global-health` (spec-v1540 §9) always opens in `metric`, whatever else is
     set. These tiles' sources are metric, and a US nurse using one is following a WHO chart.
  2. Otherwise, a `units=metric` or `units=us` value in the URL fragment, so a shared link
     reopens as sent.
  3. Otherwise, a remembered choice (below).
  4. Otherwise, `us`, which is today's behavior. Nothing changes for current users.
- **Remembering the choice** needs a new localStorage key, `sw-units`, added deliberately to
  `scripts/storage-allowlist.json` (today it holds only `sw-theme`). The key is set only when the
  user changes a unit select, not on page load.
- **Lab units in `metric`:** glucose mmol/L, creatinine µmol/L, bilirubin µmol/L, hemoglobin g/L
  or g/dL. WHO's 2024 anemia cutoffs are published in g/L; many African labs report g/dL. The
  hemoglobin field offers both, and the source's unit is pre-selected.
- **Field-specific units the catalog lacks:** MUAC in mm (with cm offered, since tapes print cm),
  respiratory rate as breaths counted in one full minute, and age in months for under-5s (with
  days for young infants and weeks for gestation).
- **Examples stay canonical.** `applyExample` already resets example-covered unit selects to the
  canonical unit before filling. No change.
- **Tests.** `unit-toggle.spec.js` gains a metric run; a `global-health` tile opens in kg even
  with `sw-units` set to `us`; a fragment overrides the remembered choice.

## 3. Decimal commas

French, Spanish and Portuguese write 37,5. In JavaScript `Number('37,5')` is `NaN`, and
`parseFloat('37,5')` is 37, which is a silent truncation, the worst possible failure for a dose.
The target audience's phones will often be set to these locales before any translation ships.

- **One parser, `parseDecimal(raw)`, in `lib/num.js`**, used by every numeric read in the view
  layer and the MCP adapter layer:
  - Accepts `37.5` and `37,5` (a single comma with no dot is a decimal comma).
  - **Refuses ambiguous grouping.** `1.500`, `1,500`, `3.200` and `3,200` could each mean two
    numbers depending on locale; they are refused with *"Enter this without a thousands
    separator."* A birth weight of 3.200 g is the dangerous case: 3,200 g in Portugal, 3.2 g in
    Texas.
  - Refuses anything else non-numeric, with the field's label. Never truncates.
  - Strips surrounding whitespace; a whitespace-only field is blank, not zero (the spec-v1157
    `optNum` lesson).
- **Number inputs.** How `<input type="number">` treats a comma varies by browser, UI locale, and
  keyboard. Some Android number keyboards have no comma key at all. This spec does not assume.
  It adds a Playwright matrix over Chromium, Firefox and WebKit with the page locale set to
  `fr-FR`, `es-PE`, `pt-BR` and `en-US`, typing `37,5` and `37.5`, and asserting that each tile
  either computes 37.5 or refuses with a message. It must never compute 37 or 375. Where a
  browser drops the comma silently, the numeric fields in `global-health` tiles switch to
  `type="text" inputmode="decimal"` and use `parseDecimal`.
- **Agents.** MCP adapters accept numbers as JSON numbers. A string value is run through the same
  `parseDecimal`, so an agent passing `"37,5"` gets 37.5 or a refusal, never 37.
- **Output formatting** stays in the page's language (en-US until spec-v1543). Copied and
  agent-returned values always use a dot, so a pasted number is never ambiguous.

## 4. Finder, run once before building

Before this ships, run a sweep over every numeric input in the catalog: type `37,5` and record
what each tile computes. Any tile that computes 37 is a live defect today, independent of this
program, because US users paste values from European sources too. Fix those in the same change,
and add the sweep to the e2e page sweeps so it keeps running.

## Acceptance

`parseDecimal` with unit tests for every accepted and refused form. The locale matrix passes. The
finder's result is recorded in this spec's Built section with the count found and fixed. A
`global-health` tile opens in kg on a clean profile. `sw-units` is the only new storage key.
