# spec-v113.md — Dynamic fluid-responsiveness indices: IVC collapsibility/distensibility, PPV/SVV, and passive leg raise (+3 tiles)

> Status: **PROPOSED (2026-06-17).** Feature spec of the
> [spec-v100](spec-v100.md) **MDCalc Parity Completion** program, **Wave 3 —
> Critical care & pulmonary** ([spec-v100 §4](spec-v100.md)). Adds **3**
> deterministic preload-responsiveness math tiles that fill confirmed gaps. None
> duplicates a live tile.
>
> Catalog effect at v113 close: **493 + 3 = 496 tiles.**
>
> Every prior spec (v4 through v112) remains in force. v113 adds no runtime
> network call and no AI; each tile obeys the [spec-v100 §2](spec-v100.md)
> doctrine (re-binding [spec-v85 §2](spec-v85.md)) and the
> [spec-v100 §6](spec-v100.md) CI/CD contract, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its primary citation inline
> ([spec-v54](spec-v54.md)), and inherits the [spec-v59](spec-v59.md)
> output-safety contract.

## 1. Thesis

The catalog computes static hemodynamics (`hemodynamic-suite`, MAP, shock index,
cardiac-output math) but none of the **dynamic** preload-responsiveness indices an
intensivist uses at the bedside to decide whether a fluid bolus will help. Three
standard indices are absent:

- **Caval ultrasound has no index calculator** — IVC collapsibility (spontaneous
  breathing) and distensibility (mechanical ventilation) percentages, with the
  published thresholds that predict a fluid response.
- **Arterial-waveform variation has no PPV/SVV calculator** — pulse-pressure and
  stroke-volume variation percentages, with the ~13%/12% thresholds for
  responsiveness in the passively-ventilated patient.
- **The passive leg raise has no %ΔSV calculator** — the reversible
  autotransfusion maneuver whose stroke-volume change (≥ 10–15%) predicts
  responsiveness regardless of rhythm or ventilation mode.

Each is a published, deterministic ratio with cited thresholds a clinician already
uses at the bedside; v113 brings them onto the page.

## 2. What v113 adds (3 tiles)

### 2.1 `ivc-fluid-responsiveness` — IVC Collapsibility / Distensibility Index

- **Citation:** Barbier C, Loubières Y, Schmit C, et al. Respiratory changes in
  inferior vena cava diameter are helpful in predicting fluid responsiveness in
  ventilated septic patients. *Intensive Care Med.* 2004;30(9):1740-1746.
- **citationUrl:** https://doi.org/10.1007/s00134-004-2259-8
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `critical-care`, `emergency-medicine`, `nursing-icu`.
- **Inputs:** maximum and minimum IVC diameter across the respiratory cycle, and a
  ventilation-mode toggle (spontaneous → **collapsibility index**; mechanical →
  **distensibility index**).
- **Output:** the **index %** — collapsibility = (Dmax − Dmin)/Dmax × 100,
  distensibility = (Dmax − Dmin)/Dmin × 100 — with the cited responsiveness
  thresholds (distensibility ~18% predicts a fluid response). Class A (fixed
  arithmetic). **Robustness:** the denominator is guarded (Dmax > 0 for
  collapsibility, Dmin > 0 for distensibility).

### 2.2 `ppv-svv` — Pulse-Pressure / Stroke-Volume Variation

- **Citation:** Michard F, Boussat S, Chemla D, et al. Relation between
  respiratory changes in arterial pulse pressure and fluid responsiveness in
  septic patients with acute circulatory failure. *Am J Respir Crit Care Med.*
  2000;162(1):134-138.
- **citationUrl:** https://doi.org/10.1164/ajrccm.162.1.9903035
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `critical-care`, `anesthesiology`, `nursing-icu`.
- **Inputs:** maximum and minimum pulse pressure (for PPV) or maximum and minimum
  stroke volume (for SVV) over a respiratory cycle, with a mode toggle.
- **Output:** the **variation % = (max − min) / ([max + min]/2) × 100**, with the
  cited thresholds (PPV > 13% / SVV > 12% predict responsiveness) and the
  applicability caveats (regular rhythm, controlled ventilation, adequate tidal
  volume). Class A (fixed arithmetic). **Robustness:** the mean denominator is
  guarded (max + min > 0).

### 2.3 `passive-leg-raise` — Passive Leg Raise Stroke-Volume Response

- **Citation:** Monnet X, Rienzo M, Osman D, et al. Passive leg raising predicts
  fluid responsiveness in the critically ill. *Crit Care Med.*
  2006;34(5):1402-1407.
- **citationUrl:** https://doi.org/10.1097/01.CCM.0000215453.11735.06
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `critical-care`, `emergency-medicine`, `nursing-icu`.
- **Inputs:** baseline stroke volume (or cardiac output / VTI surrogate) and the
  peak value during the passive leg raise.
- **Output:** the **%ΔSV = (peak − baseline) / baseline × 100**, with the cited
  **≥ 10–15% predicts fluid responsiveness** framing and the maneuver-technique
  posture note (semi-recumbent start, measure within 1 min). Class A (fixed
  arithmetic). **Robustness:** the baseline denominator is guarded (baseline > 0).

