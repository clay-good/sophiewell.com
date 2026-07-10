# Tasks — US-customary unit defaults

> Built 2026-07-10; recorded in `docs/spec-v283.md`. Design D1 was built as variant (b) (a
> `default: true` tag on the array entry, honored by `unitField`) rather than variant (a)'s
> per-call-site `defaultUnit` opt, so tasks 2.1–2.3 collapse into the three array edits — the
> option task 5.2 explicitly allowed. The D2 reset shipped scoped to example-covered fields
> (examples prefill on load, so a whole-view reset would have hidden the US default everywhere);
> see spec-v283 for the reasoning.

## 1. Helper: decouple default-selected from canonical

- [x] 1.1 Decouple default-selected from canonical in `unitField` (`lib/field-units.js`) —
      built as Design D1(b): the US entry is tagged `default: true` and `unitField` selects the
      tagged option at render; canonical stays option 0.
- [x] 1.2 No `*_UNITS` array reordered; canonical stays first (guarded by unit test).
- [x] 1.3 Unit test (`test/unit/field-units.test.js`): unitField renders with lb/°F selected and
      `unitNum` still returns the canonical kg/°C value.

## 2. Flip the default across call sites

- [x] 2.1 `WEIGHT_UNITS` → lb (array tag; every call site inherits it).
- [x] 2.2 `HEIGHT_UNITS` → in (array tag), plus the two inline height arrays in
      `views/group-e.js` (bmi `m/cm/in`, bsa `cm/in`).
- [x] 2.3 `TEMP_UNITS` → °F (array tag).
- [x] 2.4 Labs ratified US-default by position (mg/dL, g/dL option 0) — unchanged, pinned by the
      GLUCOSE_UNITS guard test.
- [x] 2.5 `LACTATE_UNITS` / `CALCIUM_MMOL_UNITS` stay mmol/L per Design D4 — US blood-gas
      analyzers report both in mmol/L; no flip.

## 3. Preserve example / deep-link reproduction

- [x] 3.1 `applyExample` resets each example-covered field's `<field>-unit` select to its
      canonical option 0 before applying `example.fields`; explicit unit keys in
      `example.fields` still win (fill runs after the reset). Scoped to unitField selects
      (option 0 carries the identity `_toCanonical`) so bespoke dose-unit pickers are untouched.
- [x] 3.2 `applyHashState` still overrides: ids in the hash (and remembered inputs) are in the
      skip set, so an explicit `*-unit` hash value survives the reset; unit-less inline-compute
      links (`q=w=70;h=1.75`) still read canonically because only the value id, not the select,
      is skipped. e2e-pinned both ways.

## 4. Coverage — every unit-bearing tile

- [x] 4.1 Audited: 19 plain `Weight (kg)` fields + 2 core-temp °C fields (group-i) predate the
      spec-v184 toggle rollout and remain metric-only; converting each is a per-tile refactor
      queued as follow-up waves (spec-v283 "Deferred"). `bw-hin` (in) / `pw-lb` (lb) already US.
- [x] 4.2 Unit-pinned analytes (HALP `g/L`, spec-v231) unchanged — no toggle added.
- [x] 4.3 No-variant inputs (mmHg, %, bpm, mL, mEq/L, points) untouched.

## 5. Tests & guards

- [x] 5.1 `test/integration/unit-toggle.spec.js`: five new spec-v283 tests (visible US default,
      canonical example reproduction, explicit-unit deep link, unit-less prefill link, reset
      link); metric options still selectable in the pre-existing equivalence tests.
- [x] 5.2 Guard: the shared helper defaults to US for WEIGHT/HEIGHT/TEMP (array-tag variant),
      asserted per array in `test/unit/field-units.test.js`.
- [x] 5.3 `test/integration/example-correctness.spec.js` full-catalog Chromium sweep green.
- [x] 5.4 `npm run test:mcp` + `node scripts/check-mcp-catalog.mjs` green (adapters never see
      the display toggle).
- [x] 5.5 320px no-overflow assertion in `unit-toggle.spec.js` green.

## 6. Ship

- [x] 6.1 `npm run lint`, `npm test`, `npm run build` all green.
- [x] 6.2 `docs/spec-v283.md` records the flip (successor to spec-v184), folding this change's
      `calculator-units` requirements in.
- [x] 6.3 `UTILITIES.length` unchanged; catalog-truth surfaces unaffected; `CHANGELOG.md`
      updated.
