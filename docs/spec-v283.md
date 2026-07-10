# spec-v283.md — US-customary unit defaults: lb / in / °F as the pre-selected happy path

> Status: **BUILT (2026-07-10).** Successor to [spec-v184](spec-v184.md) (the unit-toggle
> rollout), folding in the `us-imperial-unit-defaults` OpenSpec change (`calculator-units`
> capability). Presentation only: **no compute function, no `lib/meta.js` example value, no
> conversion factor, and no MCP adapter changes** — `UTILITIES.length` stays live and untouched.

## Why

A US clinician charts weight in **lb**, height in **inches**, and temperature in **°F**.
spec-v184 shipped per-field unit toggles on ~68 fields but deliberately pre-selected the
*metric* option, because the render helper made the first `<select>` option both the canonical
compute unit **and** the default — and the byte-identical `META.example` / deep-link contract
hangs off that first option. This change decouples the two: canonical stays option 0 (the
identity converter every documented example and MCP round-trip relies on), while the
US-customary option is what a fresh field presents. US customary is the happy path; metric is
one click away.

## What shipped

**Default tag in the shared arrays (`lib/field-units.js`).** `WEIGHT_UNITS` (lb), `HEIGHT_UNITS`
(in), and `TEMP_UNITS` (°F) tag their US-customary entry `default: true`; `unitField` selects the
tagged option at render. Design D1 was offered as (a) a per-call-site `defaultUnit` opt or (b) an
array tag; the build chose **(b)** — one edit per array instead of ~50 call-site edits, no site
can be missed (tasks 2.1–2.3 collapse into it), and any future `WEIGHT_UNITS` call site inherits
the US default for free. The two inline height arrays in `views/group-e.js` (bmi `m/cm/in`, bsa
`cm/in`) carry the same tag. Lab arrays are untouched: glucose/BUN/calcium/magnesium/bilirubin
(mg/dL) and albumin (g/dL) are already US-conventional by position (ratified, task 2.4), and
lactate + CRRT ionized/total calcium stay mmol/L per design D4 — US blood-gas analyzers report
them in mmol/L, so no flip is clinically correct (task 2.5). Unit-pinned analytes (HALP g/L,
spec-v231) keep no toggle (D5).

**Canonical reset in `applyExample` (`app.js`).** Examples document their inputs in the
canonical unit, so before filling, `applyExample` now resets each example-covered field's paired
`<select id="<field>-unit">` to option 0 and dispatches input/change. Refinements over the
design sketch, discovered at build:

- **Scoped to example-covered fields, not every unit select in the view** (design D2 said "every
  `select[id$=\"-unit\"]`"). Examples prefill **on tile load** (spec-v9 §3.3), not only on the
  "Reset to example" click the design assumed — a whole-view reset would therefore wipe the US
  default off every unit select of all 48 unitField tiles on load, making the flip invisible.
  Scoping the reset to the fields the example actually fills keeps reproduction byte-identical
  (an unfilled field contributes nothing) while fields the example leaves empty genuinely present
  lb/in/°F. The three partial-coverage tiles (`peds-bmi-percentile` weight/height,
  `ireton-jones` height, `crrt-dose` calcium trio) all read those fields with the null-safe
  `unitNumOpt`, so an empty field under a US default computes identically.
- **Skip-set aware.** Ids the deep-link hash or remembered inputs already set are skipped, so an
  explicit `w-unit=lb` in a shared link (and every `trackHashState`-generated hash — it always
  serializes selects) beats the reset, and a remembered lb preference survives. An explicit
  `*-unit` key in `example.fields` (the 8 bespoke ones) also wins because the fill loop runs
  after the reset.
- **unitField selects only.** The reset touches a select only when its option 0 carries the
  identity `_toCanonical`, so bespoke `-unit`-suffixed dose pickers (`nh-dose-unit`,
  `dw-dose-unit`, …) are never disturbed.
- **Inline-compute prefill links keep working.** `lib/query-compute.js` emits canonical-unit
  inputs *without* `*-unit` keys; because those ids are hash keys (skipped for filling) but their
  unit selects are not, the reset still lands and `#bmi&q=w=70;h=1.75` reads 70 as kg.

**Guards and tests.** `test/unit/field-units.test.js` (stub-document, per the
`derivation.test.js` precedent) pins both halves of the contract — option 0 is the identity
converter and exactly one tagged US default exists per flipped array (tasks 1.3/5.2) — plus the
lb→kg / °F→°C reads and the reset-to-canonical read. `test/integration/unit-toggle.spec.js`
gains five spec-v283 tests: the visible US default (peds-bmi-percentile), the canonical
example-prefill reproduction (BMI 22.9 with kg/m selected), explicit-unit deep-link precedence,
the unit-less inline-compute prefill, and "Reset to example" restoring canonical after a US-unit
entry. The pre-existing toggle-equivalence tests and the 320px no-overflow assertion are
unchanged, and the full-catalog `example-correctness.spec.js` sweep pins that all 1,144 examples
still reproduce.

## Deferred

- **Metric-only stragglers (task 4.1).** The audit found 19 plain `Weight (kg)` fields and 2
  core-temperature °C fields (`group-i` hypothermia / heat stroke) that never received a
  spec-v184 toggle, plus assorted `(kg, …)` variants. Converting each is a per-tile refactor
  (unitField swap + `wire()` list + read-path change), queued as follow-up waves; until then
  those fields stay explicitly labeled metric. `bw-hin` (inches) and `pw-lb` (lb) are already
  US-native.
- **Feet+inches composite height entry** (design D4 note): no tile offers it today; not added.

## Scope note

Because examples prefill on load, a tile whose example covers a unit field still *lands* showing
the canonical unit with the documented value — that is the ratified byte-identical contract at
work. The US default governs every field the example leaves empty, every freshly cleared form
state a renderer builds without an example, and all future tiles, without any example or adapter
re-authoring.