## 3. Per-tile robustness

- **All three are ratio computes with guarded denominators.** Each requires its
  divisor strictly positive (Dmax/Dmin for the caval index per mode, the
  max+min mean for PPV/SVV, the baseline SV for PLR); a zero or blank divisor
  renders the surfaced complete-the-fields fallback rather than producing a number
  from a division by zero. Each compute uses `lib/num.js` and flows through the
  [spec-v59](spec-v59.md) fuzz harness with the divisions explicitly fuzzed for
  zero and for max < min (a min above max yields a correctly-signed negative
  index, surfaced in words, never silently clamped).
- **Posture note (required).** Each tile renders a [spec-v50](spec-v50.md) §3
  applicability caveat: PPV/SVV require a regular rhythm and passive
  (controlled-ventilation) breathing with adequate tidal volume; the IVC index
  mode must match the breathing mode; the PLR technique (semi-recumbent baseline,
  measure within ~1 min, real-time SV surrogate) is stated. None authors a
  treatment recommendation in Sophie's voice ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

Per the [spec-v100 §6](spec-v100.md) contract (re-binding [spec-v85 §6](spec-v85.md)):

- **Maintenance classes (§6.3):** all three are **Class A** — fixed arithmetic
  with cited thresholds — so **no** `docs/citation-staleness.md` row is needed.
  Citations name the **journal and authors** (Barbier/ICM, Michard/AJRCCM,
  Monnet/CCM), not an issuing-society acronym, so the `check-citations.mjs`
  `ISSUER_PATTERN` does **not** trip a spurious staleness row.
- **Gates (§6.2):** `lib/fluidresp-v113.js` is added to the
  `test/unit/fuzz-tools.test.js` `MODULES` list (zero non-finite leaks; the three
  ratio denominators explicitly fuzzed for zero/negative); each `META` example is
  pinned by the chromium `example-correctness` sweep; the catalog count moves on
  all **13 catalog-truth surfaces**; a11y, `mobile-no-hscroll`, and 44px
  touch-target checks pass for `views/group-v38.js`.
- **Renderer numbering (§6.1):** v113 claims `views/group-v38.js` and adds its
  `RV38` export to the `app.js` `RENDERERS` spread.

## 5. Files touched

```
docs/spec-v113.md                        (this file)
app.js                                   (+3 UTILITIES rows, group E; import group-v38 renderers into RENDERERS)
lib/fluidresp-v113.js                    (new module: ivcFluidResponsiveness, ppvSvv, passiveLegRaise)
lib/meta.js                              (+3 META entries: inline citation + citationUrl + accessed; cross-links to hemodynamic-suite, shock-index)
views/group-v38.js                       (new renderer module: 3 renderers; incl. the ventilation-mode toggle for IVC and the PPV/SVV mode toggle)
docs/clinical-citations.md               (+ rows for the three sources)
test/unit/ivc-fluid-responsiveness.test.js, ppv-svv.test.js, passive-leg-raise.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/fluidresp-v113.js to MODULES)
docs/audits/v12/ivc-fluid-responsiveness.md, ppv-svv.md, passive-leg-raise.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 493 -> 496; Wave 3 running ledger)
CHANGELOG.md                             (Unreleased: v113 entry, +3)
README.md, package.json                  (catalog count 493 -> 496; spec-progression line -> v113)
```

## 6. Acceptance criteria

v113 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all three ids are absent from the then-current catalog.
- All 3 tiles in §2 are live in Group E with a `META[id]` entry, an inline primary
  citation + `citationUrl` + `accessed`, ≥3 boundary worked examples each
  (including an IVC distensibility crossing its ~18% threshold, a PPV crossing
  13% / SVV crossing 12%, and a PLR %ΔSV crossing ≥ 10–15%), a
  [spec-v11](spec-v11.md) audit log, and a passing [spec-v29](spec-v29.md) §3
  check.
- Every ratio guards its denominator and renders the applicability/technique
  posture note; partial inputs render a complete-the-fields fallback.
- Every compute function uses `lib/num.js` and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- `UTILITIES.length` is **496** (or live count + 3 if specs land out of order) and
  all catalog-truth surfaces ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v113 with the +3 catalog delta.

## 7. Out of scope for v113

- **The fluid-responsiveness tiles report the index, not the fluid order.** Each
  reports the variation/index percentage and the source's responsiveness
  threshold; the give-fluid/withhold/start-pressor decision stays with the
  clinician and local protocol ([spec-v11](spec-v11.md) §5.3).
- **No ultrasound or waveform image analysis** — `ivc-fluid-responsiveness` and
  `ppv-svv` take the clinician's measured diameters/pressures, not an image or a
  monitor feed.
- **No continuous-monitor integration** — the tiles compute a single set of paired
  measurements; live arterial-line or echo streaming is out of scope
  ([spec-v5](spec-v5.md) §2).
- **No tidal-volume or rhythm gating logic** — the applicability caveats are
  stated as posture notes; the tile does not refuse to compute when the patient is
  spontaneously breathing or arrhythmic, it surfaces the caveat.
