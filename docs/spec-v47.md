# spec-v47.md — Dual-unit lab inputs: SI ⇄ US conventional accepted everywhere

> Status: proposed (2026-05-22). v47 is a feature spec that
> retrofits the lab-value input surface across the catalog. It
> adds **zero new tiles** but changes the input shape of every
> tile that consumes a lab analyte. The scope test
> ([spec-v29](spec-v29.md) §3) is preserved: each affected tile
> still consumes ≥ 1 user input and produces a computed output;
> v47 widens what the user is allowed to type without changing what
> any tile computes.
>
> Catalog effect at v47 close: **254 tiles unchanged.**
>
> Every prior spec (v4 through v46) remains in force.

## 1. Why v47 exists

US clinical labs predominantly report in *conventional* units —
creatinine in mg/dL, glucose in mg/dL, bilirubin in mg/dL,
calcium in mg/dL — but the picture is not uniform:

1. A growing number of US academic centers (Mayo, MGH, UCSF, and
   the VA system) report selected analytes in SI: bilirubin in
   μmol/L on some pediatric services, calcium in mmol/L on some
   transplant services, glucose in mmol/L on some endocrine
   research surfaces. The bedside RN reading a printout cannot
   assume the unit Sophie expects matches the unit she is holding.
2. Foreign-trained clinicians working in US hospitals — a
   substantial fraction of US house staff — think natively in SI.
   The cognitive friction of unit conversion at 2 a.m. is exactly
   the friction Sophie exists to remove.
3. Published clinical formulas are mixed: Cockcroft-Gault and
   MDRD-4 use creatinine in mg/dL; the original CKD-EPI 2009
   paper publishes the equation in mg/dL but the 2021 race-free
   refit publishes parallel μmol/L coefficients. Today Sophie
   takes one and silently expects it; v47 lets the user choose.

The bedside problem this solves is concrete: a nurse pulls up
the Sophie Cockcroft-Gault tile, looks at her lab printout that
reads "creatinine 110 μmol/L," and has to do mental math
(`110 / 88.4 = 1.24 mg/dL`) before she can type the number. v47
eliminates that step.

## 2. Non-goals

- **No clinical-decision changes.** The tile math is unchanged.
  v47 changes input acceptance and rendering only.
- **No new tiles.** Every existing lab-consuming tile is
  retrofitted; nothing is added.
- **No persistence.** Unit preference is in-memory only (per the
  v10 "no cookies / no accounts" budget). When the user reloads,
  every tile reverts to its citation-native unit.
- **No support for analytes Sophie does not currently consume.**
  The registry is closed at the set in §3.
- **No support for non-numeric labs** (qualitative results like
  "positive / negative"). Out of scope.

## 3. The analyte registry

A new export `LAB_UNITS` in [lib/unit-convert.js](../lib/unit-convert.js)
enumerates every analyte Sophie consumes and its conversion
factor. Initial set (final list locked at wave 47-1):

| Analyte | Conventional | SI | Conversion (SI = conventional × factor) |
|---|---|---|---|
| Creatinine | mg/dL | μmol/L | × 88.4 |
| Urea / BUN | mg/dL | mmol/L | × 0.357 |
| Glucose | mg/dL | mmol/L | × 0.0555 |
| Bilirubin (total) | mg/dL | μmol/L | × 17.1 |
| Bilirubin (direct) | mg/dL | μmol/L | × 17.1 |
| Calcium (total) | mg/dL | mmol/L | × 0.2495 |
| Calcium (ionized) | mg/dL | mmol/L | × 0.2495 |
| Magnesium | mg/dL | mmol/L | × 0.4114 |
| Phosphate | mg/dL | mmol/L | × 0.3229 |
| Albumin | g/dL | g/L | × 10 |
| Total protein | g/dL | g/L | × 10 |
| Hemoglobin | g/dL | g/L | × 10 |
| Lactate | mg/dL | mmol/L | × 0.111 |
| Uric acid | mg/dL | μmol/L | × 59.48 |
| Cholesterol (total / LDL / HDL) | mg/dL | mmol/L | × 0.0259 |
| Triglycerides | mg/dL | mmol/L | × 0.0113 |
| Troponin I | ng/mL | μg/L | × 1 (identical) |
| Troponin T (hs) | ng/L | ng/L | (SI only in routine US use) |
| BNP | pg/mL | ng/L | × 1 (identical) |
| NT-proBNP | pg/mL | ng/L | × 1 (identical) |
| Ferritin | ng/mL | μg/L | × 1 (identical) |
| AST | U/L | U/L | × 1 (identical) |
| ALT | U/L | U/L | × 1 (identical) |
| Alkaline phosphatase | U/L | U/L | × 1 (identical) |
| Free T4 | ng/dL | pmol/L | × 12.87 |
| TSH | mIU/L | mIU/L | × 1 (identical) |

Sodium, potassium, chloride, bicarbonate, and PaCO₂/PaO₂/pH are
*not* included: in US practice all of these are routinely
reported in the same unit (mEq/L or mmHg) whether the lab calls
the system "conventional" or "SI." A future spec may revisit if
this becomes wrong.

INR, anion gap, A-a gradient, P/F ratio, and all *computed*
derived quantities are unitless or use a single fixed unit and
are not part of v47.

## 4. The LabValueInput helper

A new render helper `renderLabInput({ analyte, value, onChange })`
in [lib/field.js](../lib/field.js). Emits:

- A numeric `<input>` for the value (with `inputmode="decimal"`).
- A `<select>` (or segmented control on wide screens) bound to
  the two units listed in `LAB_UNITS[analyte]`.
