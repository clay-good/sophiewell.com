# spec-v87.md — Hemodynamics & ICU physiology: the Swan-Ganz resistance suite, mechanical power, and dead-space fraction (+3 tiles)

> Status: **PROPOSED (2026-06-16).** Second feature spec of the
> [spec-v85](spec-v85.md) Advanced Clinical Calculators program. Adds **3**
> deterministic critical-care physiology calculators that fill the gap between the
> oxygen-content/oxygenation tiles the catalog already ships (`cao2-do2`,
> `oxygenation-index`, `driving-pressure`) and the pressure/flow math an
> intensivist computes from a pulmonary-artery catheter and a ventilator: the
> systemic/pulmonary vascular resistance suite, the mechanical power of
> ventilation, and the physiologic dead-space fraction. None duplicates an existing
> tile.
>
> Catalog effect at v87 close: **369 + 3 = 372 tiles.**
>
> Every prior spec (v4 through v86) remains in force. v87 adds no runtime network
> call and no AI; each tile obeys the [spec-v85](spec-v85.md) §2 doctrine, passes
> the [spec-v29](spec-v29.md) §3 one-line test, ships its primary citation inline
> ([spec-v54](spec-v54.md)), and inherits the [spec-v59](spec-v59.md) output-safety
> contract — with explicit domain guards on the divisions and logarithm these
> formulas contain.

## 1. Thesis

The catalog computes arterial oxygen content and delivery (`cao2-do2`), the
oxygenation indices (`oxygenation-index`), and ventilator driving pressure
(`driving-pressure`), but it has **no tile for the pressure/flow side** of
critical-care hemodynamics. Three computations are standardized, deterministic, and
absent:

- **Vascular resistance and the cardiac indices.** Given a cardiac output and the
  pressures from a pulmonary-artery catheter, SVR, PVR, and the body-surface-area-
  indexed forms (CI, SVRI, PVRI) follow from fixed equations. These are the numbers
  that distinguish cardiogenic, distributive, and obstructive shock at the bedside.

- **Mechanical power of ventilation.** Driving pressure is one term; the *energy*
  the ventilator delivers per minute (Gattinoni 2016) integrates rate, tidal
  volume, driving pressure, and PEEP, and a threshold around 17 J/min marks higher
  ventilator-induced-lung-injury risk. The catalog has the driving-pressure term but
  not the power.

- **Physiologic dead-space fraction (Vd/Vt).** The Bohr–Enghoff equation turns an
  arterial and a mixed-expired (or end-tidal) CO₂ into the fraction of each breath
  that does not participate in gas exchange — a number with direct prognostic weight
  in ARDS (Nuckton 2002).

Each is a pure function of measurements the user already has; v87 brings them onto
the page.

## 2. What v87 adds (3 tiles)

### 2.1 `hemodynamic-suite` — Cardiac index, stroke volume, and the SVR / PVR resistance suite

- **Citation:** The thermodilution/Fick hemodynamic framework — Swan HJC, Ganz W,
  Forrester J, et al. Catheterization of the heart in man with use of a flow-
  directed balloon-tipped catheter. *N Engl J Med.* 1970;283(9):447-451. The
  pulmonary vascular resistance definition and Wood-unit reporting follow the 2022
  ESC/ERS Guidelines for the diagnosis and treatment of pulmonary hypertension
  (Humbert M, et al. *Eur Heart J.* 2022;43(38):3618-3731), which define PVR in Wood
  units with the cited normal thresholds.
- **citationUrl:** https://doi.org/10.1093/eurheartj/ehac237
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `critical-care`, `cardiology`, `cardiac-surgery`,
  `nursing-icu`.
- **Inputs:** cardiac output (L/min, entered or thermodilution); heart rate (bpm);
  mean arterial pressure (mmHg); central venous pressure (mmHg); mean pulmonary
  artery pressure (mmHg); pulmonary capillary wedge pressure (mmHg); and body
  surface area (entered, or height + weight to compute via the existing BSA logic).
