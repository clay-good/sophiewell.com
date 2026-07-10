# Change: US-customary unit defaults for every calculator

## Why

A US clinician charts weight in **lb**, height in **inches**, and temperature in **°F**. Today
the catalog offers those units on ~68 fields (spec-v61/v62/v184) but pre-selects the *metric*
option (kg, cm, °C) because the render helper makes the first select option the **canonical**
unit the compute expects. So a US user lands on every anthropometric and temperature input in
metric and must re-pick their own units, tile after tile. spec-v184 shipped the toggles and
called this out; it deliberately left the default alone to protect the byte-identical
`META.example` / deep-link contract. This change closes that gap: **US customary is the happy
path; metric is one click away.**

Most lab chemistries already default to the US-conventional unit (mg/dL, g/dL), so this is
mostly an anthropometric + temperature flip, plus an audit of the few SI-first stragglers.

## What Changes

- **Flip the default-selected unit to US customary** for every unit-toggle field where a
  US/metric distinction exists: weight → **lb**, height → **inches**, temperature → **°F**.
  Labs that report in a US-conventional unit already default correctly (mg/dL, g/dL) and are
  ratified, not changed.
- **Keep the canonical compute unit unchanged.** Conversion still happens at the input boundary
  via `unitNum()`; no formula, threshold, or validated cutoff is touched. Display unit ≠ formula
  unit for kg-intrinsic dosing (mg/kg, mL/kg) — those still compute in kg.
- **Decouple "default-selected option" from "canonical/identity converter"** in
  `lib/field-units.js` so the flip does not disturb which unit the compute reads.
- **Reset unit selects to canonical inside `applyExample`** so every `META.example` and
  deep-link hash still reproduces byte-identically, and every MCP round-trip stays green —
  without re-authoring 1,127 examples or 1,044 adapter entries.
- **Extend toggles** to any remaining metric-only unit-bearing tile so *every* tool honors the
  US default.
- **Exempt** analytes the literature reports inconsistently (the spec-v231 HALP `g/L` pinning
  precedent) and inputs with no US/metric variant (mmHg, %, bpm, mL, mEq/L, points).
- **Add a guard** asserting the US default across the shared unit helpers, and update
  `test/integration/unit-toggle.spec.js`, which currently encodes the metric defaults.

## Impact

- Affected specs (folded in at build): **calculator-units** (new capability delta).
- Affected code: `lib/field-units.js`, `app.js` (`applyExample`), `views/group-*.js`
  (default-unit opt on `unitField` call sites), `test/integration/unit-toggle.spec.js`,
  one new guard test.
- **Untouched:** every compute function, `lib/meta.js` `example.fields`/`expected` values,
  `derivation.units`, and all 184 MCP adapters — the change is presentation-only.
- Catalog count unchanged (`UTILITIES.length` stays live; no tile added or removed).
- Docs-only proposal (propose-first, per `docs/spec-v279.md` precedent); a later session builds
  it and records the delta in a `docs/spec-v*.md` successor to spec-v184.