- Default unit is the *citation-native* unit for the tile (per
  `META[id].citationUnits[analyte]`).
- On unit toggle: the value field re-displays the live-converted
  value to 3 significant figures; the underlying computation
  always uses the citation-native unit.
- Aria-label: `"<Analyte> (<unit>)"` matching the current toggle.
- The toggle is sticky **per analyte, in memory, for the
  duration of the current tab**. Navigating between tiles
  preserves "I'm working in SI today" without persisting it.

## 5. Retrofit plan

v47 ships in three waves, each independently lintable, testable,
buildable, and committable.

### Wave 47-1 — Registry + helper + top-5 retrofit

- Land `LAB_UNITS` registry with all entries in §3.
- Land `renderLabInput` helper in `lib/field.js`.
- Retrofit the 5 highest-impact tiles:
  - Cockcroft-Gault eGFR (creatinine)
  - CKD-EPI 2021 eGFR (creatinine)
  - MELD / MELD-Na (creatinine, bilirubin, sodium)
  - Anion gap (sodium, chloride, bicarbonate — already shared units; the AG tile is *not* a v47 candidate)
  - HEART score (troponin — already shared units in US use; v47 still wires the toggle for SI display)
  - Corrected calcium (calcium, albumin)
  - Lactate clearance (lactate)
  - Sepsis-3 lactate gate (lactate)
- Each retrofitted tile keeps its existing unit-tests green; a
  new round-trip test asserts that typing the SI-equivalent of
  the canonical worked example produces an identical computed
  output.

### Wave 47-2 — Hepatic / hematologic / nutrition

- Retrofit every tile that consumes bilirubin (total or direct),
  AST, ALT, ALP, albumin, total protein, hemoglobin, ferritin.

### Wave 47-3 — Endocrine / lipid / cardiac extension

- Retrofit every tile that consumes glucose, cholesterol panel,
  triglycerides, TSH, free T4, BNP, NT-proBNP, troponin (T).

A subsequent wave may sweep any remaining analytes if the
registry is expanded.

## 6. Testing requirements

Every retrofitted tile gains the following test cases in addition
to its existing boundary worked examples:

1. **Round-trip equality.** For each analyte the tile consumes,
   take the canonical worked-example input, convert to SI using
   the §3 factor, feed it back through the tile with the unit
   toggle set to SI, and assert the result equals the original
   to within citation-significant figures.
2. **Toggle-without-recompute.** Setting a value, then toggling
   the unit, must not change the *underlying citation-unit value*
   used for computation. (Tested via a synthetic harness that
   observes the value passed to the scoring function.)
3. **No-leak.** Toggling unit on one tile does not change the
   unit on a different analyte on the same tile.

The a11y test suite ([scripts/a11y-check.mjs](../scripts/a11y-check.mjs))
is extended to assert that every lab input pair (numeric + unit
toggle) has a single accessible label group.

## 7. UI affordance

- On narrow viewports (≤ 480 px): the unit toggle is a `<select>`
  immediately right of the numeric input.
- On wider viewports (> 480 px): the toggle is a segmented
  control with two equal-width buttons; the current unit is
  `aria-pressed="true"`.
- The currently-displayed unit is *also* echoed in the tile's
  result block: "MELD = 14 (creatinine 1.2 mg/dL / 106 μmol/L)."

## 8. Files touched (across waves)

```
docs/spec-v47.md                          (this file; wave 47-1)
lib/unit-convert.js                       (expand: LAB_UNITS registry)
lib/field.js                              (+ renderLabInput helper)
lib/meta.js                               (+ citationUnits per affected tile)
views/group-*.js                          (use renderLabInput; per-wave subsets)
test/unit/unit-convert.test.js            (+ round-trip cases per analyte)
test/unit/<tile>.test.js                  (+ SI-equivalent case per retrofitted tile)
scripts/a11y-check.mjs                    (+ unit-pair label assertion)
CHANGELOG.md                              (Unreleased: v47 wave entries)
README.md                                 (note: dual-unit lab inputs)
```

## 9. Acceptance criteria

v47 is fully shipped when:

- This file exists.
- `LAB_UNITS` is populated with every analyte in §3 and exported
  from `lib/unit-convert.js`.
- `renderLabInput` is exported from `lib/field.js` and used by
  every tile that consumes any analyte in the registry.
- Every retrofitted tile has the three new tests in §6.
- `npm run lint`, `npm run test`, `npm run sbom`, and
  `npm run build` are all green.
- The CHANGELOG records each wave separately.
- The README first-section blurb gains one sentence on dual-unit
  acceptance (subject to the v46 catalog-truth guard).

## 10. Out of scope for v47

- **Non-US unit conventions** (e.g., the UK "molar units only"
  convention, or the SI-pure European Federation of Clinical
  Chemistry recommendations). Sophie remains a US-focused tool;
  the dual-unit toggle is for the US bedside reality, not for
  internationalization. International scope is explicitly
  deferred and may be addressed by a future spec only if the
  maintainer commits to it.
- **Drug concentrations** (mg/mL vs μmol/mL). v47 covers
  analytes only. Pharmacy unit conversion is a separate problem
  with separate citations.
- **Pressure units** (mmHg vs kPa for blood pressure or
  PaO₂/PaCO₂). US practice is uniformly mmHg; out of scope.
- **Temperature units** (°F vs °C). Already handled per-tile by
  the existing [lib/unit-convert.js](../lib/unit-convert.js)
  helpers; not part of v47.
- **Anything that changes the math.** A round-trip from
  conventional → SI → conventional must produce the same
  computed output. v47 is a presentation layer, not a clinical
  spec.
