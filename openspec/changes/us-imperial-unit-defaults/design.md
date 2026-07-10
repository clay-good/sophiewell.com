# Design — US-customary unit defaults

## Context

`unitField(label, id, units, opts)` (`lib/field-units.js:87`) builds a numeric `<input>` plus a
unit `<select>`. Each option carries a hidden `_toCanonical` converter; `unitNum(id)` reads the
value already converted to the canonical unit the compute expects. Every `*_UNITS` array lists
the **canonical unit first** (identity converter), e.g. `WEIGHT_UNITS = [kg, lb]`,
`TEMP_UNITS = [°C, °F]`, `GLUCOSE_UNITS = [mg/dL, mmol/L]`.

Two facts make a naive reorder unsafe:

1. `applyExample` (`app.js:2965`) fills only the DOM ids listed in `META.example.fields`. Unit
   selects are **not** in `example.fields`, so they stay at option index 0. Examples encode
   inputs in the canonical unit (a weight of `70` means 70 kg). If lb becomes option 0, the
   example reads `70` through the lb→kg converter and computes the wrong answer — breaking the
   full-catalog `example-correctness.spec.js` sweep.
2. MCP adapters feed `example.fields` **straight to the canonical-unit compute** (the browser
   toggle is bypassed; `mcp-compute.test.js` states this). So `example.fields` values are pinned
   to canonical units by 1,044 round-trip assertions.

## Goal

Empty form → US unit pre-selected. Loaded example / deep link → reproduces byte-identically.
Compute + MCP → untouched.

## Decisions

**D1 — Separate "default-selected option" from "canonical converter."** Add an explicit
default-unit marker rather than reordering the arrays. Two equivalent implementations; pick one
at build:
- (a) `unitField(..., { defaultUnit: 'lb' })` sets `sel.value = defaultUnit` after building
  options (canonical stays option 0, so `applyExample`'s index-0 assumption is preserved for
  free); or
- (b) tag the US option `{ unit:'lb', default:true }` in the array and the canonical option
  `{ unit:'kg', canonical:true }`; `unitField` selects the `default` option at render.

Recommended: **(a)** — smallest surface, canonical stays first, only the call sites that want a
non-canonical default pass `defaultUnit`.

**D2 — `applyExample` resets unit selects to canonical before filling.** For each unit select on
the tile, set it to its canonical option (the identity converter) at the start of `applyExample`,
then apply `example.fields` as today. Because canonical is option 0, this is
`sel.selectedIndex = 0` (or select the `canonical:true` option under D1(b)) for every
`select[id$="-unit"]` in the tool view. Result: the empty form shows US, but the moment the user
clicks "Test with example," the documented canonical inputs reproduce exactly. Deep links that
carry an explicit `*-unit` value still win, because `applyHashState` runs and sets the select
from the hash.

**D3 — Canonical units stay as-is; conversion stays at the boundary.** No `*_UNITS` canonical
entry, no `lib/unit-convert.js` factor, no compute threshold, no `example.fields` value, and no
MCP adapter changes. The flip is display-only.

**D4 — Per-domain US policy** (the "best practices" the request asks for — US clinical practice
is not uniformly imperial):

| Domain | US default | Canonical (compute) | Note |
|---|---|---|---|
| Weight | **lb** | kg | kg-intrinsic dosing still computes in kg |
| Height | **inches** | cm | feet+inches composite where a tile already offers it |
| Temperature | **°F** | °C | validated °C bands unchanged; °F is display only |
| Glucose, BUN, calcium, magnesium, bilirubin, creatinine | **mg/dL** | mg/dL | already US-default — ratified |
| Albumin | **g/dL** | g/dL | already US-default — ratified |
| Lactate | mmol/L | mmol/L | US ABG analyzers report mmol/L — confirm at build, do **not** force mg/dL blindly |
| Ionized calcium (CRRT) | verify at build | mmol/L | formula wants mmol/L; US bedside often mg/dL — decide per clinical review |
| BP, SpO2, rates, points, mL, mEq/L, mOsm | n/a | n/a | no US/metric variant — out of scope |

**D5 — Unit-pinned analytes stay pinned.** Where the literature reports an analyte
inconsistently (HALP `g/L`, spec-v231), the tile keeps a fixed, labeled unit and no toggle. The
US-default rule applies only to fields that genuinely have a US/metric pair.

## Risks

- **`unit-toggle.spec.js` encodes the old defaults** (asserts `#w-unit` defaults to kg). It must
  be updated in lockstep with the flip — same commit.
- **Missed unit selects in `applyExample` reset.** The reset must cover every `*-unit` select the
  active tile renders, including the 8 bespoke ones already in `example.fields` — those are set
  explicitly by the example and must not be clobbered by the reset (reset first, then apply
  `example.fields`, so an explicit example value wins).
- **kg-intrinsic dosing confusion.** A user entering a dose sees lb but the formula is per-kg;
  the field label / derivation already states kg. No math change, but the build should keep the
  `(example: …)` hint and label wording clear.
- **New deep links change shape.** Freshly generated hashes will carry the US unit; old hashes
  keep working because `trackHashState` already serializes every select value. No migration
  needed.
