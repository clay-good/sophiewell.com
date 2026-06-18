# spec-v101.md — AF, stroke-risk & QT: CHADS₂, CHA₂DS₂-VA, CHADS-65, ATRIA stroke, and Tisdale QT risk (+5 tiles)

> Status: **SHIPPED (2026-06-18).** Feature spec of the [spec-v100](spec-v100.md)
> MDCalc Parity Completion program, **Wave 1** (Cardiology / EP / vascular / lipids).
> Adds **5** deterministic atrial-fibrillation stroke-risk and QT-prolongation
> instruments that fill confirmed gaps. None duplicates a live tile.
>
> Catalog effect: **432 + 5 = 437 tiles.**
>
> Every prior spec (v4 through v100) remains in force. v101 adds no runtime network
> call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2 doctrine (which
> re-binds the [spec-v85](spec-v85.md) §2 suite doctrine) and the
> [spec-v100](spec-v100.md) §6 CI/CD contract, passes the [spec-v29](spec-v29.md) §3
> one-line test, ships its primary citation inline ([spec-v54](spec-v54.md)), and
> inherits the [spec-v59](spec-v59.md) output-safety contract.

## 1. Thesis

The catalog ships the venerable `chads` (CHADS₂/CHA₂DS₂-VASc combined view) but is
missing the original, the 2024-ESC successor, the Canadian anticoagulation pathway,
and the two other instruments a hospitalist or electrophysiologist reaches for when
deciding AF anticoagulation or screening inpatient QT risk:

- **No standalone CHADS₂ tile.** The original 2001 Gage score is folded inside
  `chads`; it deserves its own cross-linked tile so the CHADS₂ → VASc → 2024-VA
  migration reads in one place.
- **No CHA₂DS₂-VA tile.** The 2024 ESC AF guideline drops the sex (Sc) point;
  `cha2ds2-va` is the current ESC stroke-risk form and is reachable nowhere.
- **No CHADS-65 tile.** The Canadian (CCS) age-65 gate pathway is a distinct
  decision rule from the point scores and is absent.
- **No ATRIA Stroke Score.** The age/sex/comorbidity model with its prior-stroke
  interaction term is a standard alternative to CHA₂DS₂-VASc.
- **No inpatient QT-risk screen.** `qtc-suite` computes QTc but does not stratify
  *drug-induced* QT-prolongation risk; the Tisdale score is that bedside tool.

Each is a published, deterministic instrument a clinician already uses; v101 brings
them onto the page and opens Wave 1.

## 2. What v101 adds (5 tiles)

### 2.1 `chads2` — CHADS₂ stroke-risk score (original)

- **Citation:** Gage BF, Waterman AD, Shannon W, et al. Validation of clinical
  classification schemes for predicting stroke: results from the National Registry
  of Atrial Fibrillation. *JAMA.* 2001;285(22):2864-2870.
- **citationUrl:** https://doi.org/10.1001/jama.285.22.2864
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `cardiology`, `internal-medicine`, `nursing-tele`,
  `family-medicine`.
- **Inputs:** congestive heart failure (1), hypertension (1), age ≥ 75 (1), diabetes
  mellitus (1), prior stroke/TIA (2).
- **Output:** the **total (0–6)** with the published annual-stroke-rate band per
  point (e.g. 0 ≈ 1.9%/yr, 6 ≈ 18.2%/yr). Class A (fixed 2001 derivation). Cross-links
  the existing `chads` view and the new `cha2ds2-va`/`chads-65`.

### 2.2 `cha2ds2-va` — CHA₂DS₂-VA (2024 ESC, sex-removed)

- **Citation:** Van Gelder IC, Rienstra M, Bunting KV, et al. 2024 ESC Guidelines
  for the management of atrial fibrillation. *Eur Heart J.* 2024;45(36):3314-3414
  (CHA₂DS₂-VA, sex point removed from CHA₂DS₂-VASc).
- **citationUrl:** https://doi.org/10.1093/eurheartj/ehae176
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `cardiology`, `internal-medicine`, `nursing-tele`,
  `pharmacy`.
- **Inputs:** CHF/LV dysfunction (1), hypertension (1), age ≥ 75 (2), diabetes (1),
  prior stroke/TIA/thromboembolism (2), vascular disease (1), age 65–74 (1). **No sex
  point** (the 2024 change vs CHA₂DS₂-VASc).
