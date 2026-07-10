# Tasks — US-customary unit defaults

## 1. Helper: decouple default-selected from canonical

- [ ] 1.1 Add a `defaultUnit` option to `unitField` (`lib/field-units.js`) that pre-selects the
      named unit while leaving the canonical unit as option 0 (Design D1).
- [ ] 1.2 Do **not** reorder any `*_UNITS` array; canonical stays first.
- [ ] 1.3 Unit test: `unitField(..., { defaultUnit:'lb' })` renders with lb selected and
      `unitNum` still returns kg for an lb entry.

## 2. Flip the default across call sites

- [ ] 2.1 Pass `defaultUnit:'lb'` at every `WEIGHT_UNITS` call site (30 fields).
- [ ] 2.2 Pass `defaultUnit:'in'` at every `HEIGHT_UNITS` call site (19 fields).
- [ ] 2.3 Pass `defaultUnit:'°F'` at every `TEMP_UNITS` call site (19 fields).
- [ ] 2.4 Ratify labs already US-default (mg/dL, g/dL) — no change; confirm none regressed.
- [ ] 2.5 Decide `LACTATE_UNITS` / `CALCIUM_MMOL_UNITS` per Design D4 (confirm the clinically
      correct US default; keep mmol/L unless a US-conventional unit is the true bedside norm).

## 3. Preserve example / deep-link reproduction

- [ ] 3.1 In `applyExample` (`app.js:2965`), reset every `select[id$="-unit"]` in the tool view
      to its canonical option **before** applying `example.fields`, so canonical-unit examples
      reproduce byte-identically (Design D2). Apply `example.fields` after the reset so any
      explicit unit key in an example still wins.
- [ ] 3.2 Confirm `applyHashState` still overrides from an explicit `*-unit` hash value (deep
      links unaffected).

## 4. Coverage — every unit-bearing tile

- [ ] 4.1 Audit for numeric inputs with a US/metric distinction that are still metric-only; add
      the appropriate `unitField` toggle defaulting to US.
- [ ] 4.2 Confirm unit-pinned analytes (HALP `g/L`, spec-v231) stay pinned — no toggle added.
- [ ] 4.3 Confirm no-variant inputs (mmHg, %, bpm, mL, mEq/L, points) are untouched.

## 5. Tests & guards

- [ ] 5.1 Update `test/integration/unit-toggle.spec.js` to assert the new US defaults (lb, in,
      °F) and that the metric option is still present and selectable.
- [ ] 5.2 Add a guard asserting every `WEIGHT_UNITS`/`HEIGHT_UNITS`/`TEMP_UNITS` call site sets
      a US `defaultUnit` (or that the shared helper defaults to US for those sets).
- [ ] 5.3 Run `test/integration/example-correctness.spec.js` (full-catalog Chromium sweep) — all
      `example.expected` tokens still render.
- [ ] 5.4 Run `npm run test:mcp` + `node scripts/check-mcp-catalog.mjs` — all 1,044 MCP
      round-trips unchanged (they never saw the display toggle).
- [ ] 5.5 Run `test/integration/unit-toggle.spec.js` 320px no-overflow assertion still passes.

## 6. Ship

- [ ] 6.1 `npm run lint`, `npm test`, `npm run build` all green.
- [ ] 6.2 Author the `docs/spec-v*.md` successor to spec-v184 recording the default flip; fold
      this change's `calculator-units` requirements in.
- [ ] 6.3 `UTILITIES.length` unchanged; catalog-truth surfaces unaffected. Record the change in
      `CHANGELOG.md`.