- **Output:** a single derivation block giving **cardiac index** (CI = CO / BSA),
  **stroke volume** (SV = CO / HR × 1000, mL) and **stroke volume index** (SVI),
  **systemic vascular resistance** (SVR = 80 · (MAP − CVP) / CO, dynes·s·cm⁻⁵) and
  **SVRI**, and **pulmonary vascular resistance** (PVR = 80 · (mPAP − PCWP) / CO in
  dynes·s·cm⁻⁵, reported **also in Wood units** = (mPAP − PCWP) / CO) and **PVRI** —
  each with its normal-range flag (e.g. CI 2.5–4.0 L/min/m²; SVR 800–1200; PVR
  < 2 Wood units per the ESC/ERS threshold). The block shows the unit conversion
  (×80) explicitly. **Near-neighbor:** `cao2-do2` (E) computes oxygen *delivery*
  from the same CO; this tile computes the *resistances* and is cross-linked. It is
  distinct from `vis` (the vasoactive-inotropic dose score), `map`, and
  `shock-index`.

### 2.2 `mechanical-power` — Mechanical power of ventilation

- **Citation:** Gattinoni L, Tonetti T, Cressoni M, et al. Ventilator-related causes
  of lung injury: the mechanical power. *Intensive Care Med.* 2016;42(10):1567-1575.
  The high-risk association above ~17 J/min: Serpa Neto A, et al. *Intensive Care
  Med.* 2018;44(11):1914-1922.
- **citationUrl:** https://doi.org/10.1007/s00134-016-4505-2
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `critical-care`, `pulmonology`, `respiratory-therapy`,
  `nursing-icu`.
- **Inputs:** respiratory rate (breaths/min); tidal volume (mL); plateau pressure
  (cmH₂O); PEEP (cmH₂O); and peak pressure (cmH₂O) for the volume-control simplified
  form. Mode toggle (volume-control simplified vs the driving-pressure form).
- **Output:** **mechanical power** in **J/min** via the Gattinoni simplified
  power equation — MP ≈ 0.098 · RR · Vt(L) · (Ppeak − ½ · (Pplat − PEEP)) — with the
  driving pressure (Pplat − PEEP) shown as an intermediate, and the **> 17 J/min
  higher-VILI-risk flag** quoted from Serpa Neto. The derivation shows the
  0.098 cmH₂O·L → joule constant. **Near-neighbor:** `driving-pressure` (E) computes
  the ΔP term this tile multiplies through; the two cross-link.

### 2.3 `dead-space` — Physiologic dead-space fraction (Bohr–Enghoff Vd/Vt)

- **Citation:** Enghoff modification of the Bohr equation; prognostic value in ARDS
  — Nuckton TJ, Alonso JA, Kallet RH, et al. Pulmonary dead-space fraction as a risk
  factor for death in the acute respiratory distress syndrome. *N Engl J Med.*
  2002;346(17):1281-1287.
- **citationUrl:** https://doi.org/10.1056/NEJMoa012835
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `critical-care`, `pulmonology`, `respiratory-therapy`.
- **Inputs:** arterial PaCO₂ (mmHg); mixed-expired PĒCO₂ (mmHg, from volumetric
  capnography) **or** end-tidal EtCO₂ (mmHg) as a bedside surrogate, with the
  surrogate labeled as such.
- **Output:** **Vd/Vt = (PaCO₂ − PĒCO₂) / PaCO₂** (Enghoff form), shown as a
  derivation, with the elevated-fraction flag (Vd/Vt > 0.6 carried independent
  mortality risk in ARDS per Nuckton). When EtCO₂ is used in place of PĒCO₂, the
  output states the estimate is an end-tidal surrogate that *underestimates* true
  dead space.

## 3. Per-tile robustness

- **Division guards are explicit.** Every resistance and index divides by cardiac
  output, BSA, or heart rate; each compute returns a surfaced `valid:false`
  fallback ("enter a cardiac output > 0") rather than `Infinity` when a denominator
  is zero or blank. The [spec-v59](spec-v59.md) fuzz harness covers all three
  modules with zero non-finite leaks as a merge gate.
- **`dead-space` clamps to a physiologic range.** If PĒCO₂ ≥ PaCO₂ (a measurement or
  entry error), the fraction would be ≤ 0; the tile reports the computed value and
  flags the implausible input rather than silently clamping, mirroring the
  signed-gap handling in `toxic-alcohol` ([spec-v86](spec-v86.md) §3).