- **Output:** the **total (0–8)** with the ESC anticoagulation-consideration framing
  (≥ 2 favors oral anticoagulation). **Class B** (the ESC AF guideline is revisable →
  `docs/citation-staleness.md` row, on-publication cadence). Cross-links `chads`,
  `chads2`, `chads-65`.

### 2.3 `chads-65` — CHADS-65 Canadian anticoagulation pathway (CCS)

- **Citation:** Andrade JG, Aguilar M, Atzema C, et al. The 2020 Canadian
  Cardiovascular Society/Canadian Heart Rhythm Society Comprehensive Guidelines for
  the Management of Atrial Fibrillation. *Can J Cardiol.* 2020;36(12):1847-1948.
- **citationUrl:** https://doi.org/10.1016/j.cjca.2020.09.001
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `cardiology`, `internal-medicine`, `nursing-tele`,
  `family-medicine`.
- **Inputs:** the sequential gates — age ≥ 65 (yes → OAC); else any CHADS₂ risk factor
  (CHF, hypertension, age, diabetes, prior stroke/TIA → OAC); else coronary or
  peripheral arterial disease (→ antiplatelet); else no antithrombotic.
- **Output:** the **pathway verdict** (oral anticoagulant / antiplatelet / none) naming
  the gate that fired. **Class B** (CCS guidance is revisable → `docs/citation-staleness.md`
  row, on-publication cadence). Cross-links `chads2`, `cha2ds2-va`.

### 2.4 `atria-stroke` — ATRIA Stroke Risk Score

- **Citation:** Singer DE, Chang Y, Borowsky LH, et al. A new risk scheme to predict
  ischemic stroke and other thromboembolism in atrial fibrillation: the ATRIA study
  stroke risk score. *J Am Heart Assoc.* 2013;2(3):e000250.
- **citationUrl:** https://doi.org/10.1161/JAHA.113.000250
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `cardiology`, `internal-medicine`, `nursing-tele`,
  `pharmacy`.
- **Inputs:** age (banded, with a **separate point set if prior stroke is present**),
  sex, diabetes, congestive heart failure, hypertension, proteinuria, eGFR < 45 or
  ESRD.
- **Output:** the **total (0–15)** mapped to the published low/intermediate/high
  annual-stroke-rate bands; the model's **prior-stroke interaction** selects the
  age-point column. Class A (fixed 2013 coefficients). Cross-links `chads2`,
  `cha2ds2-va`.

### 2.5 `tisdale-qtc` — Tisdale QT-prolongation Risk Score

- **Citation:** Tisdale JE, Jaynes HA, Kingery JR, et al. Development and validation
  of a risk score to predict QT interval prolongation in hospitalized patients. *Circ
  Cardiovasc Qual Outcomes.* 2013;6(4):479-487.
- **citationUrl:** https://doi.org/10.1161/CIRCOUTCOMES.113.000152
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `cardiology`, `pharmacy`, `nursing-tele`,
  `critical-care`.
- **Inputs:** age ≥ 68 (1), female sex (1), loop diuretic (1), serum K ≤ 3.5 (2),
  admission QTc ≥ 450 ms (2), acute MI (2), ≥ 2 QT-prolonging drugs (3), sepsis (3),
  heart failure (3), one QT-prolonging drug (3).
- **Output:** the **total (0–21)** with the published risk band — **low ≤ 6,
  moderate 7–10, high ≥ 11** for drug-associated QTc prolongation. Class A (fixed 2013
  point weights). Cross-links the existing `qtc-suite`.

## 3. Per-tile robustness

- **`chads2`, `cha2ds2-va`, `atria-stroke`, and `tisdale-qtc` are bounded
  point-sum logic**; each flows through the [spec-v59](spec-v59.md) fuzz harness, names
  which factors were counted, and clamps the total to its published maximum.
- **`atria-stroke` guards its prior-stroke interaction** — the age-point column is
  selected by the stroke flag before summing, so a fuzzed age never reads the wrong
  column; out-of-band ages clamp to the nearest published band.
- **`chads-65` is sequential-gate logic** with no arithmetic overflow surface; it
  returns the single verdict and the gate that produced it, never a half-evaluated
  pathway.
- All five render the [spec-v50](spec-v50.md) §3 clinical posture note and quote the
  source's interpretation; none authors an anticoagulation or dosing recommendation in
  Sophie's voice ([spec-v11](spec-v11.md) §5.3) — the high-stakes AF-anticoagulation
  decision stays with the clinician and local protocol.

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding [spec-v85](spec-v85.md) §6):