- **Units are surfaced, never assumed.** PVR is reported in **both** dynes·s·cm⁻⁵
  and Wood units (the ESC/ERS threshold is stated in Wood units); the ×80 conversion
  is shown so a user reading either convention can verify. Mechanical power's
  0.098 constant is shown with its cmH₂O·L → J derivation.
- All three render the [spec-v50](spec-v50.md) §3 clinical posture note and quote
  the source's normal ranges / risk thresholds; none authors a management
  recommendation in Sophie's voice ([spec-v11](spec-v11.md) §5.3).

## 4. Files touched

```
docs/spec-v87.md                         (this file)
app.js                                   (+3 UTILITIES rows, group E; import group-v13 renderers into RENDERERS)
lib/hemodynamics-v87.js                  (new module: hemodynamicSuite, mechanicalPower, deadSpace)
lib/meta.js                              (+3 META entries: inline citation + citationUrl + accessed; cross-links to cao2-do2, driving-pressure, map, shock-index)
views/group-v13.js                       (new renderer module: 3 renderers; the suite derivation block, the power equation, the Vd/Vt derivation)
docs/clinical-citations.md               (+ rows for the three physiology sources; ESC/ERS PVR threshold flagged revisable)
docs/citation-staleness.md               (+ row: ESC/ERS 2022 PH guideline PVR threshold)
test/unit/hemodynamic-suite.test.js      (new; ≥3 worked examples incl. a cardiogenic-shock pattern and the CO=0 guard)
test/unit/mechanical-power.test.js       (new; ≥3 incl. the 17 J/min threshold flip)
test/unit/dead-space.test.js             (new; ≥3 incl. the Vd/Vt>0.6 flag and the EtCO2-surrogate label)
test/unit/fuzz-tools.test.js             (add lib/hemodynamics-v87.js to MODULES)
docs/audits/v12/hemodynamic-suite.md, mechanical-power.md, dead-space.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 369 -> 372; append to the running ledger)
CHANGELOG.md                             (Unreleased: v87 entry, +3)
README.md, package.json                  (catalog count 369 -> 372; spec-progression line -> v87)
```

## 5. Acceptance criteria

v87 is fully shipped when:

- All 3 tiles in §2 are live in Group E with a `META[id]` entry, an inline primary
  citation + `citationUrl` + `accessed`, ≥3 boundary worked examples in the unit
  test (including a zero-denominator guard, the mechanical-power threshold flip, and
  the dead-space EtCO₂-surrogate case), a [spec-v11](spec-v11.md) audit log, and a
  passing [spec-v29](spec-v29.md) §3 scope check.
- `hemodynamic-suite` reproduces a textbook worked example within 0.5% for CI, SV,
  SVR, SVRI, PVR (dynes and Wood units), and PVRI, and flags each normal range; it
  returns a surfaced fallback (not `Infinity`) when CO is 0 or blank.
- `mechanical-power` computes J/min from the Gattinoni simplified equation, shows
  the driving-pressure intermediate, and flags > 17 J/min.
- `dead-space` computes the Enghoff Vd/Vt, flags > 0.6, and labels the EtCO₂ form as
  an underestimating surrogate.
- Every compute function uses `lib/num.js`, guards its divisions, and is covered by
  the [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- `UTILITIES.length` is **372** and all catalog-truth surfaces
  ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v87 with the +3 catalog delta.

## 6. Out of scope for v87

- **No estimation of cardiac output itself.** `hemodynamic-suite` takes CO as an
  input (thermodilution or Fick-derived); it does not compute CO from a Fick
  oxygen-consumption estimate (the assumed-VO₂ Fick method is a separate tile that
  would need its own validation discussion) — though it cross-links `cao2-do2`,
  which already does the oxygen-content side.
- **No ventilator-waveform integration.** `mechanical-power` uses the simplified
  surrogate (rate, Vt, plateau, PEEP, peak); the geometric/area-integral form that
  requires a full pressure–volume loop is out of scope because it needs waveform
  data the tile cannot accept as a handful of numbers.
- **No volumetric-capnography import.** `dead-space` takes PĒCO₂ (or EtCO₂) as an
  entered number; it does not parse a capnograph trace (that would be a data feed,
  excluded by [spec-v5](spec-v5.md) §2).
- **No auto-classification of shock type.** The suite reports the resistances and
  indices with their normal ranges; the cardiogenic-vs-distributive-vs-obstructive
  judgment stays with the clinician.