- **Maintenance classes (§6.3):** `chads2`, `atria-stroke`, and `tisdale-qtc` are
  **Class A** (fixed derivation papers / point weights) — **no** `docs/citation-staleness.md`
  row. Their citations name the **journal + authors**, not a society, to avoid the
  `ISSUER_PATTERN` false-positive. `cha2ds2-va` (2024 ESC AF guideline) and `chads-65`
  (2020 CCS guideline) are **Class B** — each gets a staleness row naming the edition in
  force, the `accessed` date, and an on-publication review cadence, monitored by the
  `scripts/check-citation-cadence.mjs` warn-job.
- **Gates (§6.2):** `lib/cardio-v101.js` is added to the `test/unit/fuzz-tools.test.js`
  `MODULES` list (zero non-finite leaks); each `META` example is pinned by the chromium
  `example-correctness` sweep; the catalog count moves on all **13 catalog-truth
  surfaces**; a11y, `mobile-no-hscroll`, and 44px touch-target checks pass for the new
  `views/group-v26.js` renderer (its `RV26` export is added to the `app.js` `RENDERERS`
  spread).

## 5. Files touched

```
docs/spec-v101.md                        (this file)
app.js                                   (+5 UTILITIES rows, group G; import group-v26 RV26 into RENDERERS)
lib/cardio-v101.js                       (new module: chads2, cha2ds2Va, chads65, atriaStroke, tisdaleQtc)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links to chads, qtc-suite)
views/group-v26.js                       (new renderer module: 5 renderers)
docs/citation-staleness.md               (+ rows: cha2ds2-va 2024 ESC AF, chads-65 2020 CCS)
docs/clinical-citations.md               (+ rows for the five sources)
test/unit/chads2.test.js, cha2ds2-va.test.js, chads-65.test.js, atria-stroke.test.js, tisdale-qtc.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/cardio-v101.js to MODULES)
docs/audits/v12/chads2.md, cha2ds2-va.md, chads-65.md, atria-stroke.md, tisdale-qtc.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 432 -> 437; Wave 1 progress)
CHANGELOG.md                             (Unreleased: v101 entry, +5)
README.md, package.json                  (catalog count 432 -> 437; spec-progression line -> v101)
```

## 6. Acceptance criteria

v101 is fully shipped when:

- The implementing session has **re-run the §6.2 collision check** and confirmed all
  five ids are absent (the existing `chads` view stays, cross-linked).
- All 5 tiles in §2 are live in Group G with a `META[id]` entry, an inline primary
  citation + `citationUrl` + `accessed`, ≥ 3 boundary worked examples each — including a
  CHADS₂ = 1 vs = 2 band-flip, a CHA₂DS₂-VA = 1 vs = 2 OAC-threshold flip, a CHADS-65
  age-65 gate vs CHADS₂-factor gate, an ATRIA prior-stroke vs no-prior-stroke
  age-column flip, and a Tisdale 6 → 7 (low → moderate) flip — a [spec-v11](spec-v11.md)
  audit log, and a passing [spec-v29](spec-v29.md) §3 check.
- Every compute function uses `lib/num.js` and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with **zero non-finite leaks**.
- `cha2ds2-va` and `chads-65` carry `accessed` + a `docs/citation-staleness.md` row;
  the Class-A trio carry none (journal-named citations confirmed not to trip
  `ISSUER_PATTERN`).
- `UTILITIES.length` is **437** (or the then-current count + 5 if specs land out of
  order) and all catalog-truth surfaces ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v101 with the +5 catalog delta.

## 7. Out of scope for v101

- **No ECG-waveform parsing** — `tisdale-qtc` takes the clinician's admission QTc and
  the drug/electrolyte flags, not a raw tracing; `qtc-suite` (E) still computes the
  corrected interval and is cross-linked, not replaced.
- **No CHADS₂/CHADS-VASc duplication** — the existing `chads` combined view stays; the
  new `chads2` and `cha2ds2-va` are distinct standalone tiles that cross-link it so the
  CHADS₂ → VASc → 2024-VA migration reads in one place.
- **No auto-anticoagulation or auto-dosing order** — each tile reports the score/band or
  pathway verdict and the source's stated interpretation; the start/stop/agent decision
  stays with the clinician and local protocol.
